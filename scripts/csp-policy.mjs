export const CSP_REPORT_ENDPOINT = '/api/csp-report';
export const CSP_REPORT_GROUP = 'ymir-csp-report';

export const CSP_REPORT_ONLY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://pagead2.googlesyndication.com https://cdn.vercel-insights.com",
  "style-src 'self'",
  "img-src 'self' https://pagead2.googlesyndication.com data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com https://pagead2.googlesyndication.com ws: wss:",
  "frame-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
  `report-uri ${CSP_REPORT_ENDPOINT}`,
  `report-to ${CSP_REPORT_GROUP}`
].join('; ');

export const REPORTING_ENDPOINTS_HEADER = `${CSP_REPORT_GROUP}=\"${CSP_REPORT_ENDPOINT}\"`;

export const REPORT_TO_HEADER = JSON.stringify({
  group: CSP_REPORT_GROUP,
  max_age: 604800,
  endpoints: [{ url: CSP_REPORT_ENDPOINT }],
  include_subdomains: true
});
