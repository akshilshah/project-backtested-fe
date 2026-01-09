/**
 * Route Preloading Utilities
 *
 * These utilities help preload critical routes to improve perceived performance.
 * Use these functions to preload routes when the user is likely to navigate to them.
 */

// Track which routes have been preloaded
const preloadedRoutes = new Set<string>();

/**
 * Preload a route dynamically
 * @param importFn - Dynamic import function for the route
 * @param routeKey - Unique key to track preloaded status
 */
export async function preloadRoute(
  importFn: () => Promise<unknown>,
  routeKey: string
): Promise<void> {
  if (preloadedRoutes.has(routeKey)) {
    return;
  }

  try {
    await importFn();
    preloadedRoutes.add(routeKey);
  } catch (error) {
    console.warn(`Failed to preload route: ${routeKey}`, error);
  }
}

/**
 * Preload critical dashboard routes
 * Call this after the initial dashboard load
 */
export function preloadCriticalRoutes(): void {
  // Preload on idle or after a short delay
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      doPreloadCriticalRoutes();
    });
  } else {
    setTimeout(() => {
      doPreloadCriticalRoutes();
    }, 2000);
  }
}

function doPreloadCriticalRoutes(): void {
  // Preload trades list (most commonly accessed after dashboard)
  preloadRoute(
    () => import('src/pages/dashboard/trades/index'),
    'trades-list'
  );

  // Preload new trade form
  preloadRoute(
    () => import('src/pages/dashboard/trades/new'),
    'trades-new'
  );

  // Preload analytics (commonly accessed)
  preloadRoute(
    () => import('src/pages/dashboard/analytics/index'),
    'analytics'
  );
}

/**
 * Preload route on hover/focus for instant navigation
 * @param routeKey - Route identifier
 * @param importFn - Dynamic import function
 */
export function createPreloadHandler(
  routeKey: string,
  importFn: () => Promise<unknown>
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    onMouseEnter: () => {
      timeoutId = setTimeout(() => {
        preloadRoute(importFn, routeKey);
      }, 100);
    },
    onMouseLeave: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
    onFocus: () => {
      preloadRoute(importFn, routeKey);
    },
  };
}

/**
 * Preload handlers for common routes
 */
export const routePreloadHandlers = {
  trades: createPreloadHandler('trades-list', () =>
    import('src/pages/dashboard/trades/index')
  ),
  tradesNew: createPreloadHandler('trades-new', () =>
    import('src/pages/dashboard/trades/new')
  ),
  coins: createPreloadHandler('coins-list', () =>
    import('src/pages/dashboard/coins/index')
  ),
  strategies: createPreloadHandler('strategies-list', () =>
    import('src/pages/dashboard/strategies/index')
  ),
  analytics: createPreloadHandler('analytics', () =>
    import('src/pages/dashboard/analytics/index')
  ),
  settings: createPreloadHandler('settings', () =>
    import('src/pages/dashboard/settings/index')
  ),
  profile: createPreloadHandler('profile', () =>
    import('src/pages/dashboard/profile/index')
  ),
};
