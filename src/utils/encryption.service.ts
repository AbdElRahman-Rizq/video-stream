import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-ctr';
  private readonly key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'your-secret-key', 'salt', 32);

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final()
    ]);
    return decrypted.toString();
  }
}
