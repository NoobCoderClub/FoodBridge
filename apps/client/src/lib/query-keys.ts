export const authKeys = {
  currentUser: ['auth', 'me'] as const,
};

export const listingKeys = {
  all: ['listings'] as const,
  browse: (lat?: number, lng?: number) => ['listings', 'browse', lat ?? null, lng ?? null] as const,
  detail: (id: string) => ['listings', 'detail', id] as const,
};
