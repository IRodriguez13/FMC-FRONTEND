const COVER =
  'https://images.unsplash.com/photo-1495474472287-4d489bc25008?w=800&q=80';
const PROFILE =
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80';

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
    coverImage: COVER,
    profileImage: PROFILE,
    rating: null,
    totalReviews: null,
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
