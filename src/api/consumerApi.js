import { apiRequest, apiUpload } from '../lib/apiClient';

export function fetchConsumerProfile(token, signal) {
  return apiRequest('/api/consumer/me', { token, signal });
}

export function updateConsumerProfile({ displayName }, token) {
  return apiRequest('/api/consumer/me', {
    method: 'PUT',
    token,
    body: { displayName },
  });
}

export function uploadConsumerAvatar(file, token, signal) {
  return apiUpload('/api/consumer/me/avatar', { file, token, signal });
}

export function deleteConsumerAvatar(token) {
  return apiRequest('/api/consumer/me/avatar', { method: 'DELETE', token });
}

export function updateConsumerTier(tier, token) {
  return apiRequest('/api/consumer/tier', {
    method: 'PATCH',
    token,
    body: { tier },
  });
}

export function fetchConsumerFavorites(token, signal) {
  return apiRequest('/api/consumer/me/favorites', { token, signal });
}

export function fetchConsumerFavoriteIds(token, signal) {
  return apiRequest('/api/consumer/me/favorites/ids', { token, signal });
}

export function syncConsumerFavorites(cafeteriaIds, token) {
  return apiRequest('/api/consumer/me/favorites/sync', {
    method: 'PUT',
    token,
    body: cafeteriaIds,
  });
}

export function addConsumerFavorite(cafeteriaId, token) {
  return apiRequest(`/api/consumer/me/favorites/${cafeteriaId}`, {
    method: 'PUT',
    token,
  });
}

export function removeConsumerFavorite(cafeteriaId, token) {
  return apiRequest(`/api/consumer/me/favorites/${cafeteriaId}`, {
    method: 'DELETE',
    token,
  });
}
