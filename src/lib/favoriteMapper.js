import { mapNearbyItem } from './cafeteriaMapper';
import { FALLBACK_COVER, resolveMediaUrl } from './mediaUrl';

/** Mapea ítem de GET /api/consumer/me/favorites al modelo de tarjeta/lista. */
export function mapFavoriteItem(item, showDiscounts = false) {
  const cover = item.coverImageUrl ? resolveMediaUrl(item.coverImageUrl) : FALLBACK_COVER;
  return mapNearbyItem(
    {
      id: item.cafeteriaId,
      name: item.name,
      address: item.address,
      description: '',
      distanceMeters: 0,
      latitude: 0,
      longitude: 0,
      subscriptionTier: item.subscriptionTier,
      discountPercent: item.discountPercent,
      coverImageUrl: item.coverImageUrl,
      averageRating: item.averageRating,
      reviewCount: item.reviewCount,
    },
    { showDiscounts }
  );
}
