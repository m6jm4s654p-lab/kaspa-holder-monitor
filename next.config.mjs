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

const blockdagCorsHeaders=[
  {key:'Access-Control-Allow-Origin',value:'https://kaspa-live-blockdag.teacbit.chatgpt.site'},
  {key:'Access-Control-Allow-Methods',value:'GET, OPTIONS'},
  {key:'Access-Control-Allow-Headers',value:'Content-Type'},
  {key:'Access-Control-Max-Age',value:'86400'},
  {key:'Cross-Origin-Resource-Policy',value:'cross-origin'},
  {key:'Vary',value:'Origin'}
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers(){
    return [
      {source:'/:path*',headers:securityHeaders},
      {source:'/api/blockdag',headers:blockdagCorsHeaders}
    ];
  }
};
export default nextConfig;
