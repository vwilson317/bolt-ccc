import { CTAButtonConfig, CTAButtonAction, CTAVisibilityConditions, DefaultCTAButtons, Barraca } from '../types';
import { Calendar, Eye, MessageCircle, Menu, Phone, Mail, ExternalLink, Star, Instagram } from 'lucide-react';
import { getEffectiveOpenStatus } from './environmentUtils';

/**
 * Default CTA button configurations
 * These serve as fallbacks when custom buttons are not configured
 */
export const getDefaultCTAButtons = (t: (key: string) => string): DefaultCTAButtons => ({
  reserve: {
    id: 'default-reserve',
    text: t('cta.reserve'),
    action: {
      type: 'reservation',
      value: '/reserve',
      trackingEvent: 'cta_reserve_clicked'
    },
    style: 'primary',
    position: 1,
    visibilityConditions: {
      requiresOpen: true
    },
    icon: 'Calendar',
    enabled: true
  },
  contact: {
    id: 'default-contact',
    text: t('cta.contact'),
    action: {
      type: 'whatsapp',
      value: '',
      target: '_blank',
      trackingEvent: 'cta_contact_clicked'
    },
    style: 'outline',
    position: 2,
    visibilityConditions: {},
    icon: 'MessageCircle',
    enabled: true
  },
  menu: {
    id: 'default-menu',
    text: t('cta.menu'),
    action: {
      type: 'url',
      value: '/menu',
      target: '_blank',
      trackingEvent: 'cta_menu_clicked'
    },
    style: 'outline',
    position: 3,
    visibilityConditions: {},
    icon: 'Menu',
    enabled: true
  }
});

/**
 * Validates a CTA button configuration
 */
