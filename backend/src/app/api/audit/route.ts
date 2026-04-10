import { z } from 'zod'
import { AuditEventModel } from '@/models/AuditEvent'
import { connectDB, isMongoConfigured } from '@/lib/mongodb'
import { corsHeaders, jsonResponse } from '@/lib/cors'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!isMongoConfigured()) {
    return jsonResponse({ error: 'MongoDB is not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const limit = z.coerce.number().min(1).max(200).parse(searchParams.get('limit') ?? '50')

  await connectDB()

  const events = await AuditEventModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return jsonResponse({
    events: events.map((e) => ({
      id: String(e._id),
      action: e.action,
      resourceType: e.resourceType,
      resourceId: e.resourceId,
      actorId: e.actorId,
      actorLabel: e.actorLabel,
      detail: e.detail,
      createdAt: e.createdAt,
    })),
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
