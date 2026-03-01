// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: true,
  // Use a relative path that works with Netlify
  // Option 1: If backend is on same domain (requires reverse proxy in netlify.toml)
  apiBaseUrl: '/api',
  
  // Option 2: If backend is on separate domain, uncomment below and set your backend URL
  // apiBaseUrl: 'https://your-backend-domain.com/api',
  
  // For development/testing with separate backend domains
  // apiBaseUrl: process.env['API_BASE_URL'] || '/api'
};
