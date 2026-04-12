import mongoose, { Schema } from 'mongoose'

export interface AuditEventDoc {
  actorId?: string
  actorLabel?: string
  action: string
  resourceType: 'stem' | 'upload' | 'download' | 'system'
  resourceId?: string
  detail: Record<string, unknown>
  createdAt: Date
}

const AuditEventSchema = new Schema<AuditEventDoc>(
  {
    actorId: { type: String },
    actorLabel: { type: String },
    action: { type: String, required: true },
    resourceType: {
      type: String,
      required: true,
      enum: ['stem', 'upload', 'download', 'system'],
    },
    resourceId: { type: String },
    detail: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, required: true, index: true },
  },
  { versionKey: false },
)

export const AuditEventModel =
  mongoose.models.AuditEvent ??
  mongoose.model<AuditEventDoc>('AuditEvent', AuditEventSchema)
