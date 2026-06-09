import { apiRequest } from '../lib/apiClient';

export function consumerRegister(email, password) {
  return apiRequest('/api/auth/consumer/register', {
    method: 'POST',
    body: { email, password },
  });
}

export function consumerLogin(email, password) {
  return apiRequest('/api/auth/consumer/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function enterpriseRegister(payload) {
  return apiRequest('/api/auth/enterprise/register', {
    method: 'POST',
    body: payload,
  });
}

export function enterpriseLogin(email, password) {
  return apiRequest('/api/auth/enterprise/login', {
    method: 'POST',
    body: { email, password },
  });
}
