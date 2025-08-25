import { mockPhotoDates, mockPhotoGalleries } from '../data/photoMockData';

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

  async getPhotoDates(): Promise<PhotoDate[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.mockPhotoDates;
  }

  async getPhotoGallery(dateId: string): Promise<PhotoGalleryData | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.mockPhotoGalleries[dateId] || null;
  }

  async searchPhotoDates(query: string): Promise<PhotoDate[]> {
    // Simulate API delay
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
}

export const photoService = new PhotoService();
