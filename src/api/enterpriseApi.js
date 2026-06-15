import { apiRequest, apiUpload } from '../lib/apiClient';

export function fetchEnterpriseCafeteria(token, signal) {
  return apiRequest('/api/enterprise/cafeteria/me', { token, signal });
}

export function uploadEnterpriseAvatar(file, token, signal) {
  return apiUpload('/api/enterprise/cafeteria/me/avatar', { file, token, signal });
}

export function deleteEnterpriseAvatar(token) {
  return apiRequest('/api/enterprise/cafeteria/me/avatar', { method: 'DELETE', token });
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

export function fetchEnterpriseStats(token, signal) {
  return apiRequest('/api/enterprise/cafeteria/me/stats', { token, signal });
}

export function fetchEnterpriseCoupons(token, signal) {
  return apiRequest('/api/enterprise/cafeteria/coupons', { token, signal });
}

export function createEnterpriseCoupon(body, token) {
  return apiRequest('/api/enterprise/cafeteria/coupons', {
    method: 'POST',
    token,
    body,
  });
}

export function deleteEnterpriseCoupon(couponId, token) {
  return apiRequest(`/api/enterprise/cafeteria/coupons/${couponId}`, {
    method: 'DELETE',
    token,
  });
}
