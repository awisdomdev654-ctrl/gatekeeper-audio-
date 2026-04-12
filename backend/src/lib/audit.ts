import { connectDB, isMongoConfigured } from './mongodb'
import { AuditEventModel } from '../models/AuditEvent'

export async function logAuditEvent(input: {
  actorId?: string
  actorLabel?: string
  action: string
  resourceType: 'stem' | 'upload' | 'download' | 'system'
  resourceId?: string
  detail?: Record<string, unknown>
}): Promise<void> {
  if (!isMongoConfigured()) {
    return
  }

  await connectDB()
  await AuditEventModel.create({
    actorId: input.actorId,
    actorLabel: input.actorLabel,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    detail: input.detail ?? {},
    createdAt: new Date(),
  })
}
