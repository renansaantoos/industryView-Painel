import path from 'path';
import fs from 'fs';
import config from '../config/env';

// GCPStorage type — importado de forma lazy para não falhar quando o pacote não está instalado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GCPStorage = any;

interface UploadResult {
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

class StorageService {
  private gcpStorage: GCPStorage | null = null;
  private gcpBucket: string | null = null;

  constructor() {
    if (config.storage.type === 'gcp') {
      try {
        // Importação lazy — só carrega o pacote se GCP for necessário
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Storage } = require('@google-cloud/storage');
        const credValue = config.storage.gcp.credentials || './gcp-storage-key.json';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gcpOptions: Record<string, any> = {
          projectId: config.storage.gcp.projectId,
        };

        if (credValue.trim().startsWith('{')) {
          try {
            gcpOptions.credentials = JSON.parse(credValue);
            console.log('[StorageService] GCP credentials loaded from environment variable (JSON)');
          } catch {
            console.warn('[StorageService] Failed to parse GCP_CREDENTIALS JSON, falling back to local storage');
            return;
          }
        } else {
          const credPath = path.resolve(credValue);
          if (!fs.existsSync(credPath)) {
            console.warn(`[StorageService] GCP credentials not found at ${credPath}, falling back to local storage`);
            return;
          }
          gcpOptions.keyFilename = credPath;
          console.log(`[StorageService] GCP credentials loaded from file: ${credPath}`);
        }

        this.gcpStorage = new Storage(gcpOptions);
        this.gcpBucket = config.storage.gcp.bucketName || null;
        console.log(`[StorageService] GCP Storage initialized - bucket: ${this.gcpBucket}`);
      } catch {
        console.warn('[StorageService] @google-cloud/storage not installed, falling back to local storage');
      }
    } else {
      console.log(`[StorageService] Local storage initialized - path: ${config.storage.path}`);
    }
  }

  async upload(file: Express.Multer.File, folder: string = 'attachments'): Promise<UploadResult> {
    if (this.gcpStorage && this.gcpBucket) {
      return this.uploadToGCP(file, folder);
    }
    return this.uploadToLocal(file, folder);
  }

  private async uploadToGCP(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const bucket = this.gcpStorage!.bucket(this.gcpBucket!);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    const filename = `${folder}/${uniqueSuffix}${ext}`;

    const blob = bucket.file(filename);
    await blob.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
        },
      },
    });

    // Generate a signed URL (valid for 7 days) instead of makePublic
    // This works with uniform bucket-level access and org policies that block allUsers
    const [signedUrl] = await blob.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove temp file if multer saved to disk
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      file_url: signedUrl,
      file_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size,
    };
  }

  /**
   * Generates a fresh signed URL for an existing GCP file.
   * Use this to refresh expired URLs.
   */
  async getSignedUrl(filePath: string, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): Promise<string | null> {
    if (!this.gcpStorage || !this.gcpBucket) return null;
    const blob = this.gcpStorage.bucket(this.gcpBucket).file(filePath);
    const [exists] = await blob.exists();
    if (!exists) return null;
    const [signedUrl] = await blob.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMs,
    });
    return signedUrl;
  }

  private async uploadToLocal(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const dest = path.resolve(config.storage.path, folder);
    fs.mkdirSync(dest, { recursive: true });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    const filePath = path.join(dest, filename);

    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path) {
      fs.renameSync(file.path, filePath);
    }

    return {
      file_url: `/uploads/${folder}/${filename}`,
      file_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size,
    };
  }

  async delete(fileUrl: string): Promise<void> {
    if (this.gcpStorage && this.gcpBucket && fileUrl.includes('storage.googleapis.com')) {
      const filePath = fileUrl.split(`${this.gcpBucket}/`)[1];
      if (filePath) {
        await this.gcpStorage.bucket(this.gcpBucket).file(filePath).delete().catch(() => {});
      }
    }
  }
}

export const storageService = new StorageService();
