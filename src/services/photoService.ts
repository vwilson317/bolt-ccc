import { mockPhotoDates, mockPhotoGalleries } from '../data/photoMockData';
import { cloudflareService, CloudflareImage, CloudflareFolder } from './cloudflareService';

export interface Location {
  name: string;
  barracaId?: string; // ID to link to barraca detail page
}

export interface Photo {
  id: string;
  url: string;
  urlMobile?: string; // Mobile-optimized image URL
  title?: string;
  description?: string;
  location?: string;
  timestamp?: string;
  width: number;
  height: number;
}

export interface PhotoDate {
  id: string;
  date: string;
  title: string;
  photoCount: number;
  archiveCount?: number; // Total photos in archive (usually higher than photoCount)
  thumbnail?: string;
  description?: string;
  location?: string | Location[]; // Can be string or array of locations
}

export interface PhotoGalleryData {
  id: string;
  date: string;
  title: string;
  description?: string;
  location?: string | Location[]; // Can be string or array of locations
  photos: Photo[];
  archiveUrl?: string; // Google Photos archive URL for this specific gallery
}

class PhotoService {
  private mockPhotoDates: PhotoDate[] = mockPhotoDates;
  private mockPhotoGalleries: Record<string, PhotoGalleryData> = mockPhotoGalleries;
  private useCloudflare: boolean = false;

  constructor() {
    // Check if Cloudflare is configured
    this.useCloudflare = cloudflareService.isConfigured();
  }

  async getPhotoDates(): Promise<PhotoDate[]> {
    // Always use mock data for the Photos page (list of photo dates)
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.mockPhotoDates;
  }

  async getPhotoGallery(dateId: string): Promise<PhotoGalleryData | null> {
    // Use Cloudflare for individual photo galleries if configured
    if (this.useCloudflare) {
      return this.getPhotoGalleryFromCloudflare(dateId);
    }
    
    // Fallback to mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.mockPhotoGalleries[dateId] || null;
  }

  async searchPhotoDates(query: string): Promise<PhotoDate[]> {
    // Always use mock data for search (since Photos page uses mock data)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const lowercaseQuery = query.toLowerCase();
    return this.mockPhotoDates.filter(date => {
      const titleMatch = date.title.toLowerCase().includes(lowercaseQuery);
      
      // Handle location search for both string and Location[] types
      let locationMatch = false;
      if (typeof date.location === 'string') {
        locationMatch = date.location.toLowerCase().includes(lowercaseQuery);
      } else if (Array.isArray(date.location)) {
        locationMatch = date.location.some(loc => 
          loc.name.toLowerCase().includes(lowercaseQuery)
        );
      }
      
      return titleMatch || locationMatch;
    });
  }

