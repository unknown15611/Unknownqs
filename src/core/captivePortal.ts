/**
 * Offline Captive Portal & Wi-Fi Hotspot APK Auto-Distribution Engine
 * Enables zero-internet distribution of Qaidi Link APK when peers connect to local Wi-Fi.
 */

export interface CaptivePortalRequest {
  path: string;
  host: string;
  userAgent?: string;
}

export interface CaptivePortalResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// Well-known Android & iOS Captive Portal detection probes
export const CAPTIVE_PORTAL_PROBE_PATHS = [
  '/generate_204',
  '/gen_204',
  '/connectivitycheck.gstatic.com/generate_204',
  '/ncsi.txt',
  '/connecttest.txt',
  '/hotspot-detect.html',
  '/library/test/success.html',
  '/canonical.html',
];

export const HOTSPOT_DEFAULT_GATEWAY_IP = "192.168.43.1";
export const HOTSPOT_HTTP_PORT = 8080;

/**
 * Handles incoming HTTP requests on local Wi-Fi Hotspot:
 * 1. If probe path: Returns HTTP 302 redirect to http://192.168.43.1:8080/portal
 * 2. If /portal: Serves the mobile-optimized Qaidi Link APK Download page
 * 3. If /qaidi_link.apk: Streams the raw APK binary directly from local storage
 */
export function handleCaptivePortalHttp(req: CaptivePortalRequest): CaptivePortalResponse {
  const normalizedPath = req.path.toLowerCase().split('?')[0];

  // Check if captive portal probe
  const isProbe = CAPTIVE_PORTAL_PROBE_PATHS.some(probe => normalizedPath.includes(probe));

  if (isProbe || normalizedPath === '/') {
    return {
      statusCode: 302,
      headers: {
        'Location': `http://${HOTSPOT_DEFAULT_GATEWAY_IP}:${HOTSPOT_HTTP_PORT}/portal`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: 'Redirecting to Qaidi Link Wi-Fi Portal...'
    };
  }

  if (normalizedPath === '/qaidi_link.apk') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="qaidi_link_v1.0.apk"',
      },
      body: 'BINARY_APK_STREAM'
    };
  }

  // Captive Portal Landing Page HTML
  if (normalizedPath === '/portal') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      body: generatePortalHtml()
    };
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'text/plain' },
    body: 'Not Found'
  };
}

export function generatePortalHtml(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Qaidi Link - Connect to Off-Grid Mesh</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; background: #020617; color: #f8fafc; text-align: center; padding: 24px; margin: 0; }
        .card { max-width: 400px; margin: 40px auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .logo { width: 64px; height: 64px; background: #10b981; border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: #020617; margin-bottom: 16px; }
        h1 { font-size: 22px; margin: 0 0 8px; color: #ffffff; }
        p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0 0 24px; }
        .btn { display: block; width: 100%; padding: 14px; background: #10b981; color: #020617; text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 14px; box-sizing: border-box; }
        .badge { display: inline-block; padding: 4px 10px; background: rgba(16,185,129,0.15); color: #10b981; border-radius: 999px; font-size: 11px; font-family: monospace; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">QL</div>
        <span class="badge">OFF-GRID WI-FI HOTSPOT</span>
        <h1>Welcome to Qaidi Share</h1>
        <p>You are connected to an off-grid peer-to-peer Wi-Fi network. Download the free Qaidi Share Lite app directly from this hotspot with zero cellular or internet data.</p>
        <a href="/qaidi_share_lite.apk" class="btn">⬇ Download Qaidi Share Lite APK (2.1 MB)</a>
      </div>
    </body>
    </html>
  `.trim();
}
