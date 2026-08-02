// T194: Error Tracking Service
// Generic error tracking service that can integrate with Sentry or other providers

export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  batchId?: string;
  stageId?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface ErrorReport {
  message: string;
  severity: ErrorSeverity;
  error?: Error;
  context?: ErrorContext;
  breadcrumbs?: Array<{
    message: string;
    timestamp: string;
    category: string;
  }>;
}

class ErrorTrackingService {
  private enabled: boolean;
  private env: string;
  private dsn?: string;
  private context: Partial<ErrorContext> = {};
  private breadcrumbs: Array<{ message: string; timestamp: string; category: string }> = [];
  private maxBreadcrumbs = 50;

  constructor() {
    this.enabled = import.meta.env.VITE_ERROR_TRACKING_ENABLED === 'true';
    this.env = import.meta.env.VITE_MONITORING_ENV || 'development';
    this.dsn = import.meta.env.VITE_ERROR_TRACKING_DSN;

    if (this.enabled) {
      this.initializeTracking();
    }
  }

  private initializeTracking(): void {
    // Listen to unhandled rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason, {
        tags: { type: 'unhandledRejection' },
      });
    });

    // Listen to global errors
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        tags: { type: 'globalError' },
      });
    });

    console.log(`✓ Error tracking initialized (${this.env})`);
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(user: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
  }): void {
    this.context = { ...this.context, ...user };

    if (this.enabled && window.__SENTRY__) {
      window.__SENTRY__.setUser(user);
    }
  }

  /**
   * Add a breadcrumb for tracking user actions
   */
  addBreadcrumb(
    message: string,
    category: string = 'action',
    data?: Record<string, any>
  ): void {
    const breadcrumb = {
      message,
      timestamp: new Date().toISOString(),
      category,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }

    if (this.enabled && window.__SENTRY__) {
      window.__SENTRY__.addBreadcrumb({
        message,
        category,
        level: 'info',
        data,
      });
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error | string, options?: { tags?: Record<string, string> }): void {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    const report: ErrorReport = {
      message,
      severity: ErrorSeverity.ERROR,
      error: typeof error !== 'string' ? (error as Error) : undefined,
      context: this.context as ErrorContext,
      breadcrumbs: [...this.breadcrumbs],
    };

    // Log locally
    console.error('❌ Error captured:', {
      message,
      stack,
      context: this.context,
      tags: options?.tags,
    });

    // Send to error tracking service if enabled
    if (this.enabled && this.dsn) {
      this.sendToErrorTracker(report, options?.tags);
    }
  }

  /**
   * Capture a warning
   */
  captureWarning(message: string, context?: Record<string, any>): void {
    console.warn('⚠️ Warning:', message, context);

    if (this.enabled && window.__SENTRY__) {
      window.__SENTRY__.captureMessage(message, 'warning');
    }
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: ErrorSeverity = ErrorSeverity.INFO): void {
    console.log(`ℹ️ Message (${level}):`, message);

    if (this.enabled && window.__SENTRY__) {
      window.__SENTRY__.captureMessage(message, level);
    }
  }

  /**
   * Send error to remote tracking service
   */
  private async sendToErrorTracker(
    report: ErrorReport,
    tags?: Record<string, string>
  ): Promise<void> {
    try {
      // If Sentry is available, use it
      if (window.__SENTRY__) {
        window.__SENTRY__.captureException(report.error, {
          extra: report.context,
          tags,
        });
        return;
      }

      // Fallback: Send to custom endpoint if configured
      if (this.dsn) {
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...report,
            tags,
            env: this.env,
            timestamp: new Date().toISOString(),
          }),
        }).catch((err) => {
          console.error('Failed to send error report:', err);
        });
      }
    } catch (err) {
      console.error('Error tracking service error:', err);
    }
  }

  /**
   * Get collected breadcrumbs
   */
  getBreadcrumbs() {
    return [...this.breadcrumbs];
  }

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  /**
   * Get current context
   */
  getContext(): Partial<ErrorContext> {
    return { ...this.context };
  }

  /**
   * Check if error tracking is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTrackingService();

// Extend window interface for Sentry
declare global {
  interface Window {
    __SENTRY__?: any;
  }
}
