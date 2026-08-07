import fs from 'fs';
import path from 'path';

export interface StorageService {
  uploadFile(fileName: string, base64Content: string): Promise<string>;
  getDownloadUrl(fileName: string): string;
}

class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(fileName: string, base64Content: string): Promise<string> {
    // Strip metadata prefix if exists (e.g., "data:application/pdf;base64,")
    const cleanBase64 = base64Content.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    // Create unique file name to avoid overwrite
    const timestamp = Date.now();
    const parsed = path.parse(fileName);
    const uniqueFileName = `${parsed.name}_${timestamp}${parsed.ext}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    await fs.promises.writeFile(filePath, buffer);
    console.log(`[Storage] Saved file locally to: ${filePath}`);
    
    // In local development, we serve /uploads statically
    return `/uploads/${uniqueFileName}`;
  }

  getDownloadUrl(fileName: string): string {
    return `/uploads/${fileName}`;
  }
}

class S3StorageService implements StorageService {
  private bucketName: string;
  private region: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'my-bucket';
    this.region = process.env.S3_REGION || 'eu-central-1';
    console.log(`[Storage] Initialized AWS S3 Provider for Bucket: ${this.bucketName} in ${this.region}`);
  }

  async uploadFile(fileName: string, base64Content: string): Promise<string> {
    // In production, you would use @aws-sdk/client-s3 here
    // e.g., s3Client.send(new PutObjectCommand({ ... }))
    console.log(`[Storage Mock] Uploading ${fileName} to AWS S3 bucket: ${this.bucketName}`);
    
    // Simulate AWS S3 URL response
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/\s+/g, '_');
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/cvs/${timestamp}_${cleanFileName}`;
  }

  getDownloadUrl(fileName: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/cvs/${fileName}`;
  }
}

export function getStorageService(): StorageService {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  if (provider === 's3') {
    return new S3StorageService();
  }
  return new LocalStorageService();
}
