import { z } from 'zod';

/**
 * The form holds coordinates as strings, and `z.coerce.number()` turns `''`
 * into `0` — which sits inside every latitude/longitude bound, so an untouched
 * form used to post a listing at (0, 0) in the Gulf of Guinea. Rejecting the
 * empty string before coercion is what makes the location genuinely required.
 */
const coordinate = (limit: number) =>
  z
    .string()
    .min(1, 'Set your location before posting.')
    .transform(Number)
    .pipe(z.number().min(-limit).max(limit));

export const createListingSchema = z.object({
  foodType: z.string().min(1),
  quantity: z.coerce.number().positive(),
  quantityUnit: z.enum(['kg', 'servings']),
  latitude: coordinate(90),
  longitude: coordinate(180),
  addressApprox: z.string().min(1),
  addressExact: z.string().min(1),
  preparedAt: z.string().min(1),
  expiresAt: z.string().min(1),
  imageKeys: z.array(z.string()).max(5).default([]),
});
export type CreateListingInput = z.infer<typeof createListingSchema>;
