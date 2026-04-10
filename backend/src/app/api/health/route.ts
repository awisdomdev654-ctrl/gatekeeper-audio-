import { connectDB, isMongoConfigured } from '@/lib/mongodb'
import { isS3Configured } from '@/lib/s3'
import { corsHeaders, jsonResponse } from '@/lib/cors'

export const runtime = 'nodejs'

export async function GET() {
  let mongoOk = false
  if (isMongoConfigured()) {
    try {
      await connectDB()
      mongoOk = true
    } catch {
      mongoOk = false
    }
  }

  return jsonResponse({
    ok: true,
    service: 'gatekeeper-api',
    mongo: mongoOk,
    s3: isS3Configured(),
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
