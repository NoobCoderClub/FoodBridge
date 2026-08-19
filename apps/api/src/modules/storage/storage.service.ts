import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** Upload types the bucket accepts, mapped to the extension used in the key. */
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const ALLOWED_IMAGE_TYPES = Object.keys(EXTENSIONS);

/** Uploads land here first; a lifecycle rule on the prefix sweeps the strays. */
const PENDING_PREFIX = 'pending';
/** Promoted here once a listing row owns them. */
const LISTINGS_PREFIX = 'listings';

const PRESIGNED_PUT_TTL_SECONDS = 300;

export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  expiresIn: number;
}

/**
 * Object storage for listing photos, over the S3 API (MinIO locally, real S3 in
 * production — the difference is entirely in env vars).
 *
 * Image bytes never pass through this process. The browser uploads straight to
 * the bucket with a presigned PUT and reads back through presigned GETs, so the
 * bucket itself stays private with no anonymous access policy.
 */
@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly signedGetTtl: number;

  constructor(configService: ConfigService) {
    const endpoint = configService.get<string>('S3_ENDPOINT');
    const accessKeyId = configService.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = configService.get<string>('S3_SECRET_KEY');
    const bucket = configService.get<string>('S3_BUCKET');

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new InternalServerErrorException(
        'S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY and S3_BUCKET must all be set',
      );
    }

    this.bucket = bucket;
    this.signedGetTtl = Number(
      configService.get<string>('S3_SIGNED_GET_TTL') ?? 3600,
    );

    this.client = new S3Client({
      endpoint,
      region: configService.get<string>('S3_REGION') ?? 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
      // MinIO serves buckets as a path segment. Without this the SDK builds
      // virtual-host URLs like `bucket.localhost:9000`, which resolve nowhere.
      forcePathStyle: true,
      // Otherwise the SDK folds a CRC32 of the (absent) body into the presigned
      // URL, so the signature commits to a checksum the browser's actual bytes
      // will never match. MinIO ignores it; S3 fails the upload outright.
      requestChecksumCalculation: 'WHEN_REQUIRED',
    });
  }

  /**
   * Mints a URL the browser can PUT one image to.
   *
   * `content-type` and `content-length` are part of the signature, so MinIO
   * rejects a PUT whose headers differ from what was approved here. That is the
   * only server-side check available on this path — with the bytes bypassing
   * the API there is nothing to inspect — and it is what caps upload size.
   */
  async presignUpload(
    userId: string,
    contentType: string,
    contentLength: number,
  ): Promise<PresignedUpload> {
    const extension = EXTENSIONS[contentType];
    if (!extension) {
      throw new BadRequestException(`Unsupported image type: ${contentType}`);
    }

    const key = `${PENDING_PREFIX}/${userId}/${randomUUID()}.${extension}`;

    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
      }),
      {
        expiresIn: PRESIGNED_PUT_TTL_SECONDS,
        signableHeaders: new Set(['content-type', 'content-length']),
      },
    );

    return { key, uploadUrl, expiresIn: PRESIGNED_PUT_TTL_SECONDS };
  }

  /** Short-lived read URL for one stored object. */
  presignDownload(key: string): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: this.signedGetTtl },
    );
  }

  /**
   * Signing is a local HMAC with no round-trip to the bucket, so signing one URL
   * per card in a feed response stays cheap.
   */
  presignDownloadMany(keys: string[]): Promise<string[]> {
    return Promise.all(keys.map((key) => this.presignDownload(key)));
  }

  /**
   * Moves a member's pending uploads into the permanent prefix, returning the
   * new keys in the same order.
   *
   * The copy is server-side inside the bucket — no bytes traverse this process.
   * Restricting the source to `pending/<ownerId>/` is what stops a member
   * attaching somebody else's freshly uploaded object to their own listing by
   * passing its key.
   *
   * The destination is flat rather than nested under the listing id, so this can
   * run *before* the row exists. That ordering is what keeps listing creation a
   * single stored-procedure call: no transaction spanning the bucket and the
   * database, and no second write to patch keys up afterwards.
   */
  async promote(ownerId: string, keys: string[]): Promise<string[]> {
    const allowedSource = new RegExp(
      `^${PENDING_PREFIX}/${ownerId}/[0-9a-f-]{36}\\.(jpg|png|webp)$`,
    );

    const promoted: string[] = [];

    for (const key of keys) {
      if (!allowedSource.test(key)) {
        throw new BadRequestException(`Unknown or unowned image: ${key}`);
      }

      const filename = key.slice(key.lastIndexOf('/') + 1);
      const destination = `${LISTINGS_PREFIX}/${filename}`;

      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          // CopySource is bucket-qualified and must be URI-encoded.
          CopySource: encodeURIComponent(`${this.bucket}/${key}`),
          Key: destination,
        }),
      );

      promoted.push(destination);
    }

    // Only once every copy landed, so a mid-loop failure leaves the sources
    // intact for the lifecycle rule rather than destroying them.
    await this.deleteObjects(keys);

    return promoted;
  }

  async deleteObjects(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    );
  }
}
