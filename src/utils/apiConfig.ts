// Base API URL configuration with environment variable support for production deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
