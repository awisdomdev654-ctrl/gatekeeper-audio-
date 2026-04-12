import mongoose, { Schema } from 'mongoose'

export type StemStatus =
  | 'pending_upload'
  | 'encrypted'
  | 'awaiting_review'
  | 'signed_url_active'

export interface StemDoc {
  stemId: string
  title: string
  owner: string
  status: StemStatus
  s3Key: string
  contentType: string
  version: number
  sizeBytes?: number
  createdAt: Date
  updatedAt: Date
}

const StemSchema = new Schema<StemDoc>(
  {
    stemId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    owner: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        'pending_upload',
        'encrypted',
        'awaiting_review',
        'signed_url_active',
      ],
    },
    s3Key: { type: String, required: true },
    contentType: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
    sizeBytes: { type: Number },
  },
  { timestamps: true },
)

export const StemModel =
  mongoose.models.Stem ?? mongoose.model<StemDoc>('Stem', StemSchema)
