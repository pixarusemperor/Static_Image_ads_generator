import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
  console.error('Error: Missing Cloudflare R2 environment variables.');
  console.error('Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}

async function uploadDirectory(dirPath: string, baseDir: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await uploadDirectory(fullPath, baseDir);
    } else if (entry.isFile()) {
      const relativeKey = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const body = fs.readFileSync(fullPath);
      const contentType = getContentType(fullPath);

      console.log(`Uploading ${relativeKey} (${(body.length / 1024).toFixed(1)} KB)...`);
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: relativeKey,
            Body: body,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        );
        console.log(`✓ Uploaded ${relativeKey}`);
      } catch (err) {
        console.error(`✗ Failed to upload ${relativeKey}:`, err);
      }
    }
  }
}

async function main() {
  console.log(`Starting asset synchronization to R2 bucket: ${bucketName}...`);
  const publicDir = path.resolve(process.cwd(), 'public');
  const templatesDir = path.join(publicDir, 'templates');

  if (!fs.existsSync(templatesDir)) {
    console.error(`Templates directory not found at ${templatesDir}`);
    process.exit(1);
  }

  // Upload templates/ directory with keys like templates/assets/... and templates/thumbnails/...
  await uploadDirectory(templatesDir, publicDir);
  console.log('✓ Asset synchronization complete!');
}

main().catch((err) => {
  console.error('Fatal error during R2 sync:', err);
  process.exit(1);
});
