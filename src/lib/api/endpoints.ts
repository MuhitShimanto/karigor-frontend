export const ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    ADMIN_LIST: '/admin/categories',
    ADMIN_CREATE: '/admin/categories',
  },

  // Services & Technicians (Public)
  SERVICES: {
    LIST: '/services',
  },
  TECHNICIANS: {
    LIST: '/technicians',
    DETAIL: (id: string) => `/technicians/${id}`,
  },

  // Customer Bookings & Payments
  BOOKINGS: {
    CREATE: '/bookings',
    LIST: '/bookings',
    DETAIL: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
  PAYMENTS: {
    CREATE: '/payments/create',
    LIST: '/payments',
    DETAIL: (id: string) => `/payments/${id}`,
  },

  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
  },

  // Technician Portal
  TECHNICIAN: {
    UPDATE_PROFILE: '/technician/profile',
    UPDATE_AVAILABILITY: '/technician/availability',
    CREATE_SERVICE: '/technician/services',
    UPDATE_SERVICE: (id: string) => `/technician/services/${id}`,
    DELETE_SERVICE: (id: string) => `/technician/services/${id}`,
    BOOKINGS: '/technician/bookings',
    UPDATE_BOOKING_STATUS: (id: string) => `/technician/bookings/${id}`,
  },

  // Admin Portal
  ADMIN: {
    USERS: '/admin/users',
    UPDATE_USER_STATUS: (id: string) => `/admin/users/${id}`,
    BOOKINGS: '/admin/bookings',
    PAYMENTS: '/admin/payments',
  },
} as const;
