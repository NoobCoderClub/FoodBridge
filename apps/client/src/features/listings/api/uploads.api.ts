import { apiFetch } from '@/lib/api-client';

export const MAX_LISTING_IMAGES = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PresignedUpload {
  key: string;
  uploadUrl: string;
  expiresIn: number;
}

/**
 * Uploads one photo straight to the bucket and resolves to its object key,
 * which `POST /listings` later attaches to the listing.
 *
 * Only the presign call goes through `apiFetch` (and so through our auth
 * header); the PUT is a bare cross-origin request to storage, carrying no
 * credentials of ours. The URL itself is the authorisation, and it expires.
 */
export async function uploadListingImage(file: File): Promise<string> {
  const { key, uploadUrl } = await apiFetch<PresignedUpload>('/uploads/listing-image/presign', {
    method: 'POST',
    body: JSON.stringify({ contentType: file.type, contentLength: file.size }),
  });

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    // Content-Length is signed too, but it is a forbidden header here — the
    // browser sets it from the File, which is exactly the size we declared.
    headers: { 'Content-Type': file.type },
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  return key;
}
