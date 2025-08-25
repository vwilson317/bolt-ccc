# Cloudflare Photo Gallery Setup

This document explains how to set up Cloudflare integration for the photo gallery feature.

## Overview

The photo gallery now supports querying images from Cloudflare R2 storage. This provides:
- Fast, global image delivery via Cloudflare's network
- Cost-effective object storage with R2
- Automatic image optimization
- Secure access to your image assets
- Scalable storage solution

## Prerequisites

1. Cloudflare account with R2 access
2. R2 bucket with your images organized in folders
3. Custom domain (optional) for serving images
4. API tokens with appropriate permissions

## Cloudflare Setup

### 1. Create R2 Bucket

1. Go to Cloudflare Dashboard > R2 Object Storage
2. Click "Create bucket"
3. Enter a bucket name (e.g., `my-photo-gallery-bucket`)
4. Choose your preferred location
5. Click "Create bucket"

### 2. Upload Images

Organize your images in folders by date or event:

```
my-photo-gallery-bucket/
├── 2025-01-15/
│   ├── IMG_001.jpg
│   ├── IMG_002.jpg
│   └── IMG_003.jpg
├── 2025-01-20/
│   ├── IMG_004.jpg
│   └── IMG_005.jpg
└── 2025-02-01/
    ├── IMG_006.jpg
    └── IMG_007.jpg
```

### 3. Create API Token

1. Go to Cloudflare Dashboard > My Profile > API Tokens
2. Click "Create Token"
3. Use "Custom token" template
4. Configure permissions:
   - **Account**: R2 Object Storage (Read)
   - **Zone**: Include all zones (if using custom domain)
5. Set account and zone resources as needed
6. Click "Continue to summary" and "Create Token"

### 4. Create R2 API Token (Alternative)

1. Go to Cloudflare Dashboard > R2 Object Storage
2. Click on your bucket
3. Go to "Manage R2 API tokens"
4. Click "Create API token"
5. Select "Object Read" permissions
6. Copy the Access Key ID and Secret Access Key

### 5. Configure Custom Domain (Optional)

1. Go to Cloudflare Dashboard > R2 Object Storage
2. Click on your bucket
3. Go to "Settings" > "Custom Domains"
4. Click "Connect Domain"
5. Enter your custom domain (e.g., `images.yourdomain.com`)
6. Follow the DNS configuration instructions

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Cloudflare Configuration
VITE_CLOUDFLARE_ACCOUNT_ID=your-account-id
VITE_CLOUDFLARE_ACCESS_KEY_ID=your-access-key-id
VITE_CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-access-key

# R2 Configuration
VITE_CLOUDFLARE_R2_BUCKET_NAME=my-photo-gallery-bucket
VITE_CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Custom Domain (optional)
VITE_CLOUDFLARE_DOMAIN=images.yourdomain.com
```

### Netlify Environment Variables

For production deployment on Netlify, add these variables in your Netlify dashboard:

1. Go to Site Settings > Environment Variables
2. Add each variable:
   - `VITE_CLOUDFLARE_ACCOUNT_ID`
   - `VITE_CLOUDFLARE_ACCESS_KEY_ID`
   - `VITE_CLOUDFLARE_SECRET_ACCESS_KEY`
   - `VITE_CLOUDFLARE_R2_BUCKET_NAME`
   - `VITE_CLOUDFLARE_R2_ENDPOINT`
   - `VITE_CLOUDFLARE_DOMAIN`

## Folder Structure Guidelines

For optimal performance and organization:

### Date-based Structure (Recommended)
```
bucket/
├── 2025-01-15/
│   ├── copacabana/
│   │   ├── IMG_001.jpg
│   │   └── IMG_002.jpg
│   └── ipanema/
│       ├── IMG_003.jpg
│       └── IMG_004.jpg
└── 2025-01-20/
    └── leblon/
        ├── IMG_005.jpg
        └── IMG_006.jpg
```

### Event-based Structure
```
bucket/
├── summer-festival-2025/
│   ├── day-1/
│   │   ├── IMG_001.jpg
│   │   └── IMG_002.jpg
│   └── day-2/
│       ├── IMG_003.jpg
│       └── IMG_004.jpg
└── beach-party-2025/
    ├── IMG_005.jpg
    └── IMG_006.jpg
```

## Image Optimization

### Cloudflare Image Optimization

Configure your custom domain for image optimization:

1. **Image Resizing**: Use Cloudflare Image Resizing
2. **WebP Conversion**: Automatic WebP delivery
3. **Compression**: Enable compression for better performance

### Mobile Optimization

The system automatically generates mobile-optimized URLs. You can customize the parameters in `cloudflareService.getMobileOptimizedUrl()`.

## Testing

### Local Development

1. Set up your environment variables
2. Run the development server: `npm run dev`
3. Navigate to the Photos page
4. Check browser console for any errors

### Testing the Netlify Function

Test the Cloudflare integration function:

```bash
npm run netlify:dev
```

Then test the endpoint:

```bash
curl -X POST http://localhost:8888/.netlify/functions/cloudflare-images \
  -H "Content-Type: application/json" \
  -d '{"action": "listFolders"}'
```

### Testing Cloudflare Integration

```bash
npm run test:cloudflare
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your custom domain is properly configured
2. **Access Denied**: Check API token permissions
3. **Images Not Loading**: Verify R2 bucket and custom domain setup
4. **Function Errors**: Check Netlify function logs

### Debug Mode

Enable debug logging by adding to your environment:

```env
VITE_DEBUG_CLOUDFLARE=true
```

### Fallback Behavior

If Cloudflare is not configured, the system automatically falls back to mock data, ensuring the application continues to work.

## Security Considerations

1. **API Tokens**: Use least privilege principle
2. **R2 Permissions**: Restrict access to read-only operations
3. **Environment Variables**: Never commit credentials to version control
4. **HTTPS**: Always use HTTPS for production

## Performance Optimization

1. **Image Formats**: Use WebP for better compression
2. **Caching**: Leverage Cloudflare's global cache
3. **CDN**: Use Cloudflare's global edge locations
4. **Compression**: Enable compression for better performance

## Monitoring

Monitor your Cloudflare R2 usage:
- R2 storage metrics
- Bandwidth usage
- Request counts
- Error rates

## Cost Optimization

1. **Storage Class**: Use appropriate storage class
2. **Caching**: Optimize cache settings
3. **Image Optimization**: Use Cloudflare's image optimization features
4. **Lifecycle Policies**: Implement lifecycle policies for old images

## Benefits of Cloudflare R2

1. **Cost-Effective**: No egress fees
2. **Global Network**: 200+ locations worldwide
3. **S3-Compatible**: Easy migration from AWS S3
4. **Integrated**: Works seamlessly with Cloudflare's CDN
5. **Security**: Enterprise-grade security features

## Migration from AWS S3

If migrating from AWS S3 to Cloudflare R2:

1. **Data Migration**: Use tools like `rclone` or `s3cmd`
2. **Update Configuration**: Replace AWS credentials with Cloudflare credentials
3. **Update URLs**: Replace S3 URLs with R2 URLs
4. **Test Thoroughly**: Verify all functionality works correctly

## Conclusion

The Cloudflare photo gallery implementation provides a production-ready solution for serving images from Cloudflare R2. The architecture ensures security, performance, and reliability while maintaining backward compatibility with the existing mock data system.
