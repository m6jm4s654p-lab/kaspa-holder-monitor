const isDev=process.env.NODE_ENV!=='production';
const contentSecurityPolicy=[
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev?" 'unsafe-eval'":''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  'upgrade-insecure-requests'
].join('; ');

const securityHeaders=[
  {key:'Content-Security-Policy',value:contentSecurityPolicy},
  {key:'Strict-Transport-Security',value:'max-age=63072000; includeSubDomains; preload'},
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Referrer-Policy',value:'no-referrer'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},
  {key:'Cross-Origin-Opener-Policy',value:'same-origin'},
  {key:'Cross-Origin-Resource-Policy',value:'same-origin'}
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers(){
    return [{source:'/:path*',headers:securityHeaders}];
  }
};
export default nextConfig;
