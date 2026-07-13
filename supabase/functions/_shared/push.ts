/**
 * Native push notification sending — direct APNs (iOS) and FCM HTTP v1
 * (Android). Both require a signed JWT; Deno's Web Crypto API (available
 * in the Edge Function runtime) does the signing without any external
 * library.
 *
 * Required secrets — see SETUP.md:
 *   APNS_KEY_P8      — contents of the .p8 auth key from Apple Developer
 *   APNS_KEY_ID       — the key's ID (Apple Developer → Keys)
 *   APNS_TEAM_ID      — your Apple Developer team ID
 *   APNS_BUNDLE_ID    — the app's bundle ID (app.carecircle)
 *   FCM_PROJECT_ID    — Firebase project ID
 *   FCM_SERVICE_ACCOUNT_JSON — the full service account JSON, as one line
 */

function base64url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pemToDer(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '')
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  pem: string,
  alg: 'RS256' | 'ES256'
): Promise<string> {
  const encoder = new TextEncoder()
  const headerB64  = base64url(encoder.encode(JSON.stringify(header)))
  const payloadB64 = base64url(encoder.encode(JSON.stringify(payload)))
  const signingInput = `${headerB64}.${payloadB64}`

  const der = pemToDer(pem)
  const key = alg === 'RS256'
    ? await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
    : await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])

  const signAlgo = alg === 'RS256'
    ? 'RSASSA-PKCS1-v1_5'
    : { name: 'ECDSA', hash: 'SHA-256' }

  const signature = await crypto.subtle.sign(signAlgo as any, key, encoder.encode(signingInput))
  return `${signingInput}.${base64url(new Uint8Array(signature))}`
}

// ── APNs (iOS) ──────────────────────────────────────────────────────────

export async function sendApnsPush(opts: {
  deviceToken: string
  title: string
  body: string
  data?: Record<string, unknown>
}): Promise<{ ok: boolean; status: number; detail?: string }> {
  const keyP8    = Deno.env.get('APNS_KEY_P8')
  const keyId    = Deno.env.get('APNS_KEY_ID')
  const teamId   = Deno.env.get('APNS_TEAM_ID')
  const bundleId = Deno.env.get('APNS_BUNDLE_ID') ?? 'app.carecircle'

  if (!keyP8 || !keyId || !teamId) {
    return { ok: false, status: 0, detail: 'APNs secrets not configured' }
  }

  const jwt = await signJwt(
    { alg: 'ES256', kid: keyId },
    { iss: teamId, iat: Math.floor(Date.now() / 1000) },
    keyP8,
    'ES256'
  )

  const res = await fetch(`https://api.push.apple.com/3/device/${opts.deviceToken}`, {
    method: 'POST',
    headers: {
      'authorization': `bearer ${jwt}`,
      'apns-topic': bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      aps: { alert: { title: opts.title, body: opts.body }, sound: 'default' },
      ...opts.data,
    }),
  })

  return { ok: res.ok, status: res.status, detail: res.ok ? undefined : await res.text() }
}

// ── FCM HTTP v1 (Android) ───────────────────────────────────────────────

async function getFcmAccessToken(): Promise<string> {
  const raw = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON')
  if (!raw) throw new Error('FCM_SERVICE_ACCOUNT_JSON not configured')
  const account = JSON.parse(raw)

  const now = Math.floor(Date.now() / 1000)
  const jwt = await signJwt(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: account.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    account.private_key,
    'RS256'
  )

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`FCM token exchange failed: ${JSON.stringify(json)}`)
  return json.access_token
}

export async function sendFcmPush(opts: {
  deviceToken: string
  title: string
  body: string
  data?: Record<string, unknown>
}): Promise<{ ok: boolean; status: number; detail?: string }> {
  const projectId = Deno.env.get('FCM_PROJECT_ID')
  if (!projectId) return { ok: false, status: 0, detail: 'FCM_PROJECT_ID not configured' }

  try {
    const accessToken = await getFcmAccessToken()
    // FCM data payload values must all be strings
    const stringData = Object.fromEntries(
      Object.entries(opts.data ?? {}).map(([k, v]) => [k, String(v)])
    )

    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: opts.deviceToken,
          notification: { title: opts.title, body: opts.body },
          data: stringData,
        },
      }),
    })

    return { ok: res.ok, status: res.status, detail: res.ok ? undefined : await res.text() }
  } catch (err) {
    return { ok: false, status: 0, detail: err.message }
  }
}

// ── Dispatch by stored platform ─────────────────────────────────────────

export async function sendPushToUser(
  supabase: any,
  userId: string,
  notification: { title: string; body: string; data?: Record<string, unknown> }
): Promise<{ sent: boolean; reason?: string }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token, push_platform')
    .eq('id', userId)
    .single()

  if (!profile?.push_token || !profile?.push_platform) {
    return { sent: false, reason: 'no device registered' }
  }

  const result = profile.push_platform === 'ios'
    ? await sendApnsPush({ deviceToken: profile.push_token, ...notification })
    : await sendFcmPush({ deviceToken: profile.push_token, ...notification })

  return { sent: result.ok, reason: result.ok ? undefined : result.detail }
}
