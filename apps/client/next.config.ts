import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack transpiles workspace packages automatically, but the docs
  // enumerate npm/pnpm/Yarn workspaces and this repo uses bun. Cheap safety net
  // for @repo/ui, which ships raw .tsx source.
  transpilePackages: ['@repo/ui'],
};

export default nextConfig;
