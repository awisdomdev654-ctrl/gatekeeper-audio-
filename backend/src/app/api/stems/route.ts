import { StemModel } from '@/models/Stem'
import { connectDB, isMongoConfigured } from '@/lib/mongodb'
import { corsHeaders, jsonResponse } from '@/lib/cors'

export const runtime = 'nodejs'

export async function GET() {
  if (!isMongoConfigured()) {
    return jsonResponse({ error: 'MongoDB is not configured' }, { status: 503 })
  }

  await connectDB()
  const stems = await StemModel.find().sort({ updatedAt: -1 }).limit(100).lean()

  return jsonResponse({
    stems: stems.map((s) => ({
      id: s.stemId,
      title: s.title,
      owner: s.owner,
      status: mapStatus(s.status),
      contentType: s.contentType,
      version: s.version,
      updatedAt: s.updatedAt,
    })),
  })
}

function mapStatus(status: string): string {
  switch (status) {
    case 'encrypted':
      return 'Encrypted'
    case 'awaiting_review':
      return 'Awaiting Review'
    case 'signed_url_active':
      return 'Signed URL Active'
    case 'pending_upload':
      return 'Pending Upload'
    default:
      return status
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