export const validateCTAButton = (button: CTAButtonConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!button.id || button.id.trim() === '') {
    errors.push('Button ID is required');
  }

  // Allow empty text for icon-only buttons (like Instagram)
  if (button.text === undefined || button.text === null) {
    errors.push('Button text is required');
  }

  if (!button.action || !button.action.type) {
    errors.push('Button action type is required');
  }

  if (button.action && (!button.action.value || button.action.value.trim() === '')) {
    errors.push('Button action value is required');
  }

  // Style validation
  const validStyles = ['primary', 'secondary', 'outline', 'ghost'];
  if (!validStyles.includes(button.style)) {
    errors.push(`Invalid button style. Must be one of: ${validStyles.join(', ')}`);
  }

  // Position validation
  if (typeof button.position !== 'number' || button.position < 0) {
    errors.push('Button position must be a non-negative number');
  }

  // Action-specific validation
  if (button.action && button.action.type === 'url' && !isValidUrl(button.action.value)) {
    errors.push('Invalid URL format');
  }

  if (button.action && button.action.type === 'email' && !isValidEmail(button.action.value)) {
    errors.push('Invalid email format');
  }

  if (button.action && button.action.type === 'phone' && !isValidPhone(button.action.value)) {
    errors.push('Invalid phone number format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Checks if a CTA button should be visible based on its conditions
 */
export const shouldShowCTAButton = (
  button: CTAButtonConfig, 
  barraca: Barraca, 
  context: {
    currentTime?: Date;
    isLoggedIn?: boolean;
    weatherConditions?: string;
    weatherOverride?: boolean;
  } = {}
): boolean => {
  if (!button.enabled) return false;

  const { visibilityConditions } = button;
  const { currentTime = new Date(), isLoggedIn = false, weatherConditions = 'good', weatherOverride = false } = context;

  // Calculate effective open status considering weather override and special admin override
  const effectiveIsOpen = getEffectiveOpenStatus(barraca, weatherOverride);

  // Check open/closed requirements using effective status
  if (visibilityConditions.requiresOpen && effectiveIsOpen !== true) return false;
  if (visibilityConditions.requiresClosed && effectiveIsOpen === true) return false;

  // Check member-only requirement
  if (visibilityConditions.memberOnly && !isLoggedIn) return false;

  // Check weather dependency
  if (visibilityConditions.weatherDependent && barraca.weatherDependent && weatherConditions === 'poor') {
    return false;
  }

  // Check time restrictions
  if (visibilityConditions.timeRestrictions) {
    const { startTime, endTime, daysOfWeek } = visibilityConditions.timeRestrictions;
    
    // Check day of week
    if (daysOfWeek && !daysOfWeek.includes(currentTime.getDay())) {
      return false;
    }

    // Check time range
    if (startTime && endTime) {
      const currentTimeStr = currentTime.toTimeString().slice(0, 5); // HH:MM format
      if (currentTimeStr < startTime || currentTimeStr > endTime) {
        return false;
      }
    }
  }

  // Custom condition evaluation (basic implementation)
  if (visibilityConditions.customCondition) {
    try {
      // Simple evaluation - in production, use a safer expression evaluator
      const condition = visibilityConditions.customCondition
        .replace(/\$\{barraca\.isOpen\}/g, (effectiveIsOpen === true).toString())
        .replace(/\$\{barraca\.location\}/g, `"${barraca.location}"`)
        .replace(/\$\{isLoggedIn\}/g, isLoggedIn.toString());
      
      // Safer evaluation using Function constructor instead of eval
      const evaluateCondition = new Function('return ' + condition);
      return evaluateCondition();
    } catch (error) {
      console.warn('Error evaluating custom condition:', error);
      return true; // Default to showing the button if evaluation fails
    }
  }

  return true;
};

/**
 * Gets the appropriate CTA buttons for a barraca
 */
export const getCTAButtonsForBarraca = (
  barraca: Barraca,
  customCtaEnabled: boolean,
  t: (key: string) => string,
  context?: {
    currentTime?: Date;
    isLoggedIn?: boolean;
    weatherConditions?: string;
  }
): CTAButtonConfig[] => {
  let buttons: CTAButtonConfig[] = [];

  if (customCtaEnabled && barraca.ctaButtons && barraca.ctaButtons.length > 0) {
    // Use custom CTA buttons
    buttons = barraca.ctaButtons.filter(button => {
      const validation = validateCTAButton(button);
      if (!validation.isValid) {
        console.warn(`❌ Invalid CTA button configuration for ${barraca.name}:`, validation.errors);
        return false;
      }
      return shouldShowCTAButton(button, barraca, context);
    });
  }

  // Fallback to default buttons if no valid custom buttons or feature disabled
  if (buttons.length === 0) {
    const defaultButtons = getDefaultCTAButtons(t);
    
    // Configure default contact button with barraca's phone
    if (barraca.contact.phone) {
      defaultButtons.contact.action.value = barraca.contact.phone;
    }

    buttons = Object.values(defaultButtons).filter(button => 
      shouldShowCTAButton(button, barraca, context)
    );
  }

  // Sort by position
  return buttons.sort((a, b) => a.position - b.position);
};

/**
 * Handles CTA button click actions
 */
export const handleCTAButtonClick = (action: CTAButtonAction, barraca: Barraca) => {
  // Track analytics if tracking event is specified
  if (action.trackingEvent) {
    // In production, integrate with your analytics service
    console.log('CTA Button Clicked:', action.trackingEvent, { barracaId: barraca.id });
  }

  switch (action.type) {
    case 'url':
      if (action.target === '_blank') {
        window.open(action.value, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = action.value;
      }
      break;

    case 'phone':
      window.location.href = `tel:${action.value}`;
      break;

    case 'email':
      window.location.href = `mailto:${action.value}`;
      break;

    case 'whatsapp':
      const cleanPhone = action.value.replace(/\D/g, '');
      const whatsappPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      window.open(`https://wa.me/${whatsappPhone}`, '_blank', 'noopener,noreferrer');
      break;

    case 'ig':
      // Handle Instagram links - open in new tab
      window.open(action.value, '_blank', 'noopener,noreferrer');
      break;

    case 'reservation':
      // Handle reservation logic - could open a modal, navigate to booking page, etc.
      console.log('Opening reservation for:', barraca.name);
      // Example: openReservationModal(barraca.id);
      break;

    case 'details':
      // Handle details view - could open a modal, navigate to details page, etc.
      console.log('Opening details for:', barraca.name);
      // Example: openDetailsModal(barraca.id);
      break;

    case 'custom':
      // Handle custom actions - could trigger custom functions
      console.log('Custom action triggered:', action.value);
      break;

    default:
      console.warn('Unknown CTA button action type:', action.type);
  }
};

/**
 * Gets the appropriate icon component for a button
 */
export const getCTAButtonIcon = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    Calendar,
    Eye,
    MessageCircle,
    Menu,
    Phone,
    Mail,
    ExternalLink,
    Star,
    Instagram
  };

  return iconName ? iconMap[iconName] : null;
};

/**
 * Gets CSS classes for button styling
 */
export const getCTAButtonClasses = (style: string, size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  const styleClasses = {
    primary: 'bg-gradient-to-r from-beach-500 to-beach-600 text-white hover:from-beach-600 hover:to-beach-700 focus:ring-beach-500 shadow-sm',
    secondary: 'bg-gradient-to-r from-sunset-500 to-sunset-600 text-white hover:from-sunset-600 hover:to-sunset-700 focus:ring-sunset-500 shadow-sm',
    outline: 'border border-sand-300 bg-white text-sand-700 hover:bg-sand-50 focus:ring-sand-500',
    ghost: 'text-sand-600 hover:text-sand-900 hover:bg-sand-100 focus:ring-sand-500'
  };

  return `${baseClasses} ${sizeClasses[size]} ${styleClasses[style as keyof typeof styleClasses] || styleClasses.outline}`;
};

// Utility functions
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};