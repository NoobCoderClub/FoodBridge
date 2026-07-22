import type { AccountStatus, ClaimStatus, ListingStatus, QuantityUnit, UserRole } from './enums';

// Mirrors Better Auth's base `user` model fields plus our `additionalFields`.
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  status: AccountStatus;
  phone: string | null;
  verificationInfo: Record<string, unknown> | null;
}

export interface Listing {
  id: string;
  posterId: string;
  foodType: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  latitude: number;
  longitude: number;
  addressApprox: string;
  addressExact: string | null;
  preparedAt: string;
  expiresAt: string;
  status: ListingStatus;
  createdAt: string;
}

export interface Claim {
  id: string;
  listingId: string;
  takerId: string;
  claimedAt: string;
  pickupDeadline: string;
  status: ClaimStatus;
  completedAt: string | null;
}

export interface Reputation {
  userId: string;
  completedCount: number;
  noShowCount: number;
  score: number;
  updatedAt: string;
}
