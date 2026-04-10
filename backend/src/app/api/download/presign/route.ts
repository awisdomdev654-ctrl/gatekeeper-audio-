import { z } from 'zod'
import { StemModel } from '@/models/Stem'
import { connectDB, isMongoConfigured } from '@/lib/mongodb'
import { logAuditEvent } from '@/lib/audit'
import { presignGetStemObject } from '@/lib/s3'
import { getEnv } from '@/lib/env'
import { corsHeaders, jsonResponse } from '@/lib/cors'

export const runtime = 'nodejs'

const bodySchema = z.object({
  stemId: z.string().min(1),
  actorId: z.string().optional(),
  actorLabel: z.string().optional(),
})

export async function POST(request: Request) {
  if (!isMongoConfigured()) {
    return jsonResponse(
      { error: 'MongoDB is not configured (set MONGODB_URI)' },
      { status: 503 },
    )
  }

  let jsonBody: unknown
  try {
    jsonBody = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(jsonBody)
  if (!parsed.success) {
    return jsonResponse({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { stemId, actorId, actorLabel } = parsed.data

  await connectDB()

  const stem = await StemModel.findOne({ stemId }).lean()
  if (!stem) {
    return jsonResponse({ error: 'Stem not found' }, { status: 404 })
  }

  await StemModel.updateOne(
    { stemId },
    { $set: { status: 'signed_url_active' } },
  )

  await logAuditEvent({
    actorId,
    actorLabel,
    action: 'download_presign_issued',
    resourceType: 'download',
    resourceId: stemId,
    detail: { s3Key: stem.s3Key },
  })

  const env = getEnv()
  if (env.GATEKEEPER_MOCK_CLOUD === true) {
    return jsonResponse({
      stemId,
      expiresIn: 600,
      mockCloud: true,
      downloadUrl: null,
      message:
        'GATEKEEPER_MOCK_CLOUD is enabled; configure AWS for real GET presigned URLs.',
    })
  }

  const signed = await presignGetStemObject({ s3Key: stem.s3Key })
  if (!signed) {
    return jsonResponse(
      {
        error:
          'S3 is not configured. Set AWS credentials and S3_BUCKET or use GATEKEEPER_MOCK_CLOUD=true.',
      },
      { status: 503 },
    )
  }

  return jsonResponse({
    stemId,
    expiresIn: signed.expiresIn,
    downloadUrl: signed.url,
    mockCloud: false,
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
