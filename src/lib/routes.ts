/**
 * Route Constants and URL Builders
 *
 * Single source of truth for all application routes.
 * Every screen in the app should map to a URL defined here.
 */

export const ROUTES = {
  HOME: '/',

  PLACEMENT: {
    READY: '/placement/ready',
    ACTIVE: '/placement/active/:sessionId',
    RESULTS: '/placement/results/:sessionId',
  },

  PRACTICE: {
    READY: '/practice/ready',
    ACTIVE: '/practice/active/:sessionId',
    RESULTS: '/practice/results/:sessionId',
  },

  PROGRESS: '/progress',
  ADMIN: '/admin',
} as const

/**
 * URL builders with type-safe parameters
 * Use these to navigate programmatically with proper parameters
 */
export const buildRoute = {
  home: () => ROUTES.HOME,

  placementReady: () => ROUTES.PLACEMENT.READY,
  placementActive: (sessionId: string) => `/placement/active/${sessionId}`,
  placementResults: (sessionId: string) => `/placement/results/${sessionId}`,

  practiceReady: () => ROUTES.PRACTICE.READY,
  practiceActive: (sessionId: string) => `/practice/active/${sessionId}`,
  practiceResults: (sessionId: string) => `/practice/results/${sessionId}`,

  progress: () => ROUTES.PROGRESS,
  admin: () => ROUTES.ADMIN,
}

/**
 * Route patterns for matching (useful for guards and analytics)
 */
export const ROUTE_PATTERNS = {
  PLACEMENT: '/placement/*',
  PRACTICE: '/practice/*',
  SESSION_ACTIVE: ['/placement/active/*', '/practice/active/*'],
  SESSION_RESULTS: ['/placement/results/*', '/practice/results/*'],
} as const
