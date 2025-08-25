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
    console.log('📁 listFolders called with prefix:', prefix);
    
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        Delimiter: '/',
      });

      console.log('📁 Sending ListObjectsV2Command with:', {
        bucket: this.bucketName,
        prefix,
        delimiter: '/'
      });

      const response = await this.s3Client.send(command);
      console.log('📁 ListObjectsV2Command response received:', {
        hasCommonPrefixes: !!response.CommonPrefixes,
        commonPrefixesCount: response.CommonPrefixes?.length || 0,
        hasContents: !!response.Contents,
        contentsCount: response.Contents?.length || 0
      });

      const folders: CloudflareFolder[] = [];

      if (response.CommonPrefixes) {
        console.log('📁 Processing common prefixes...');
        for (const commonPrefix of response.CommonPrefixes) {
          if (commonPrefix.Prefix) {
            const folderName = commonPrefix.Prefix.replace(prefix, '').replace('/', '');
            const folderPath = commonPrefix.Prefix;
            
            console.log('📁 Processing folder:', { folderName, folderPath });
            
            // Get image count and thumbnail for this folder
            const folderImages = await this.listImagesInFolder(folderPath);
            
            folders.push({
              name: folderName,
              path: folderPath,
              imageCount: folderImages.length,
              thumbnail: folderImages[0]?.url,
              lastModified: folderImages[0]?.lastModified || new Date(),
            });
            
            console.log('📁 Added folder:', {
              name: folderName,
              imageCount: folderImages.length,
              hasThumbnail: !!folderImages[0]?.url
            });
          }
        }
      }

      console.log('📁 Returning folders:', folders.length);
      return folders;
    } catch (error) {
      console.error('❌ Error listing folders:', error);
      throw new Error('Failed to list folders from Cloudflare R2');
    }
  }

  async listImagesInFolder(folderPath: string): Promise<CloudflareImage[]> {
    console.log('🖼️ listImagesInFolder called with folderPath:', folderPath);
    
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folderPath,
      });

      console.log('🖼️ Sending ListObjectsV2Command for folder:', {
        bucket: this.bucketName,
        prefix: folderPath
      });

      const response = await this.s3Client.send(command);
      console.log('🖼️ ListObjectsV2Command response received:', {
        hasContents: !!response.Contents,
        contentsCount: response.Contents?.length || 0
      });

      const images: CloudflareImage[] = [];

      if (response.Contents) {
        console.log('🖼️ Processing contents...');
        for (const object of response.Contents) {
          if (object.Key && this.isImageFile(object.Key)) {
            const imageUrl = this.getCloudflareUrl(object.Key);
            
            const image = {
              key: object.Key,
              url: imageUrl,
              size: object.Size || 0,
              lastModified: object.LastModified || new Date(),
              contentType: this.getContentType(object.Key),
              etag: object.ETag || '',
            };
            
            images.push(image);
            console.log('🖼️ Added image:', {
              key: object.Key,
              size: object.Size,
              contentType: image.contentType,
              url: imageUrl
            });
          } else if (object.Key) {
            console.log('🖼️ Skipping non-image file:', object.Key);
          }
        }
      }

      // Sort by last modified date (newest first)
      const sortedImages = images.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
      console.log('🖼️ Returning sorted images:', sortedImages.length);
      return sortedImages;
    } catch (error) {
      console.error('❌ Error listing images in folder:', error);
      throw new Error('Failed to list images from Cloudflare R2');
    }
  }

  private isImageFile(key: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const extension = key.toLowerCase().substring(key.lastIndexOf('.'));
    const isImage = imageExtensions.includes(extension);
    console.log('🔍 isImageFile check:', { key, extension, isImage });
    return isImage;
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
    const contentType = contentTypes[extension] || 'application/octet-stream';
    console.log('🔍 getContentType:', { key, extension, contentType });
    return contentType;
  }

  private getCloudflareUrl(key: string): string {
    if (!this.cloudflareDomain) {
      // Fallback to R2 URL if Cloudflare domain is not configured
      const r2Url = `https://${this.bucketName}.r2.cloudflarestorage.com/${key}`;
      console.log('🔍 getCloudflareUrl (R2 fallback):', { key, url: r2Url });
      return r2Url;
    }
    
    // Remove trailing slash from domain if present
    const domain = this.cloudflareDomain.replace(/\/$/, '');
    const url = `https://${domain}/${key}`;
    console.log('🔍 getCloudflareUrl (custom domain):', { key, domain, url });
    return url;
  }
}

const cloudflareService = new CloudflareService();

export const handler: Handler = async (event) => {
  console.log('🚀 cloudflare-images function called');
  console.log('📋 Event details:', {
    httpMethod: event.httpMethod,
    path: event.path,
    body: event.body ? 'Present' : 'Not present',
    headers: event.headers
  });

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request');
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const body = event.body || '{}';
    console.log('📋 Parsing request body:', body);
    
    const { path, action, folderPath } = JSON.parse(body);
    console.log('📋 Parsed request parameters:', { path, action, folderPath });

    if (!action) {
      console.log('❌ No action provided in request');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Action is required' }),
      };
    }

    console.log('🎯 Processing action:', action);

    switch (action) {
      case 'listFolders':
        console.log('📁 Action: listFolders');
        const folders = await cloudflareService.listFolders(folderPath);
        console.log('📁 Returning folders:', folders.length);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ folders }),
        };

      case 'listImages':
        console.log('🖼️ Action: listImages');
        if (!folderPath) {
          console.log('❌ No folderPath provided for listImages action');
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Folder path is required for listing images' }),
          };
        }
        const images = await cloudflareService.listImagesInFolder(folderPath);
        console.log('🖼️ Returning images:', images.length);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ images }),
        };

      default:
        console.log('❌ Invalid action:', action);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('❌ Error in cloudflare-images function:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
