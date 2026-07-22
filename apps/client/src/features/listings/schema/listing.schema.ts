import { z } from 'zod';

export const createListingSchema = z.object({
  foodType: z.string().min(1),
  quantity: z.coerce.number().positive(),
  quantityUnit: z.enum(['kg', 'servings']),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  addressApprox: z.string().min(1),
  addressExact: z.string().min(1),
  preparedAt: z.string().min(1),
  expiresAt: z.string().min(1),
});
export type CreateListingInput = z.infer<typeof createListingSchema>;
