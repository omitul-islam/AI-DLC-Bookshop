import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let _s3: S3Client | null = null;

function getS3(): S3Client {
  if (!_s3) {
    const endpoint = process.env.S3_ENDPOINT;
    if (!endpoint) {
      throw new Error('S3 not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in .env');
    }
    _s3 = new S3Client({
      endpoint,
      region: process.env.S3_REGION || 'ap-northeast-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
  }
  return _s3;
}

export async function uploadBookCover(
  bookId: string,
  file: Express.Multer.File
): Promise<string> {
  const s3 = getS3();
  const bucket = process.env.S3_BUCKET || 'bookshop';
  const ext = file.originalname.split('.').pop() || 'jpg';
  const key = `books/${bookId}/${Date.now()}.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  const endpoint = process.env.S3_ENDPOINT || '';
  const projectRef = endpoint.replace('https://', '').split('.')[0];
  return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucket}/${key}`;
}
