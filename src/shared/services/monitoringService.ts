// T195: Monitoring Service
// Performance monitoring and Web Vitals tracking

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface WebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 500;
  private webVitals: Partial<WebVitals> = {};
  private enabled: boolean;
  private env: string;

  constructor() {
    this.enabled = import.meta.env.VITE_MONITORING_ENABLED === 'true';
    this.env = import.meta.env.VITE_MONITORING_ENV || 'development';

    if (this.enabled) {
      this.initializeMonitoring();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    // Track navigation performance
    if (window.performance) {
      window.addEventListener('load', () => {
        this.trackPageLoad();
      });
    }

    // Track Web Vitals
    this.trackWebVitals();

    console.log(`✓ Monitoring initialized (${this.env})`);
  }

  /**
   * Track page load performance
   */
  private trackPageLoad(): void {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

    this.addMetric('page_load_time', pageLoadTime, 'ms', {
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      ttfb: perfData.responseStart - perfData.navigationStart,
      dom: perfData.domInteractive - perfData.navigationStart,
      dcl: perfData.domContentLoadedEventEnd - perfData.navigationStart,
    });
  }

  /**
   * Track Web Vitals
   */
  private trackWebVitals(): void {
    // Try to use web-vitals library if available
    if ((window as any).webVitals) {
      const vitals = (window as any).webVitals;

      if (vitals.getCLS) {
        vitals.getCLS((cls: any) => {
          this.webVitals.cls = cls.value;
          this.addMetric('cumulative_layout_shift', cls.value, 'score');
        });
      }

      if (vitals.getFID) {
        vitals.getFID((fid: any) => {
          this.webVitals.fid = fid.value;
          this.addMetric('first_input_delay', fid.value, 'ms');
        });
      }

      if (vitals.getLCP) {
        vitals.getLCP((lcp: any) => {
          this.webVitals.lcp = lcp.value;
          this.addMetric('largest_contentful_paint', lcp.value, 'ms');
        });
      }
    }

    // Manual tracking of FCP
    if (window.performance && window.performance.getEntriesByType) {
      const fcpEntries = window.performance.getEntriesByType('paint');
      const fcp = fcpEntries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.webVitals.fcp = fcp.startTime;
        this.addMetric('first_contentful_paint', fcp.startTime, 'ms');
      }
    }
  }

  /**
   * Add a performance metric
   */
  addMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    context?: Record<string, any>
  ): void {
    if (!this.enabled) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    console.log(`📊 Metric: ${name} = ${value}${unit}`);
  }

  /**
   * Track API call performance
   */
  trackApiCall(
    method: string,
    url: string,
    duration: number,
    status: number,
    context?: Record<string, any>
  ): void {
    this.addMetric(`api_${method.toLowerCase()}_${status}`, duration, 'ms', {
      url,
      method,
      status,
      ...context,
    });
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, duration: number): void {
    this.addMetric(`component_render_${componentName}`, duration, 'ms');
  }

  /**
   * Track custom operation
   */
  trackOperation(operationName: string, duration: number, context?: Record<string, any>): void {
    this.addMetric(`operation_${operationName}`, duration, 'ms', context);
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name.includes(name));
  }

  /**
   * Get Web Vitals
   */
  getWebVitals(): Partial<WebVitals> {
    return { ...this.webVitals };
  }

  /**
   * Get average metric value
   */
  getAverageMetric(name: string): number | null {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return null;
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        webVitals: this.webVitals,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    avgResponseTime: number | null;
    webVitals: Partial<WebVitals>;
  } {
    return {
      totalMetrics: this.metrics.length,
      avgResponseTime: this.getAverageMetric('api_'),
      webVitals: this.getWebVitals(),
    };
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService();
