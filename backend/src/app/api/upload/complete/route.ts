import { z } from 'zod'
import { StemModel } from '@/models/Stem'
import { connectDB, isMongoConfigured } from '@/lib/mongodb'
import { logAuditEvent } from '@/lib/audit'
import { corsHeaders, jsonResponse } from '@/lib/cors'

export const runtime = 'nodejs'

const bodySchema = z.object({
  stemId: z.string().min(1),
  sizeBytes: z.number().optional(),
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

  const { stemId, sizeBytes, actorId, actorLabel } = parsed.data

  await connectDB()

  const updated = await StemModel.findOneAndUpdate(
    { stemId },
    {
      $set: {
        status: 'encrypted',
        ...(typeof sizeBytes === 'number' ? { sizeBytes } : {}),
      },
    },
    { new: true },
  ).lean()

  if (!updated) {
    return jsonResponse({ error: 'Stem not found' }, { status: 404 })
  }

  await logAuditEvent({
    actorId,
    actorLabel,
    action: 'upload_completed',
    resourceType: 'upload',
    resourceId: stemId,
    detail: { sizeBytes },
  })

  return jsonResponse({
    ok: true,
    stemId: updated.stemId,
    status: updated.status,
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
