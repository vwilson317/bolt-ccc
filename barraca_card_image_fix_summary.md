# Barraca Card Image Dimension Fix

## Problem
The barraca cards were displaying images with inconsistent dimensions because the code was falling back to vertical images when horizontal images weren't available. This caused vertical images to appear stretched or improperly cropped in the horizontal card layout. Additionally, the images were being cropped due to fixed height containers.

## Solution
1. Modified the image selection logic to prioritize horizontal images and use a placeholder when horizontal images are not available, instead of falling back to vertical images.
2. Updated the barraca grid to use a 3:2 aspect ratio container with `object-contain` to display the full photo without cropping.

## Changes Made

### 1. BarracaGrid.tsx
- Changed main card image from `barraca.photos.horizontal[0] || barraca.photos.vertical[0]` to `barraca.photos.horizontal[0] || '/api/placeholder/600/400'`
- Updated StoryRing component image URL with the same logic
- **NEW**: Changed image container from fixed height (`h-40 md:h-48`) to 3:2 aspect ratio (`aspect-[3/2]`)
- **NEW**: Changed image object-fit from `object-cover` to `object-contain` to show full photo without cropping
- **NEW**: Added gray background (`bg-gray-100`) to handle any empty space around images

### 2. StoryCarousel.tsx
- Updated StoryRing component to use horizontal images only with 3:2 placeholder fallback

### 3. BarracaDetail.tsx
- Updated hero image to use horizontal images only with 3:2 placeholder fallback

### 4. BarracaPageDetail.tsx
- Updated hero image to use horizontal images only with 3:2 placeholder fallback

### 5. Admin.tsx
- Updated admin table thumbnail to use horizontal images only with 3:2 placeholder fallback

## Preserved Logic
- **HeroCarousel.tsx**: Kept the original logic because it has different behavior for mobile vs desktop:
  - Mobile: Prefers vertical images (appropriate for hero sections)
  - Desktop: Prefers horizontal images
  - This is correct behavior for a hero carousel

## Result
- Barraca cards now consistently display with proper horizontal image dimensions in a 3:2 aspect ratio
- Cards without horizontal images show a 3:2 placeholder instead of distorted vertical images
- Full photos are displayed without cropping using `object-contain`
- The overall grid layout is more consistent and visually appealing
- Hero carousel maintains its responsive image selection logic
- Any empty space around images is handled with a subtle gray background

## Database Structure
The database already supports this with the `photos` JSON structure:
```json
{
  "horizontal": ["url1", "url2", ...],
  "vertical": ["url1", "url2", ...]
}
```

This fix ensures that horizontal layouts consistently use horizontal images, improving the visual consistency of the application.