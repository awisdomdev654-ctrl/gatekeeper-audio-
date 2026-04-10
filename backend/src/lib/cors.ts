const origin =
  process.env.GATEKEEPER_CORS_ORIGIN ??
  (process.env.NODE_ENV === 'development' ? '*' : '')

export function corsHeaders(): HeadersInit {
  const h: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  if (origin) {
    h['Access-Control-Allow-Origin'] = origin
  }
  return h
}

export function jsonResponse(
  data: unknown,
  init?: ResponseInit,
): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
      ...(init?.headers ?? {}),
    },
  })
}
