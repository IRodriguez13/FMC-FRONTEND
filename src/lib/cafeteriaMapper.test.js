import { describe, expect, it } from 'vitest';
import { mapNearbyItem, mapNearbyResponse } from './cafeteriaMapper';

const baseItem = {
  id: 'a1111111-1111-4111-8111-111111111101',
  name: 'FMC Seed — Palermo (Premium)',
  description: 'Demo local',
  address: 'Thames 1500, Palermo, CABA',
  latitude: -34.5875,
  longitude: -58.425,
  distanceMeters: 1400,
  subscriptionTier: 'Premium',
  discountPercent: 15,
  coverImageUrl: '/media/seed-palermo-barra.jpg',
  averageRating: 4.2,
  reviewCount: 3,
};

describe('mapNearbyItem', () => {
  it('mapea campos principales y barrio desde dirección', () => {
    const cafe = mapNearbyItem(baseItem);

    expect(cafe.id).toBe(baseItem.id);
    expect(cafe.name).toBe(baseItem.name);
    expect(cafe.neighborhood).toBe('CABA');
    expect(cafe.distance).toBe(1400);
    expect(cafe.lat).toBe(baseItem.latitude);
    expect(cafe.coverImage).toBe('/media/seed-palermo-barra.jpg');
    expect(cafe.rating).toBe(4.2);
    expect(cafe.totalReviews).toBe(3);
  });

  it('incluye descuento y tags cuando la API lo envía (viewer Premium)', () => {
    const cafe = mapNearbyItem(baseItem);

    expect(cafe.discountPercent).toBe(15);
    expect(cafe.tags).toContain('Enterprise Premium');
    expect(cafe.tags).toContain('15% off');
  });

  it('omite descuento cuando la API no lo expone (viewer Free)', () => {
    const cafe = mapNearbyItem({ ...baseItem, discountPercent: null });

    expect(cafe.discountPercent).toBeNull();
    expect(cafe.tags).not.toContain('15% off');
  });

  it('usa fallback de portada si no hay coverImageUrl', () => {
    const cafe = mapNearbyItem({ ...baseItem, coverImageUrl: null });
    expect(cafe.coverImage).toMatch(/^https:\/\//);
  });
});

describe('mapNearbyResponse', () => {
  it('mapea metadatos y lista de ítems', () => {
    const raw = {
      queryLatitude: -34.6,
      queryLongitude: -58.38,
      appliedRadiusKm: 10,
      viewerTier: 'Premium',
      maxResultsCap: 50,
      items: [baseItem],
    };

    const mapped = mapNearbyResponse(raw);

    expect(mapped.viewerTier).toBe('Premium');
    expect(mapped.appliedRadiusKm).toBe(10);
    expect(mapped.items).toHaveLength(1);
    expect(mapped.items[0].name).toBe(baseItem.name);
  });
});
