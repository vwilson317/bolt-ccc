import * as Sentry from '@sentry/react';
import { getEnvironmentConfig } from './environmentUtils';

export const initSentry = () => {
  const config = getEnvironmentConfig();
  
  // Only initialize Sentry in environments where error reporting is enabled
  if (!config.allowedFeatures.errorReporting) {
    console.log('Sentry disabled for environment:', config.name);
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: config.schema,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Capture 10% of all sessions,
        // plus 100% of sessions with an error
        sessionSampleRate: 0.1,
        errorSampleRate: 1.0,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: config.isProduction ? 0.1 : 1.0,
    // Release Health
    autoSessionTracking: true,
    // Capture Console
    beforeSend(event) {
      // Filter out development noise
      if (config.isDevelopment && event.level === 'info') {
        return null;
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs in production
      if (config.isProduction && breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }
      return breadcrumb;
    },
  });

  // Set user context
  Sentry.setTag('environment', config.name);
  Sentry.setTag('schema', config.schema);
  
  console.log('Sentry initialized for environment:', config.name);
};

// Custom logging functions with Sentry integration
export const logError = (error: Error, context: string, extra?: Record<string, any>) => {
  const config = getEnvironmentConfig();
  
  console.error(`[${context}] Error:`, error);
  
  if (config.allowedFeatures.errorReporting) {
    Sentry.withScope((scope) => {
      scope.setTag('context', context);
      scope.setLevel('error');
      if (extra) {
        Object.keys(extra).forEach(key => {
          scope.setExtra(key, extra[key]);
        });
      }
      Sentry.captureException(error);
    });
  }
};

export const logWarning = (message: string, context: string, extra?: Record<string, any>) => {
  const config = getEnvironmentConfig();
  
  console.warn(`[${context}] Warning:`, message);
  
  if (config.allowedFeatures.errorReporting) {
    Sentry.withScope((scope) => {
      scope.setTag('context', context);
      scope.setLevel('warning');
      if (extra) {
        Object.keys(extra).forEach(key => {
          scope.setExtra(key, extra[key]);
        });
      }
      Sentry.captureMessage(message, 'warning');
    });
  }
};

export const logInfo = (message: string, context: string, extra?: Record<string, any>) => {
  const config = getEnvironmentConfig();
  
  console.log(`[${context}] Info:`, message);
  
  if (config.allowedFeatures.errorReporting && config.allowedFeatures.debugMode) {
    Sentry.withScope((scope) => {
      scope.setTag('context', context);
      scope.setLevel('info');
      if (extra) {
        Object.keys(extra).forEach(key => {
          scope.setExtra(key, extra[key]);
        });
      }
      Sentry.captureMessage(message, 'info');
    });
  }
};

export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  const config = getEnvironmentConfig();
  
  if (config.allowedFeatures.errorReporting) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }
};

export const setUserContext = (user: { id?: string; email?: string; [key: string]: any }) => {
  const config = getEnvironmentConfig();
  
  if (config.allowedFeatures.errorReporting) {
    Sentry.setUser(user);
  }
};

export const setFormContext = (formData: Record<string, any>) => {
  const config = getEnvironmentConfig();
  
  if (config.allowedFeatures.errorReporting) {
    Sentry.setContext('form', {
      hasName: !!formData.name,
      hasOwnerName: !!formData.ownerName,
      hasPhone: !!formData.contact?.phone,
      hasEmail: !!formData.contact?.email,
      location: formData.location,
      nearestPosto: formData.nearestPosto,
      amenitiesCount: formData.amenities?.length || 0,
      environmentCount: formData.environment?.length || 0,
      hasDefaultPhoto: !!formData.defaultPhoto,
      weekendHoursEnabled: formData.weekendHoursEnabled,
      englishFluency: formData.englishFluency,
      tabSystem: formData.tabSystem,
      // Partnership flags
      qrCodes: formData.qrCodes,
      repeatDiscounts: formData.repeatDiscounts,
      hotelPartnerships: formData.hotelPartnerships,
      contentCreation: formData.contentCreation,
      onlineOrders: formData.onlineOrders,
      // Contact preferences
      contactForPhotos: formData.contactForPhotos,
      contactForStatus: formData.contactForStatus,
      preferredContactMethod: formData.preferredContactMethod,
    });
  }
};

// Performance monitoring for async operations
export const withPerformanceMonitoring = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  tags?: Record<string, string>
): Promise<T> => {
  const config = getEnvironmentConfig();
  
  if (!config.allowedFeatures.errorReporting) {
    return operation();
  }

  const transaction = Sentry.startTransaction({
    name: operationName,
    op: 'function',
    tags,
  });

  try {
    const result = await operation();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
};

export { Sentry };
