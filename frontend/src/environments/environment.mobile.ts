export const environment = {
  production: true,
  platform: 'mobile' as 'web' | 'mobile',
  backend: 'https://backend.myani.li/',
  jikanUrl: 'https://api.jikan.moe/v4/',
  jikanFallbackUrl: 'https://api.jikan.moe/v4/',
  anisearchUrl: 'https://anisearch.myani.li/',
};

console.log('🚀 MOBILE ENVIRONMENT LOADED!', environment);
