import { z } from 'zod'

const envSchema = z.object({
  MONGODB_URI: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  GATEKEEPER_MOCK_CLOUD: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  GATEKEEPER_SIGNED_URL_SECONDS: z.coerce.number().min(60).max(3600).optional(),
})

export type Env = z.infer<typeof envSchema>

export function getEnv(): Env {
  return envSchema.parse({
    MONGODB_URI: process.env.MONGODB_URI,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET: process.env.S3_BUCKET,
    GATEKEEPER_MOCK_CLOUD: process.env.GATEKEEPER_MOCK_CLOUD,
    GATEKEEPER_SIGNED_URL_SECONDS: process.env.GATEKEEPER_SIGNED_URL_SECONDS,
  })
}

export const SIGNED_URL_TTL_SECONDS =
  Number(process.env.GATEKEEPER_SIGNED_URL_SECONDS) || 600
