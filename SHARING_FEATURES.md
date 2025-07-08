# Multi-Language Sharing Features

## Overview

The Carioca Coastal Club app now includes comprehensive multi-language sharing functionality that allows users to share barracas across different social media platforms in their preferred language.

## Features

### 🌍 Multi-Language Support
- **English (en)**: "Check out {name} at {location}!"
- **Portuguese (pt)**: "Confira {name} em {location}!"
- **Spanish (es)**: "¡Mira {name} en {location}!"
- **French (fr)**: "Découvrez {name} à {location} !"

### 📱 Supported Platforms
- **WhatsApp**: Direct sharing via WhatsApp Web API
- **Facebook**: Share to Facebook timeline
- **Twitter**: Share to Twitter/X timeline
- **Instagram**: Copy link for Instagram sharing
- **Copy Link**: Copy to clipboard with fallback support
- **Native Share**: Uses device's native sharing when available

### 🎨 UI Components

#### ShareButton Component
```tsx
<ShareButton 
  barraca={barraca} 
  variant="dropdown" // 'icon' | 'button' | 'dropdown'
  size="md" // 'sm' | 'md' | 'lg'
/>
```

#### Variants
- **Icon**: Simple share icon (default)
- **Button**: Full button with text
- **Dropdown**: Dropdown menu with platform options

## Implementation

### Translation Keys
All sharing-related text is localized using the following translation keys:

```json
{
  "share": {
    "title": "Share this barraca",
    "message": "Check out {name} at {location}!",
    "copied": "Link copied to clipboard!",
    "sharing": "Sharing...",
    "error": "Error sharing. Please try again.",
    "shared_successfully": "Shared successfully!",
    "share_error": "Error sharing. Please try again.",
    "platforms": {
      "whatsapp": "Share on WhatsApp",
      "facebook": "Share on Facebook",
      "twitter": "Share on Twitter",
      "instagram": "Share on Instagram",
      "copy": "Copy Link"
    }
  }
}
```

### Usage Examples

#### Basic Icon Share
```tsx
import ShareButton from '../components/ShareButton';

<ShareButton barraca={barraca} />
```

#### Dropdown with Platform Options
```tsx
<ShareButton 
  barraca={barraca} 
  variant="dropdown" 
  size="lg"
/>
```

#### Full Button
```tsx
<ShareButton 
  barraca={barraca} 
  variant="button" 
  size="md"
/>
```

## Technical Details

### Browser Compatibility
- **Modern Browsers**: Uses `navigator.share()` API when available
- **Fallback**: Automatically falls back to clipboard copy for older browsers
- **Mobile**: Optimized for mobile sharing with platform-specific URLs

### Error Handling
- Graceful fallback when sharing fails
- User-friendly error messages in all supported languages
- Automatic retry mechanisms for clipboard operations

### Analytics Integration
The sharing functionality integrates with the existing analytics system to track:
- Share attempts by platform
- Success/failure rates
- Language preferences
- User engagement metrics

## Future Enhancements

### Planned Features
- **QR Code Generation**: Generate QR codes for easy sharing
- **Deep Linking**: Enhanced deep linking for better mobile experience
- **Social Media Preview**: Custom meta tags for better social media previews
- **Share Analytics**: Detailed analytics dashboard for sharing metrics

### Platform Expansions
- **Telegram**: Direct sharing to Telegram
- **Email**: Email sharing with pre-filled templates
- **SMS**: Text message sharing (mobile only)
- **LinkedIn**: Professional network sharing

## Testing

### Manual Testing Checklist
- [ ] Share functionality works in all supported languages
- [ ] Platform-specific sharing opens correct URLs
- [ ] Clipboard fallback works on desktop browsers
- [ ] Native sharing works on mobile devices
- [ ] Error messages display correctly
- [ ] UI components render properly in all variants

### Automated Testing
```bash
# Run TypeScript type checking
npx tsc --noEmit

# Run the development server
npm run dev
```

## Contributing

When adding new languages or platforms:

1. **Add translations** to all language files in `src/i18n/locales/`
2. **Update the ShareButton component** to support new platforms
3. **Test thoroughly** across different devices and browsers
4. **Update documentation** to reflect new features

## Support

For issues or questions about the sharing functionality:
- Check the browser console for error messages
- Verify that the target platform is accessible
- Test with different language settings
- Ensure the barraca data is properly formatted 