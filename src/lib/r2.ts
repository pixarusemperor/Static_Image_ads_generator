import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env, isR2Configured, getR2PublicUrl } from './env';

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return s3ClientInstance;
}

/**
 * Returns the public URL for an asset.
 * If R2_PUBLIC_URL is configured, maps `/templates/...` or custom keys to the R2 CDN.
 * Otherwise returns the original local path.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const publicUrl = getR2PublicUrl();
  if (publicUrl) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${publicUrl}${cleanPath}`;
  }

  return path;
}

/**
 * Upload a buffer or Uint8Array to Cloudflare R2 bucket.
 * Returns the public URL if R2_PUBLIC_URL is set, or the relative storage key.
 */
export async function uploadToR2({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<string> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured. Missing R2 environment variables.');
  }

  const cleanKey = key.startsWith('/') ? key.slice(1) : key;

  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: cleanKey,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  const publicBase = getR2PublicUrl();
  if (publicBase) {
    return `${publicBase}/${cleanKey}`;
  }

  return `/${cleanKey}`;
}
