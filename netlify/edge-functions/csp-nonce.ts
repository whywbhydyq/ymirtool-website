const NONCE_PLACEHOLDER = '__CSP_NONCE__';

function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https: http: 'report-sample'`,
    "style-src 'self' 'report-sample'",
    "img-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://vitals.vercel-insights.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com ws: wss:",
    "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com data: blob:",
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
    'report-uri /api/csp-report',
    'report-to ymir-csp-report'
  ].join('; ');
}

function shouldTransform(request: Request, response: Response): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const url = new URL(request.url);
  const contentType = response.headers.get('content-type') || '';
  if (contentType.toLowerCase().includes('text/html')) return true;
  return url.pathname === '/' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
}

function setHeaders(headers: Headers, nonce: string): void {
  headers.set('Content-Security-Policy', buildCsp(nonce));
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()');
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  headers.set('Reporting-Endpoints', 'ymir-csp-report="/api/csp-report"');
  headers.set('Report-To', '{"group":"ymir-csp-report","max_age":604800,"endpoints":[{"url":"/api/csp-report"}],"include_subdomains":true}');
  headers.set('Cache-Control', 'no-store');
  headers.delete('content-length');
  headers.delete('etag');
}

export default async function cspNonce(request: Request, context: any): Promise<Response> {
  const response = await context.next();
  if (!shouldTransform(request, response)) return response;

  const nonce = makeNonce();
  const headers = new Headers(response.headers);
  setHeaders(headers, nonce);

  if (request.method === 'HEAD') {
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const html = await response.text();
  const body = html.split(NONCE_PLACEHOLDER).join(nonce);
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export const config = { path: '/*' };
