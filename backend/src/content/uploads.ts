import {
  BadRequestException,
  CallHandler,
  Controller,
  ExecutionContext,
  NestInterceptor,
  PayloadTooLargeException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import type { ServerResponse } from 'node:http';
import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { catchError } from 'rxjs';
import { AuthGuard, Roles } from '../auth/auth.guard';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Where uploaded images live on disk; needs a persistent volume in production. */
export const uploadDir = () =>
  resolve(process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads'));

/** Serves uploads at /api/uploads/<name> (the global prefix does not apply to static files). */
export function serveUploads(app: NestExpressApplication) {
  const dir = uploadDir();
  mkdirSync(dir, { recursive: true });
  app.useStaticAssets(dir, {
    prefix: '/api/uploads/',
    index: false,
    dotfiles: 'deny',
    maxAge: '30d',
    immutable: true,
    setHeaders: (res: ServerResponse) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });
}

/** Detects the image type from the file's first bytes; the declared type is not trusted. */
export function sniffImage(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return 'jpg';
  }
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

interface UploadedImage {
  buffer: Buffer;
  size: number;
}

/** Replaces multer's English "File too large" with the panel's message. */
class FriendlyUploadErrors implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError((error: unknown) => {
        throw error instanceof PayloadTooLargeException
          ? new PayloadTooLargeException('La imagen supera los 5 MB')
          : error;
      }),
    );
  }
}

@Controller('admin/uploads')
@UseGuards(AuthGuard)
@Roles('admin')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FriendlyUploadErrors,
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    }),
  )
  async upload(@UploadedFile() file?: UploadedImage) {
    if (!file) throw new BadRequestException('Selecciona una imagen');
    const extension = sniffImage(file.buffer);
    if (!extension) {
      throw new BadRequestException('Solo se aceptan imágenes JPG, PNG o WebP');
    }
    const name = `${randomUUID()}.${extension}`;
    const dir = uploadDir();
    mkdirSync(dir, { recursive: true });
    await writeFile(join(dir, name), file.buffer, { flag: 'wx' });
    return { url: `/api/uploads/${name}` };
  }
}
