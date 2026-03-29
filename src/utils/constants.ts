// Color scheme constants
export const COLORS = {
  primary: '#1A1A2E',
  accent: '#27AE60',
  accentLight: '#45B373',
  accentDark: '#1E8449',
  darkBg: '#0F0F1E',
  darkCard: '#252541',
  darkBorder: '#3A3A52',
};

// Category colors
export const CATEGORY_COLORS = {
  Protein: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
  Produce: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
  Dairy: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  Grain: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  Other: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' },
};

// API endpoints
export const API_ENDPOINTS = {
  insights: '/api/insights',
};

// Feature flags
export const FEATURES = {
  offline: false,
  teamManagement: true,
  advancedReports: true,
  apiAccess: false,
};
