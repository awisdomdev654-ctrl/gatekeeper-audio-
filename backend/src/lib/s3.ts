import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getEnv, SIGNED_URL_TTL_SECONDS } from './env'

function getS3Client(): S3Client | null {
  const env = getEnv()
  if (
    !env.AWS_REGION ||
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.S3_BUCKET
  ) {
    return null
  }
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  })
}

export function isS3Configured(): boolean {
  return getS3Client() !== null && Boolean(getEnv().S3_BUCKET)
}

export async function presignPutStemObject(params: {
  s3Key: string
  contentType: string
}): Promise<{ url: string; expiresIn: number } | null> {
  const env = getEnv()
  const client = getS3Client()
  const bucket = env.S3_BUCKET
  if (!client || !bucket) {
    return null
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.s3Key,
    ContentType: params.contentType,
    ServerSideEncryption: 'AES256',
  })

  const url = await getSignedUrl(client, command, {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  })

  return { url, expiresIn: SIGNED_URL_TTL_SECONDS }
}

export async function presignGetStemObject(params: {
  s3Key: string
}): Promise<{ url: string; expiresIn: number } | null> {
  const env = getEnv()
  const client = getS3Client()
  const bucket = env.S3_BUCKET
  if (!client || !bucket) {
    return null
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: params.s3Key,
  })

  const url = await getSignedUrl(client, command, {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  })

  return { url, expiresIn: SIGNED_URL_TTL_SECONDS }
}