  // Cloudflare implementation methods
  private async getPhotoDatesFromCloudflare(): Promise<PhotoDate[]> {
    try {
      // List folders specifically in the gallery directory
      const folders = await cloudflareService.listFolders('gallery/');
      
      return folders.map(folder => {
        // Extract date from folder name (assuming format like "2025-01-15" or "2025/01/15")
        const dateMatch = folder.name.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}` : folder.name;
        
        return {
          id: folder.name,
          date,
          title: this.formatFolderTitle(folder.name),
          photoCount: folder.imageCount,
          thumbnail: folder.thumbnail,
          description: `Photos from ${this.formatFolderTitle(folder.name)}`,
          location: 'Various locations', // You can enhance this by parsing folder structure
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching photo dates from Cloudflare:', error);
      // Fallback to mock data
      return this.mockPhotoDates;
    }
  }

  private async getPhotoGalleryFromCloudflare(dateId: string): Promise<PhotoGalleryData | null> {
    try {
      // Add gallery/ prefix to the folder path
      const folderPath = `gallery/${dateId}`;
      const images = await cloudflareService.listImagesInFolder(folderPath);
      
      if (images.length === 0) {
        return null;
      }

      const photos: Photo[] = await Promise.all(
        images.map(async (image, index) => {
          // Try to get image dimensions
          let width = 800;
          let height = 600;
          
          try {
            const dimensions = await cloudflareService.getImageDimensions(image.url);
            width = dimensions.width;
            height = dimensions.height;
          } catch (error) {
            console.warn('Could not get dimensions for image:', image.key);
          }

          // Generate mobile-optimized URL
          const urlMobile = cloudflareService.getMobileOptimizedUrl(image.url);

          return {
            id: image.key,
            url: image.url,
            urlMobile,
            title: this.generatePhotoTitle(image.key, index),
            description: `Photo taken on ${new Date(image.lastModified).toLocaleDateString()}`,
            location: this.extractLocationFromKey(image.key),
            timestamp: image.lastModified.toISOString(),
            width,
            height,
          };
        })
      );

      // Extract date from folder name
      const dateMatch = dateId.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}` : dateId;

      return {
        id: dateId,
        date,
        title: this.formatFolderTitle(dateId),
        description: `Gallery containing ${photos.length} photos from ${this.formatFolderTitle(dateId)}`,
        location: 'Various locations', // You can enhance this by parsing folder structure
        photos,
        archiveUrl: this.getGooglePhotosArchiveUrl(),
      };
    } catch (error) {
      console.error('Error fetching photo gallery from Cloudflare:', error);
      // Fallback to mock data
      return this.mockPhotoGalleries[dateId] || null;
    }
  }

  private async searchPhotoDatesFromCloudflare(query: string): Promise<PhotoDate[]> {
    try {
      const allDates = await this.getPhotoDatesFromCloudflare();
      const lowercaseQuery = query.toLowerCase();
      
      return allDates.filter(date => {
        const titleMatch = date.title.toLowerCase().includes(lowercaseQuery);
        const locationMatch = typeof date.location === 'string' && 
          date.location.toLowerCase().includes(lowercaseQuery);
        
        return titleMatch || locationMatch;
      });
    } catch (error) {
      console.error('Error searching photo dates from Cloudflare:', error);
      return [];
    }
  }

  // Helper methods
  private formatFolderTitle(folderName: string): string {
    // Convert folder name to a readable title
    // Example: "2025-01-15" -> "January 15, 2025"
    const dateMatch = folderName.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // If not a date format, just capitalize and replace dashes/underscores
    return folderName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private generatePhotoTitle(key: string, index: number): string {
    // Extract filename without extension
    const filename = key.split('/').pop()?.split('.')[0] || `Photo ${index + 1}`;
    
    // Convert filename to title case
    return filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private extractLocationFromKey(key: string): string {
    // Extract location from folder structure
    // Example: "2025-01-15/copacabana/IMG_001.jpg" -> "Copacabana"
    const parts = key.split('/');
    if (parts.length > 1) {
      const locationPart = parts[1];
      return locationPart
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Unknown location';
  }

  // Method to add new photo gallery (for future admin functionality)
  async addPhotoGallery(gallery: PhotoGalleryData): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.mockPhotoGalleries[gallery.id] = gallery;
    
    // Update the photo dates list
    const existingDateIndex = this.mockPhotoDates.findIndex(date => date.id === gallery.id);
    const photoDate: PhotoDate = {
      id: gallery.id,
      date: gallery.date,
      title: gallery.title,
      photoCount: gallery.photos.length,
      thumbnail: gallery.photos[0]?.url,
      description: gallery.description,
      location: gallery.location
    };
    
    if (existingDateIndex >= 0) {
      this.mockPhotoDates[existingDateIndex] = photoDate;
    } else {
      this.mockPhotoDates.push(photoDate);
    }
  }

  // Method to get Google Photos archive URL
  getGooglePhotosArchiveUrl(): string {
    // Replace with your actual Google Photos album URL
    return 'https://photos.google.com/share/AF1QipM...'; // Example URL
  }

  // Method to check if Cloudflare is available
  isCloudflareAvailable(): boolean {
    return this.useCloudflare;
  }
}

export const photoService = new PhotoService();
