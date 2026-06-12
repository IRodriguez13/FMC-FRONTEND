import { apiRequest, apiUpload } from '../lib/apiClient';

export function fetchCafeteriaPhotos(cafeteriaId, signal) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/photos`, { signal });
}

export function fetchCafeteriaReviews(cafeteriaId, signal) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/reviews`, { signal });
}

export function postCafeteriaReview(cafeteriaId, { rating, text }, token) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/reviews`, {
    method: 'POST',
    token,
    body: { rating, text: text || null },
  });
}

export function putCafeteriaReview(cafeteriaId, reviewId, { rating, text }, token) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/reviews/${reviewId}`, {
    method: 'PUT',
    token,
    body: { rating, text: text || null },
  });
}

export function deleteCafeteriaReview(cafeteriaId, reviewId, token) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/reviews/${reviewId}`, {
    method: 'DELETE',
    token,
  });
}

export function uploadCafeteriaPhoto(cafeteriaId, file, token, signal) {
  return apiUpload(`/api/cafeterias/${cafeteriaId}/photos`, {
    file,
    token,
    signal,
  });
}
