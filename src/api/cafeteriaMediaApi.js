import { apiRequest, apiUpload } from '../lib/apiClient';
import {
  CAFE_MEDIA_STALE_MS,
  CAFE_MEDIA_TTL_MS,
  cafePhotosKey,
  cafeReviewsKey,
  getCached,
  invalidateCafeteriaPhotos,
  invalidateCafeteriaReviews,
  invalidateCafeteriaMedia,
} from '../lib/resourceCache';

function afterMutation(cafeteriaId, kind) {
  if (kind === 'photos') invalidateCafeteriaPhotos(cafeteriaId);
  else if (kind === 'reviews') invalidateCafeteriaReviews(cafeteriaId);
  else invalidateCafeteriaMedia(cafeteriaId);
}

export function fetchCafeteriaPhotos(cafeteriaId, signal, options = {}) {
  return getCached(
    cafePhotosKey(cafeteriaId),
    () => apiRequest(`/api/cafeterias/${cafeteriaId}/photos`, { signal }),
    {
      ttlMs: CAFE_MEDIA_TTL_MS,
      staleMs: CAFE_MEDIA_STALE_MS,
      bypass: options.bypassCache,
      signal,
      onRevalidate: options.onRevalidate,
    }
  );
}

export function fetchCafeteriaReviews(cafeteriaId, signal, options = {}) {
  return getCached(
    cafeReviewsKey(cafeteriaId),
    () => apiRequest(`/api/cafeterias/${cafeteriaId}/reviews`, { signal }),
    {
      ttlMs: CAFE_MEDIA_TTL_MS,
      staleMs: CAFE_MEDIA_STALE_MS,
      bypass: options.bypassCache,
      signal,
      onRevalidate: options.onRevalidate,
    }
  );
}

export function postCafeteriaReview(cafeteriaId, { rating, text }, token) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/reviews`, {
    method: 'POST',
    token,
    body: { rating, text: text || null },
  }).then((res) => {
    afterMutation(cafeteriaId, 'reviews');
    return res;
  });
}

export function putCafeteriaReview(cafeteriaId, reviewId, { rating, text }, token) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/reviews/${reviewId}`, {
    method: 'PUT',
    token,
    body: { rating, text: text || null },
  }).then((res) => {
    afterMutation(cafeteriaId, 'reviews');
    return res;
  });
}

export function deleteCafeteriaReview(cafeteriaId, reviewId, token) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/reviews/${reviewId}`, {
    method: 'DELETE',
    token,
  }).then((res) => {
    afterMutation(cafeteriaId, 'reviews');
    return res;
  });
}

export function uploadCafeteriaPhoto(cafeteriaId, file, token, signal) {
  return apiUpload(`/api/cafeterias/${cafeteriaId}/photos`, {
    file,
    token,
    signal,
  }).then((res) => {
    afterMutation(cafeteriaId, 'photos');
    return res;
  });
}

export function deleteCafeteriaPhoto(cafeteriaId, photoId, token) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/photos/${photoId}`, {
    method: 'DELETE',
    token,
  }).then((res) => {
    afterMutation(cafeteriaId, 'photos');
    return res;
  });
}

export function uploadReviewPhoto(cafeteriaId, reviewId, file, token, signal) {
  return apiUpload(`/api/cafeterias/${cafeteriaId}/reviews/${reviewId}/photo`, {
    file,
    token,
    signal,
  }).then((res) => {
    afterMutation(cafeteriaId, 'reviews');
    return res;
  });
}

export function deleteReviewPhoto(cafeteriaId, reviewId, token) {
  return apiRequest(`/api/cafeterias/${cafeteriaId}/reviews/${reviewId}/photo`, {
    method: 'DELETE',
    token,
  }).then((res) => {
    afterMutation(cafeteriaId, 'reviews');
    return res;
  });
}
