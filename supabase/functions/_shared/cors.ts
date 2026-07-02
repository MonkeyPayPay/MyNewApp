/**
 * Origin-allowlisted CORS headers for client-called Edge Functions.
 * Reflects the request Origin only when it's on the allowlist; otherwise
 * falls back to the production app URL (so an off-list origin's browser
 * blocks the response).
 *
 * capacitor://localhost and https://localhost are the WebView origins for
 * the iOS and Android native apps respectively.
 */
const ALLOWED_ORIGINS = [
  Deno.env.get('APP_URL') ?? 'https://carecircle.app',
  'capacitor://localhost',
  'https://localhost',
  'http://localhost:5173',
]

export function corsHeaders(
  req: Request,
  allowHeaders = 'authorization, content-type',
): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': allowHeaders,
    'Vary': 'Origin',
  }
}
