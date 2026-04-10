import { z } from 'zod'
import { StemModel } from '@/models/Stem'
import { connectDB, isMongoConfigured } from '@/lib/mongodb'
import { logAuditEvent } from '@/lib/audit'
import { presignPutStemObject } from '@/lib/s3'
import { getEnv } from '@/lib/env'
import { createStemId, sanitizeFilename } from '@/lib/stemId'
import { corsHeaders, jsonResponse } from '@/lib/cors'

export const runtime = 'nodejs'

const bodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  title: z.string().min(1),
  owner: z.string().min(1),
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

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return jsonResponse({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { filename, contentType, title, owner, actorId, actorLabel } =
    parsed.data
  const safeName = sanitizeFilename(filename)
  const stemId = createStemId()
  const s3Key = `stems/${stemId}/${safeName}`

  await connectDB()

  await StemModel.create({
    stemId,
    title,
    owner,
    status: 'pending_upload',
    s3Key,
    contentType,
    version: 1,
  })

  await logAuditEvent({
    actorId,
    actorLabel,
    action: 'upload_presign_issued',
    resourceType: 'upload',
    resourceId: stemId,
    detail: { s3Key, contentType },
  })

  const env = getEnv()
  const useMock = env.GATEKEEPER_MOCK_CLOUD === true

  if (useMock) {
    return jsonResponse({
      stemId,
      s3Key,
      expiresIn: 600,
      mockCloud: true,
      uploadUrl: null,
      message:
        'GATEKEEPER_MOCK_CLOUD is enabled; configure AWS and unset mock for real S3 presigned PUT URLs.',
    })
  }

  const signed = await presignPutStemObject({ s3Key, contentType })
  if (!signed) {
    return jsonResponse(
      {
        error:
          'S3 is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET or enable GATEKEEPER_MOCK_CLOUD=true for local testing.',
        stemId,
        s3Key,
      },
      { status: 503 },
    )
  }

  return jsonResponse({
    stemId,
    s3Key,
    expiresIn: signed.expiresIn,
    uploadUrl: signed.url,
    serverSideEncryption: 'AES256',
    mockCloud: false,
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
