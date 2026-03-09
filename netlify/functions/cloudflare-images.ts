import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Handler } from '@netlify/functions';

interface CloudflareImage {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  contentType: string;
  etag: string;
}

interface CloudflareFolder {
  name: string;
  path: string;
  imageCount: number;
  thumbnail?: string;
  lastModified: Date;
}

class CloudflareService {
  private s3Client: S3Client;
  private bucketName: string;
  private cloudflareDomain: string;

  constructor() {
    console.log('🔧 Initializing CloudflareService...');
    
    // Initialize S3 client for Cloudflare R2 (R2 is S3-compatible)
    this.s3Client = new S3Client({
      region: 'auto', // Cloudflare R2 uses 'auto' region
      endpoint: process.env.VITE_CLOUDFLARE_R2_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.VITE_CLOUDFLARE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY || '',
      },
    });

    this.bucketName = process.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || '';
    this.cloudflareDomain = process.env.VITE_CLOUDFLARE_DOMAIN || '';
    
    console.log('🔧 CloudflareService initialized with:', {
      endpoint: process.env.VITE_CLOUDFLARE_R2_ENDPOINT ? '✅ Set' : '❌ Not set',
      accessKeyId: process.env.VITE_CLOUDFLARE_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set',
      secretAccessKey: process.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set',
      bucketName: this.bucketName || '❌ Not set',
      cloudflareDomain: this.cloudflareDomain || '❌ Not set'
    });
  }

  async listFolders(prefix: string = ''): Promise<CloudflareFolder[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await this.s3Client.send(command);

      const commonPrefixes = response.CommonPrefixes || [];

      // If no common prefixes found, try alternative approach for nested structures
      if (commonPrefixes.length === 0 && prefix === '') {
        return this.listFoldersAlternative();
      }

      // Fetch all folder image lists in parallel instead of sequentially
      const folderEntries = await Promise.all(
        commonPrefixes
          .filter(cp => !!cp.Prefix)
          .map(async (cp) => {
            const folderName = cp.Prefix!.replace(prefix, '').replace('/', '');
            const folderPath = cp.Prefix!;
            const folderImages = await this.listImagesInFolder(folderPath);
            return {
              name: folderName,
              path: folderPath,
              imageCount: folderImages.length,
              thumbnail: folderImages[0]?.url,
              lastModified: folderImages[0]?.lastModified || new Date(),
            };
          })
      );

      return folderEntries;
    } catch (error) {
      console.error('Error listing folders:', error);
      throw new Error('Failed to list folders from Cloudflare R2');
    }
  }

  async listFoldersAlternative(): Promise<CloudflareFolder[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1000,
      });

      const response = await this.s3Client.send(command);
      const folderMap = new Map<string, CloudflareImage[]>();

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && this.isImageFile(object.Key)) {
            const lastSlashIndex = object.Key.lastIndexOf('/');
            if (lastSlashIndex > 0) {
              const folderPath = object.Key.substring(0, lastSlashIndex + 1);
              const image: CloudflareImage = {
                key: object.Key,
                url: this.getCloudflareUrl(object.Key),
                size: object.Size || 0,
                lastModified: object.LastModified || new Date(),
                contentType: this.getContentType(object.Key),
                etag: object.ETag || '',
              };
              if (!folderMap.has(folderPath)) folderMap.set(folderPath, []);
              folderMap.get(folderPath)!.push(image);
            }
          }
        }
      }

      const folders: CloudflareFolder[] = [];
      for (const [folderPath, images] of folderMap) {
        const folderName = folderPath.split('/').filter(Boolean).pop() || folderPath;
        const sortedImages = images.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
        folders.push({
          name: folderName,
          path: folderPath,
          imageCount: sortedImages.length,
          thumbnail: sortedImages[0]?.url,
          lastModified: sortedImages[0]?.lastModified || new Date(),
        });
      }

      return folders.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    } catch (error) {
      console.error('Error in alternative folder listing:', error);
      return [];
    }
  }

  async listImagesInFolder(folderPath: string): Promise<CloudflareImage[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folderPath,
      });

      const response = await this.s3Client.send(command);
      const images: CloudflareImage[] = [];

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && this.isImageFile(object.Key)) {
            images.push({
              key: object.Key,
              url: this.getCloudflareUrl(object.Key),
              size: object.Size || 0,
              lastModified: object.LastModified || new Date(),
              contentType: this.getContentType(object.Key),
              etag: object.ETag || '',
            });
          }
        }
      }

      return images.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    } catch (error) {
      console.error('Error listing images in folder:', error);
      throw new Error('Failed to list images from Cloudflare R2');
    }
  }

  private isImageFile(key: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const extension = key.toLowerCase().substring(key.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  private getContentType(key: string): string {
    const extension = key.toLowerCase().substring(key.lastIndexOf('.'));
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
    };
    return contentTypes[extension] || 'application/octet-stream';
  }

  private getCloudflareUrl(key: string): string {
    if (!this.cloudflareDomain) {
      return `https://${this.bucketName}.r2.cloudflarestorage.com/${key}`;
    }
    const domain = this.cloudflareDomain.replace(/\/$/, '');
    return `https://${domain}/${key}`;
  }
}

const cloudflareService = new CloudflareService();

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, folderPath } = JSON.parse(event.body || '{}');

    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Action is required' }),
      };
    }

    switch (action) {
      case 'listFolders': {
        const folders = await cloudflareService.listFolders(folderPath);
        return { statusCode: 200, headers, body: JSON.stringify({ folders }) };
      }

      case 'listGalleryFolders': {
        const folders = await cloudflareService.listFolders('gallery/');
        return { statusCode: 200, headers, body: JSON.stringify({ folders }) };
      }

      case 'listImages': {
        if (!folderPath) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Folder path is required for listing images' }),
          };
        }
        const images = await cloudflareService.listImagesInFolder(folderPath);
        return { statusCode: 200, headers, body: JSON.stringify({ images }) };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Error in cloudflare-images function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
