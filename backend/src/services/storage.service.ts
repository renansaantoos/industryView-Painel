import { Storage as GCPStorage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import config from '../config/env';

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
      const credPath = path.resolve(config.storage.gcp.credentials || './gcp-storage-key.json');
      if (!fs.existsSync(credPath)) {
        console.warn(`[StorageService] GCP credentials not found at ${credPath}, falling back to local storage`);
        return;
      }
      this.gcpStorage = new GCPStorage({
        projectId: config.storage.gcp.projectId,
        keyFilename: credPath,
      });
      this.gcpBucket = config.storage.gcp.bucketName || null;
      console.log(`[StorageService] GCP Storage initialized - bucket: ${this.gcpBucket}`);
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

    await blob.makePublic();
    const fileUrl = `https://storage.googleapis.com/${this.gcpBucket}/${filename}`;

    // Remove temp file if multer saved to disk
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      file_url: fileUrl,
      file_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size,
    };
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
