import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, X, Copy, MessageCircle, Facebook, Twitter, Instagram } from 'lucide-react';
import { Barraca } from '../types';

interface ShareButtonProps {
  barraca: Barraca;
  variant?: 'icon' | 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  hoverColor: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  barraca, 
  variant = 'icon', 
  size = 'md',
  className = '' 
}) => {
  const { t, i18n } = useTranslation();
  const [isSharing, setIsSharing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const platforms: SharePlatform[] = [
    {
      id: 'whatsapp',
      name: t('share.platforms.whatsapp'),
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      hoverColor: 'hover:bg-green-200'
    },
    {
      id: 'facebook',
      name: t('share.platforms.facebook'),
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-200'
    },
    {
      id: 'twitter',
      name: t('share.platforms.twitter'),
      icon: Twitter,
      color: 'text-sky-600',
      bgColor: 'bg-sky-100',
      hoverColor: 'hover:bg-sky-200'
    },
    {
      id: 'instagram',
      name: t('share.platforms.instagram'),
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      hoverColor: 'hover:bg-pink-200'
    },
    {
      id: 'copy',
      name: t('share.platforms.copy'),
      icon: Copy,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'hover:bg-gray-200'
    }
  ];

  const formatShareText = (): string => {
    const templates = {
      en: `Check out ${barraca.name} at ${barraca.location}!`,
      pt: `Confira ${barraca.name} em ${barraca.location}!`,
      es: `¡Mira ${barraca.name} en ${barraca.location}!`,
      fr: `Découvrez ${barraca.name} à ${barraca.location} !`
    };
    
    return templates[i18n.language as keyof typeof templates] || templates.en;
  };

  const getShareUrl = (): string => {
    return `${window.location.origin}/barraca/${barraca.id}`;
  };

  const shareToWhatsApp = async (): Promise<void> => {
    const text = encodeURIComponent(`${formatShareText()} ${getShareUrl()}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToFacebook = async (): Promise<void> => {
    const url = encodeURIComponent(getShareUrl());
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToTwitter = async (): Promise<void> => {
    const text = encodeURIComponent(`${formatShareText()} ${getShareUrl()}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(`${formatShareText()} ${getShareUrl()}`);
      setShareMessage(t('share.copied'));
      setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${formatShareText()} ${getShareUrl()}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareMessage(t('share.copied'));
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const nativeShare = async (): Promise<void> => {
    if ('share' in navigator && navigator.share) {
      try {
        await navigator.share({
          title: barraca.name,
          text: formatShareText(),
          url: getShareUrl(),
        });
      } catch (error) {
        console.error('Native sharing failed:', error);
        await copyToClipboard();
      }
    } else {
      await copyToClipboard();
    }
  };

  const handleShare = async (platform?: string): Promise<void> => {
    setIsSharing(true);
    setShowDropdown(false);
    
    try {
      switch (platform) {
        case 'whatsapp':
          await shareToWhatsApp();
          break;
        case 'facebook':
          await shareToFacebook();
          break;
        case 'twitter':
          await shareToTwitter();
          break;
        case 'instagram':
          await copyToClipboard();
          break;
        case 'copy':
          await copyToClipboard();
          break;
        default:
          await nativeShare();
          break;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setShareMessage(t('share.error'));
      setTimeout(() => setShareMessage(''), 3000);
    } finally {
      setIsSharing(false);
    }
  };

  const getButtonClasses = (): string => {
    const baseClasses = 'flex items-center justify-center transition-colors disabled:opacity-50';
    
    switch (size) {
      case 'sm':
        return `${baseClasses} p-2 rounded-lg ${className}`;
      case 'lg':
        return `${baseClasses} px-4 py-3 rounded-xl ${className}`;
      default:
        return `${baseClasses} p-2.5 rounded-lg ${className}`;
    }
  };

  const getIconSize = (): string => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative" style={{ zIndex: 9999 }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isSharing}
          className={`${getButtonClasses()} bg-white/20 backdrop-blur-sm hover:bg-white/30`}
          title={t('share.title')}
        >
          <Share2 className={`${getIconSize()} text-white`} />
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0" 
              style={{ zIndex: 9998 }}
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-[9999] overflow-hidden" style={{ position: 'absolute', zIndex: 9999 }}>
              <div className="p-3">
                <div className="flex items-center space-x-2">
                  {platforms.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => handleShare(platform.id)}
                        disabled={isSharing}
                        className={`flex items-center justify-center p-2.5 rounded-lg transition-colors ${platform.bgColor} ${platform.hoverColor} ${platform.color} disabled:opacity-50`}
                        title={platform.name}
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Success/Error Message */}
        {shareMessage && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            {shareMessage}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={() => handleShare()}
        disabled={isSharing}
        className={`${getButtonClasses()} bg-orange-600 text-white hover:bg-orange-700`}
      >
        <Share2 className={`${getIconSize()} mr-2`} />
        <span className="font-medium">
          {isSharing ? t('share.sharing') : t('barraca.share')}
        </span>
      </button>
    );
  }

  // Default icon variant
  return (
    <button
      onClick={() => handleShare()}
      disabled={isSharing}
      className={`${getButtonClasses()} bg-white/20 backdrop-blur-sm hover:bg-white/30`}
      title={t('share.title')}
    >
      <Share2 className={`${getIconSize()} text-white`} />
    </button>
  );
};

export default ShareButton; 