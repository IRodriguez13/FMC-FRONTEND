import { resolveMediaUrl, FALLBACK_COVER } from './mediaUrl';

function neighborhoodFromAddress(address) {
  if (!address) return 'CABA';
  const parts = address.split(',').map((s) => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

function tagsFromItem(item) {
  const tags = [];
  if (item.subscriptionTier === 'Premium') tags.push('Enterprise Premium');
  else if (item.subscriptionTier === 'Standard') tags.push('Enterprise Standard');
  if (item.discountPercent != null) tags.push(`${item.discountPercent}% off`);
  return tags.length ? tags : ['Cafetería'];
}

/** Mapea NearbyCafeteriaItem del backend al modelo que usa la UI. */
export function mapNearbyItem(item) {
  const description = item.description?.trim() || '';
  const cover = item.coverImageUrl ? resolveMediaUrl(item.coverImageUrl) : FALLBACK_COVER;
  return {
    id: String(item.id),
    name: item.name,
    address: item.address || 'Sin dirección',
    neighborhood: neighborhoodFromAddress(item.address),
    distance: Math.round(item.distanceMeters ?? 0),
    description,
    bio: description || 'Cafetería registrada en Find My Coffee.',
    lat: item.latitude,
    lng: item.longitude,
    subscriptionTier: item.subscriptionTier,
    discountPercent: item.discountPercent ?? null,
    coverImage: cover,
    profileImage: cover,
    rating: item.averageRating ?? null,
    totalReviews: item.reviewCount ?? null,
    tags: tagsFromItem(item),
    features: [],
    specialties: [],
    hours: {},
    menu: [],
    photos: [],
    reviews: [],
    phone: '',
    email: '',
    instagram: '',
  };
}

export function mapNearbyResponse(data) {
  return {
    queryLatitude: data.queryLatitude,
    queryLongitude: data.queryLongitude,
    appliedRadiusKm: data.appliedRadiusKm,
    viewerTier: data.viewerTier,
    maxResultsCap: data.maxResultsCap,
    items: (data.items ?? []).map(mapNearbyItem),
  };
}
