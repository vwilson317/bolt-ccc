# Barraca Card Image Dimension Fix

## Problem
The barraca cards were displaying images with inconsistent dimensions because the code was falling back to vertical images when horizontal images weren't available. This caused vertical images to appear stretched or improperly cropped in the horizontal card layout.

## Solution
Modified the image selection logic to prioritize horizontal images and use a placeholder when horizontal images are not available, instead of falling back to vertical images.

## Changes Made

### 1. BarracaGrid.tsx
- Changed main card image from `barraca.photos.horizontal[0] || barraca.photos.vertical[0]` to `barraca.photos.horizontal[0] || '/api/placeholder/400/320'`
- Updated StoryRing component image URL with the same logic

### 2. StoryCarousel.tsx
- Updated StoryRing component to use horizontal images only with placeholder fallback

### 3. BarracaDetail.tsx
- Updated hero image to use horizontal images only with placeholder fallback

### 4. BarracaPageDetail.tsx
- Updated hero image to use horizontal images only with placeholder fallback

### 5. Admin.tsx
- Updated admin table thumbnail to use horizontal images only with placeholder fallback

## Preserved Logic
- **HeroCarousel.tsx**: Kept the original logic because it has different behavior for mobile vs desktop:
  - Mobile: Prefers vertical images (appropriate for hero sections)
  - Desktop: Prefers horizontal images
  - This is correct behavior for a hero carousel

## Result
- Barraca cards now consistently display with proper horizontal image dimensions
- Cards without horizontal images show a placeholder instead of distorted vertical images
- The overall grid layout is more consistent and visually appealing
- Hero carousel maintains its responsive image selection logic

## Database Structure
The database already supports this with the `photos` JSON structure:
```json
{
  "horizontal": ["url1", "url2", ...],
  "vertical": ["url1", "url2", ...]
}
```

This fix ensures that horizontal layouts consistently use horizontal images, improving the visual consistency of the application.