import { apiRequest } from '../lib/apiClient';

export function fetchConsumerProfile(token, signal) {
  return apiRequest('/api/consumer/me', { token, signal });
}

export function updateConsumerTier(tier, token) {
  return apiRequest('/api/consumer/tier', {
    method: 'PATCH',
    token,
    body: { tier },
  });
}
