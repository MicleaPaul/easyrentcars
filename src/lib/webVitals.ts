interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    if ('web-vitals' in window) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric: Metric = {
          name: entry.name,
          value: entry.startTime,
          rating: getRating(entry.name, entry.startTime),
          delta: entry.startTime,
          id: entry.entryType,
        };
        onPerfEntry(metric);
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    } catch (e) {
      console.warn('Performance observer not supported:', e);
    }

    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            onPerfEntry({
              name: 'LCP',
              value: lastEntry.startTime,
              rating: getRating('LCP', lastEntry.startTime),
              delta: lastEntry.startTime,
              id: 'lcp',
            });
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('LCP observer not supported:', e);
      }

      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          if (clsValue > 0) {
            onPerfEntry({
              name: 'CLS',
              value: clsValue,
              rating: getRating('CLS', clsValue),
              delta: clsValue,
              id: 'cls',
            });
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('CLS observer not supported:', e);
      }

      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any;
            onPerfEntry({
              name: 'FID',
              value: fidEntry.processingStart - fidEntry.startTime,
              rating: getRating('FID', fidEntry.processingStart - fidEntry.startTime),
              delta: fidEntry.processingStart - fidEntry.startTime,
              id: 'fid',
            });
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('FID observer not supported:', e);
      }
    }
  }
}

function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metricName];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export function logWebVitals() {
  reportWebVitals((metric) => {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value.toFixed(2),
      rating: metric.rating,
    });
  });
}
