export const authKeys = {
  currentUser: ['auth', 'me'] as const,
};

export const accountKeys = {
  all: ['accounts'] as const,
  list: (status?: string) => ['accounts', 'list', status ?? 'all'] as const,
  detail: (id: string) => ['accounts', 'detail', id] as const,
};
