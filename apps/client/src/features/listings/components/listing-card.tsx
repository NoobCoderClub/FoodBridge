import Link from 'next/link';
import type { Listing } from '../types';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block rounded-md border border-gray-200 p-4 hover:border-black"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{listing.food_type}</h3>
        {listing.distance_km != null ? (
          <span className="text-sm text-gray-500">{listing.distance_km.toFixed(1)} km</span>
        ) : null}
      </div>
      <p className="text-sm text-gray-600">
        {listing.quantity} {listing.quantity_unit} &middot; {listing.address_approx}
      </p>
      <p className="text-xs text-gray-400">
        Expires {new Date(listing.expires_at).toLocaleString()}
      </p>
    </Link>
  );
}
