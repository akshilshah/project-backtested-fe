// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    // Trades
    trades: {
      root: `${ROOTS.DASHBOARD}/trades`,
      new: `${ROOTS.DASHBOARD}/trades/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/trades/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/trades/${id}/edit`,
    },
    // Coins (Master Data)
    coins: {
      root: `${ROOTS.DASHBOARD}/coins`,
      new: `${ROOTS.DASHBOARD}/coins/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/coins/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/coins/${id}/edit`,
    },
    // Strategies (Master Data)
    strategies: {
      root: `${ROOTS.DASHBOARD}/strategies`,
      new: `${ROOTS.DASHBOARD}/strategies/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/strategies/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/strategies/${id}/edit`,
    },
    // Analytics
    analytics: `${ROOTS.DASHBOARD}/analytics`,
    // Account (merged Profile and Settings)
    account: `${ROOTS.DASHBOARD}/account`,
    // Legacy paths for backward compatibility
    settings: `${ROOTS.DASHBOARD}/account`,
    profile: `${ROOTS.DASHBOARD}/account`,
  },
};
