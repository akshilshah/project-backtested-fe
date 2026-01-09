import type { SWRConfiguration } from 'swr';

// ----------------------------------------------------------------------

/**
 * Global SWR Configuration
 *
 * Optimized settings for better caching and performance:
 * - revalidateOnFocus: Disabled to reduce unnecessary refetches
 * - revalidateOnReconnect: Enabled for data freshness after connection loss
 * - dedupingInterval: 5 seconds to dedupe requests
 * - errorRetryCount: 3 retries on error
 * - errorRetryInterval: 5 seconds between retries
 * - focusThrottleInterval: Throttle focus revalidations
 * - keepPreviousData: Keep previous data while fetching new
 */
export const swrConfig: SWRConfiguration = {
  // Revalidation settings
  revalidateOnFocus: false, // Disable auto-refetch on window focus
  revalidateOnReconnect: true, // Refetch when reconnecting
  revalidateIfStale: true, // Revalidate stale data

  // Performance settings
  dedupingInterval: 5000, // 5 seconds - dedupe identical requests
  focusThrottleInterval: 5000, // 5 seconds - throttle focus revalidations

  // Error handling
  errorRetryCount: 3, // Retry 3 times on error
  errorRetryInterval: 5000, // 5 seconds between retries
  shouldRetryOnError: true, // Enable error retries

  // Data persistence
  keepPreviousData: true, // Keep previous data during revalidation

  // Loading states
  loadingTimeout: 3000, // Show loading after 3 seconds

  // Error handler
  onError: (error, key) => {
    // Don't log 401 errors (handled by auth)
    if (error?.response?.status === 401) {
      return;
    }
    console.error(`SWR Error [${key}]:`, error);
  },
};

// Cache key generators for consistent caching
export const cacheKeys = {
  coins: {
    list: (params?: Record<string, any>) => ['coins', params],
    all: () => ['coins-all'],
    detail: (id: string) => ['coin', id],
  },
  strategies: {
    list: (params?: Record<string, any>) => ['strategies', params],
    all: () => ['strategies-all'],
    detail: (id: string) => ['strategy', id],
  },
  trades: {
    list: (params?: Record<string, any>) => ['trades', params],
    detail: (id: string) => ['trade', id],
    analytics: (params?: Record<string, any>) => ['trades-analytics', params],
  },
  dashboard: {
    stats: () => ['dashboard-stats'],
    openTrades: () => ['dashboard-open-trades'],
    recentTrades: () => ['dashboard-recent-trades'],
  },
};
