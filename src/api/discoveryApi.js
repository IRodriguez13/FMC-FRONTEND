import { apiRequest } from '../lib/apiClient';

export function fetchNearbyCafeterias({ lat, lng, radiusKm, token, signal }) {
  return apiRequest('', {
    method: 'POST',
    token,
    signal,
    body: {
      query: `
        query TraerCafeterias($lat: Float!, $lng: Float!) {
          nearbyCafeterias(lat: $lat, lng: $lng) {
            queryLatitude
            queryLongitude
            appliedRadiusKm
            items {
              id
              name
              address
              latitude
              longitude
            }
          }
        }
      `,
      variables: {
        lat: Number(lat),
        lng: Number(lng)
      }
    }
  }).then(response => {
    if (response && response.data && response.data.nearbyCafeterias) {
      return response.data.nearbyCafeterias; 
    }
    return { items: [] };
  });
}

// GET: Lista fotos de una cafetería (No pide Auth)
export async function getCafeteriaPhotos(cafeteriaId) {
  return await apiRequest(`/api/cafeterias/${cafeteriaId}/photos`);
}

// POST: Sube imagen (Pide JWT - usa multipart/form-data)
export async function uploadCafeteriaPhoto(cafeteriaId, file, token) {
  const url = `${import.meta.env.VITE_API_BASE_URL}/api/cafeterias/${cafeteriaId}/photos`;
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) throw new Error(`Error al subir foto: ${res.status}`);
  return await res.json();
}

// GET: Lista reseñas + promedio (No pide Auth)
export async function getCafeteriaReviews(cafeteriaId) {
  return await apiRequest(`/api/cafeterias/${cafeteriaId}/reviews`);
}

// POST: Crea o actualiza reseña del autor (Pide JWT)
export async function saveCafeteriaReview(cafeteriaId, reviewData, token) {
  return await apiRequest(`/api/cafeterias/${cafeteriaId}/reviews`, {
    method: 'POST',
    body: reviewData,
    token: token
  });
}