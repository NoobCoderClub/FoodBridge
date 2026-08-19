import { IsIn, IsInt, IsPositive, Max } from 'class-validator';
import { ALLOWED_IMAGE_TYPES } from '../../storage/storage.service';

/** Kept in step with `S3_MAX_UPLOAD_BYTES` in `.env.example`. */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Both fields end up inside the presigned URL's signature, so they are not
 * advisory: the bucket rejects any upload whose headers disagree with what was
 * validated here.
 */
export class PresignUploadDto {
  @IsIn(ALLOWED_IMAGE_TYPES)
  contentType!: string;

  @IsInt()
  @IsPositive()
  @Max(MAX_UPLOAD_BYTES)
  contentLength!: number;
}
