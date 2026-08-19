// One customer-facing profile: a `member` both posts surplus food and claims it.
// Poster/taker survive as per-exchange positions (`listings.poster_id`,
// `claims.taker_id`), never as account types.
export type UserRole = 'member' | 'admin';

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type ListingStatus = 'available' | 'claimed' | 'completed' | 'expired';

export type ClaimStatus = 'active' | 'completed' | 'no_show';

export type QuantityUnit = 'kg' | 'servings';
