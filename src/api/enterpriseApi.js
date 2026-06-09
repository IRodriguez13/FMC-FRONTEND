import { apiRequest } from '../lib/apiClient';

export function fetchEnterpriseCafeteria(token, signal) {
  return apiRequest('/api/enterprise/cafeteria/me', { token, signal });
}

export function updateEnterpriseCafeteria(body, token) {
  return apiRequest('/api/enterprise/cafeteria/me', {
    method: 'PUT',
    token,
    body,
  });
}

export function updateEnterpriseSubscriptionTier(subscriptionTier, token) {
  return apiRequest('/api/enterprise/cafeteria/subscription-tier', {
    method: 'PATCH',
    token,
    body: { subscriptionTier },
  });
}
