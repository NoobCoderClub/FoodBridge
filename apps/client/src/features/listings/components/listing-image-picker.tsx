'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, TriangleAlert, X } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/lib/utils';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_LISTING_IMAGES,
  uploadListingImage,
} from '../api/uploads.api';

interface Item {
  id: string;
  previewUrl: string;
  status: 'uploading' | 'done' | 'error';
  key?: string;
}

interface ListingImagePickerProps {
  /** Fires with the uploaded object keys in display order. */
  onChange: (keys: string[]) => void;
  /** True while any upload is in flight, so the form can hold back submit. */
  onUploadingChange: (uploading: boolean) => void;
}

function describeRejection(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name} isn’t a JPEG, PNG or WebP.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name} is over ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB.`;
  }
  return null;
}

export function ListingImagePicker({ onChange, onUploadingChange }: ListingImagePickerProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [rejection, setRejection] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Object URLs are held for the lifetime of a tile and revoked on removal, so
  // the only ones left at unmount are those still on screen.
  const previewUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function publish(next: Item[]) {
    setItems(next);
    onChange(next.flatMap((item) => (item.key ? [item.key] : [])));
    onUploadingChange(next.some((item) => item.status === 'uploading'));
  }

  async function handleFiles(fileList: FileList) {
    setRejection(null);
    const files = Array.from(fileList);

    const room = MAX_LISTING_IMAGES - items.length;
    if (files.length > room) {
      setRejection(
        `You can attach ${MAX_LISTING_IMAGES} photos in total — keeping the first ${room > 0 ? room : 0}.`,
      );
    }

    const accepted: File[] = [];
    for (const file of files.slice(0, Math.max(room, 0))) {
      const problem = describeRejection(file);
      if (problem) setRejection(problem);
      else accepted.push(file);
    }
    if (accepted.length === 0) return;

    const pending: Item[] = accepted.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return { id: crypto.randomUUID(), previewUrl, status: 'uploading' };
    });

    // Snapshot rather than reading `items` inside the async callbacks below:
    // several uploads settle independently and must not clobber each other.
    let current = [...items, ...pending];
    publish(current);

    await Promise.all(
      accepted.map(async (file, index) => {
        const id = pending[index]!.id;
        try {
          const key = await uploadListingImage(file);
          current = current.map((item) =>
            item.id === id ? { ...item, status: 'done', key } : item,
          );
        } catch {
          current = current.map((item) => (item.id === id ? { ...item, status: 'error' } : item));
          setRejection(`Couldn’t upload ${file.name}. Remove it and try again.`);
        }
        publish(current);
      }),
    );
  }

  function remove(id: string) {
    const target = items.find((item) => item.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
      previewUrls.current.delete(target.previewUrl);
    }
    publish(items.filter((item) => item.id !== id));
  }

  const full = items.length >= MAX_LISTING_IMAGES;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          // Reset so re-picking the same file still fires a change event.
          e.target.value = '';
        }}
      />

      {items.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.id} className="relative">
              <div
                className={cn(
                  'relative aspect-square overflow-hidden rounded-lg border border-border bg-muted',
                  item.status === 'error' && 'border-destructive',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="" className="size-full object-cover" />

                {item.status !== 'done' ? (
                  <div className="absolute inset-0 grid place-items-center bg-background/60">
                    {item.status === 'uploading' ? (
                      <Loader2
                        className="size-5 animate-spin text-muted-foreground"
                        aria-label="Uploading"
                      />
                    ) : (
                      <TriangleAlert
                        className="size-5 text-destructive"
                        aria-label="Upload failed"
                      />
                    )}
                  </div>
                ) : null}

                {index === 0 ? (
                  <span className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-center text-[11px] font-medium">
                    Cover
                  </span>
                ) : null}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                className="absolute -top-2 -right-2 rounded-full shadow-soft"
                onClick={() => remove(item.id)}
              >
                <X aria-hidden="true" />
                <span className="sr-only">Remove photo {index + 1}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={full}
      >
        <ImagePlus aria-hidden="true" />
        {items.length > 0 ? 'Add more photos' : 'Add photos'}
      </Button>

      <p className="text-xs text-muted-foreground">
        {full
          ? `That’s all ${MAX_LISTING_IMAGES} photos.`
          : `JPEG, PNG or WebP, up to ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB each.`}
      </p>

      {rejection ? <p className="text-xs text-destructive">{rejection}</p> : null}
    </div>
  );
}
