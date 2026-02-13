const isProd = process.env.NODE_ENV === 'production';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (isProd ? '/api-server' : 'http://127.0.0.1:5900/api');
