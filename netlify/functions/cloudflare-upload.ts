import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { Handler } from '@netlify/functions';

interface UploadRequest {
  file: string; // Base64 encoded file
  fileName: string;
  folder?: string;
  contentType: string;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

class CloudflareUploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private cloudflareDomain: string;

  constructor() {
    console.log('🔧 Initializing CloudflareUploadService...');
    
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
    
    console.log('🔧 CloudflareUploadService initialized with:', {
      endpoint: process.env.VITE_CLOUDFLARE_R2_ENDPOINT ? '✅ Set' : '❌ Not set',
      accessKeyId: process.env.VITE_CLOUDFLARE_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set',
      secretAccessKey: process.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set',
      bucketName: this.bucketName || '❌ Not set',
      cloudflareDomain: this.cloudflareDomain || '❌ Not set'
    });
  }

  async uploadImage(request: UploadRequest): Promise<UploadResponse> {
    try {
      console.log('📤 Starting image upload:', {
        fileName: request.fileName,
        folder: request.folder,
        contentType: request.contentType,
        fileSize: request.file.length
      });

      // Generate unique key for the file
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = request.fileName.split('.').pop() || 'jpg';
      const folder = request.folder || 'uploads';
      const key = `${folder}/${timestamp}-${randomId}.${extension}`;

      console.log('🔑 Generated key:', key);

      // Convert base64 to buffer
      const fileBuffer = Buffer.from(request.file, 'base64');

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: request.contentType,
        CacheControl: 'public, max-age=31536000', // 1 year cache
      });

      console.log('📤 Uploading to R2...');
      await this.s3Client.send(command);
      console.log('✅ Upload successful');

      // Generate the public URL
      const url = this.getCloudflareUrl(key);

      return {
        success: true,
        url,
        key
      };
    } catch (error) {
      console.error('❌ Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  private getCloudflareUrl(key: string): string {
    // Use the Carioca Coastal Club images domain
    const domain = 'images.cariocacoastalclub.com';
    const url = `https://${domain}/${key}`;
    console.log('🔍 getCloudflareUrl (Carioca Coastal Club domain):', { key, domain, url });
    return url;
  }
}

const uploadService = new CloudflareUploadService();

export const handler: Handler = async (event) => {
  console.log('🚀 cloudflare-upload function called');
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ Invalid HTTP method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = event.body || '{}';
    console.log('📋 Parsing request body...');
    
    const request: UploadRequest = JSON.parse(body);
    console.log('📋 Parsed request:', {
      fileName: request.fileName,
      folder: request.folder,
      contentType: request.contentType,
      hasFile: !!request.file
    });

    // Validate required fields
    if (!request.file || !request.fileName || !request.contentType) {
      console.log('❌ Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: file, fileName, contentType' 
        }),
      };
    }

    // Validate file size (max 10MB)
    const fileSizeInBytes = request.file.length * 0.75; // Approximate base64 to bytes
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    
    if (fileSizeInBytes > maxSizeInBytes) {
      console.log('❌ File too large:', fileSizeInBytes, 'bytes');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File too large. Maximum size is 10MB.' 
        }),
      };
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(request.contentType)) {
      console.log('❌ Invalid content type:', request.contentType);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid content type. Allowed types: ' + allowedTypes.join(', ') 
        }),
      };
    }

    console.log('🎯 Processing upload...');
    const result = await uploadService.uploadImage(request);

    if (result.success) {
      console.log('✅ Upload completed successfully');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    } else {
      console.log('❌ Upload failed:', result.error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(result),
      };
    }
  } catch (error) {
    console.error('❌ Error in cloudflare-upload function:', error);
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
