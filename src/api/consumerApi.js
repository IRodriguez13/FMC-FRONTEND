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

export function updateConsumerTier(tier, token) {
  return apiRequest('/api/consumer/tier', {
    method: 'PATCH',
    token,
    body: { tier },
  });
}
