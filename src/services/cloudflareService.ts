export interface CloudflareImage {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  contentType: string;
  etag: string;
}

export interface CloudflareFolder {
  name: string;
  path: string;
  imageCount: number;
  thumbnail?: string;
  lastModified: Date;
}

class CloudflareService {
  private cloudflareDomain: string;
  private r2Endpoint: string;
  private accountId: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucketName: string;
  private baseUrl: string;

  constructor() {
    this.cloudflareDomain = import.meta.env.VITE_CLOUDFLARE_DOMAIN || '';
    this.r2Endpoint = import.meta.env.VITE_CLOUDFLARE_R2_ENDPOINT || '';
    this.accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '';
    this.accessKeyId = import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID || '';
    this.secretAccessKey = import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY || '';
    this.bucketName = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || '';
    
    // Use Netlify dev server port in development
    this.baseUrl = import.meta.env.DEV ? 'http://localhost:8888' : '';
  }

  /**
   * List all folders in the R2 bucket via Netlify function
   */
  async listFolders(prefix: string = ''): Promise<CloudflareFolder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/cloudflare-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'listFolders',
          folderPath: prefix,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const folders = data.folders || [];
      
      // Convert lastModified strings back to Date objects
      return folders.map((folder: any) => ({
        ...folder,
        lastModified: new Date(folder.lastModified)
      }));
    } catch (error) {
      console.error('Error listing folders:', error);
      throw new Error('Failed to list folders from Cloudflare');
    }
  }

  /**
   * List all images in a specific folder via Netlify function
   */
  async listImagesInFolder(folderPath: string): Promise<CloudflareImage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/cloudflare-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'listImages',
          folderPath,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const images = data.images || [];
      
      // Convert lastModified strings back to Date objects
      return images.map((image: any) => ({
        ...image,
        lastModified: new Date(image.lastModified)
      }));
    } catch (error) {
      console.error('Error listing images in folder:', error);
      throw new Error('Failed to list images from Cloudflare');
    }
  }

  /**
   * Get a specific image by key
   */
  async getImage(key: string): Promise<CloudflareImage | null> {
    try {
      // For individual images, we can construct the URL directly
      const url = this.getCloudflareUrl(key);
      
      // Make a HEAD request to get metadata
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        return null;
      }

      return {
        key,
        url,
        size: parseInt(response.headers.get('content-length') || '0'),
        lastModified: new Date(response.headers.get('last-modified') || Date.now()),
        contentType: response.headers.get('content-type') || this.getContentType(key),
        etag: response.headers.get('etag') || '',
      };
    } catch (error) {
      console.error('Error getting image:', error);
      return null;
    }
  }

  /**
   * Check if a file is an image based on its extension
   */
  private isImageFile(key: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const extension = key.toLowerCase().substring(key.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  /**
   * Get content type based on file extension
   */
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

  /**
   * Generate Cloudflare URL for an object
   */
  private getCloudflareUrl(key: string): string {
    // Use the Carioca Coastal Club images domain
    const domain = 'images.cariocacoastalclub.com';
    return `https://${domain}/${key}`;
  }

  /**
   * Get image dimensions from URL (requires image to be loaded)
   */
  async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for dimension calculation'));
      };
      img.src = url;
    });
  }

  /**
   * Generate mobile-optimized URL (if your Cloudflare distribution supports it)
   */
  getMobileOptimizedUrl(url: string, width: number = 1200, height: number = 1600): string {
    // This assumes your Cloudflare distribution has Image Resizing or similar
    // to handle mobile image optimization
    // You can customize this based on your setup
    return `${url}?w=${width}&h=${height}&fit=crop`;
  }

  /**
   * Check if Cloudflare is properly configured
   */
  isConfigured(): boolean {
    return !!this.cloudflareDomain;
  }

  /**
   * Upload an image to Cloudflare R2
   */
  async uploadImage(file: File, folder?: string): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
    try {
      console.log('📤 Starting image upload to Cloudflare:', {
        fileName: file.name,
        fileSize: file.size,
        folder: folder || 'uploads'
      });

      // Convert file to base64
      const base64 = await this.fileToBase64(file);

      const response = await fetch(`${this.baseUrl}/.netlify/functions/cloudflare-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          folder: folder || 'uploads',
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📤 Upload result:', result);
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Convert a file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

export const cloudflareService = new CloudflareService();
