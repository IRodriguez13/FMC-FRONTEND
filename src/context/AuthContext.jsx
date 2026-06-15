import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  consumerLogin,
  consumerRegister,
  enterpriseLogin,
  enterpriseRegister,
} from '../api/authApi';
import {
  fetchConsumerProfile,
  updateConsumerProfile,
  uploadConsumerAvatar,
  deleteConsumerAvatar,
  updateConsumerTier,
} from '../api/consumerApi';
import {
  fetchEnterpriseCafeteria,
  updateEnterpriseCafeteria,
  updateEnterpriseSubscriptionTier,
} from '../api/enterpriseApi';
import {
  clearToken,
  getFavoriteIds,
  getEmail,
  getRole,
  getToken,
  setFavoriteIds,
  setSession,
} from '../lib/authStorage';

const AuthContext = createContext(null);

function consumerFromProfile(profile) {
  const email = profile.email;
  return {
    id: String(profile.id),
    email,
    name: profile.displayName || email.split('@')[0],
    avatarUrl: profile.avatarUrl || null,
    tier: profile.tier,
    premium: profile.tier === 'Premium',
    role: 'consumer',
  };
}

function enterpriseFromDto(dto, email) {
  return {
    id: String(dto.id),
    email,
    name: dto.name || email.split('@')[0],
    role: 'enterprise',
    cafeteriaId: String(dto.id),
    enterpriseSubscriptionTier: dto.subscriptionTier,
    cafeteria: dto,
  };
}

async function hydrateConsumer(token, signal) {
  const profile = await fetchConsumerProfile(token, signal);
  return consumerFromProfile(profile);
}

async function hydrateEnterprise(token, emailFallback = '', signal) {
  const dto = await fetchEnterpriseCafeteria(token, signal);
  const email = emailFallback || '';
  return enterpriseFromDto(dto, email);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [favorites, setFavorites] = useState(() => getFavoriteIds());
  const [authLoading, setAuthLoading] = useState(!!getToken());

  const persistAuth = useCallback((authResponse, emailHint = '') => {
    setSession(authResponse.token, authResponse.role, emailHint);
    setTokenState(authResponse.token);
    return authResponse;
  }, []);

  const applyConsumerSession = useCallback(async (authResponse, emailHint) => {
    persistAuth(authResponse);
    const profileUser = await hydrateConsumer(authResponse.token);
    setUser(profileUser);
    return profileUser;
  }, [persistAuth]);

  const applyEnterpriseSession = useCallback(async (authResponse, emailHint) => {
    persistAuth(authResponse);
    const entUser = await hydrateEnterprise(authResponse.token, emailHint);
    setUser(entUser);
    return entUser;
  }, [persistAuth]);

  useEffect(() => {
    const stored = getToken();
    const role = getRole();
    if (!stored) {
      setAuthLoading(false);
      return;
    }
    const ac = new AbortController();
    (async () => {
      try {
        if (role === 'enterprise') {
          const entUser = await hydrateEnterprise(stored, getEmail(), ac.signal);
          if (!ac.signal.aborted) {
            setTokenState(stored);
            setUser(entUser);
          }
        } else {
          const profileUser = await hydrateConsumer(stored, ac.signal);
          if (!ac.signal.aborted) {
            setTokenState(stored);
            setUser(profileUser);
          }
        }
      } catch (e) {
        if (ac.signal.aborted || e.name === 'AbortError') return;
        if (e.sessionExpired) {
          clearToken();
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (!ac.signal.aborted) setAuthLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const loginConsumer = useCallback(
    async (email, password) => {
      const res = await consumerLogin(email, password);
      await applyConsumerSession(res, email);
      return res;
    },
    [applyConsumerSession]
  );

  const loginEnterprise = useCallback(
    async (email, password) => {
      const res = await enterpriseLogin(email, password);
      await applyEnterpriseSession(res, email);
      return res;
    },
    [applyEnterpriseSession]
  );

  const registerConsumer = useCallback(
    async ({ email, password }) => {
      const res = await consumerRegister(email, password);
      await applyConsumerSession(res, email);
      return res;
    },
    [applyConsumerSession]
  );

  const registerEnterprise = useCallback(
    async (payload) => {
      const res = await enterpriseRegister(payload);
      await applyEnterpriseSession(res, payload.email);
      return res;
    },
    [applyEnterpriseSession]
  );

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setFavorites([]);
    setFavoriteIds([]);
  }, []);

  const toggleFavorite = useCallback((cafId) => {
    const id = String(cafId);
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setFavoriteIds(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((cafId) => favorites.includes(String(cafId)), [favorites]);

  const setConsumerTier = useCallback(
    async (tier) => {
      if (!token) throw new Error('Iniciá sesión primero.');
      const res = await updateConsumerTier(tier, token);
      setSession(res.token, 'consumer');
      setTokenState(res.token);
      setUser(consumerFromProfile(res.profile));
      return res.token;
    },
    [token]
  );

  const saveConsumerProfile = useCallback(
    async ({ displayName }) => {
      if (!token) throw new Error('Iniciá sesión primero.');
      const profile = await updateConsumerProfile({ displayName }, token);
      setUser(consumerFromProfile(profile));
      return profile;
    },
    [token]
  );

  const saveConsumerAvatar = useCallback(
    async (file) => {
      if (!token) throw new Error('Iniciá sesión primero.');
      const profile = await uploadConsumerAvatar(file, token);
      setUser(consumerFromProfile(profile));
      return profile;
    },
    [token]
  );

  const removeConsumerAvatar = useCallback(async () => {
    if (!token) throw new Error('Iniciá sesión primero.');
    const profile = await deleteConsumerAvatar(token);
    setUser(consumerFromProfile(profile));
    return profile;
  }, [token]);

  const saveEnterpriseCafeteria = useCallback(
    async (body) => {
      if (!token) throw new Error('Sin sesión enterprise.');
      const dto = await updateEnterpriseCafeteria(body, token);
      setUser((prev) =>
        prev?.role === 'enterprise' ? enterpriseFromDto(dto, prev.email) : prev
      );
      return dto;
    },
    [token]
  );

  const setEnterpriseSubscriptionTier = useCallback(
    async (subscriptionTier) => {
      if (!token) throw new Error('Sin sesión enterprise.');
      const res = await updateEnterpriseSubscriptionTier(subscriptionTier, token);
      setSession(res.token, 'enterprise');
      setTokenState(res.token);
      const dto = await fetchEnterpriseCafeteria(res.token);
      setUser((prev) =>
        prev?.role === 'enterprise' ? enterpriseFromDto(dto, prev.email) : prev
      );
      return res;
    },
    [token]
  );

  const refreshEnterprise = useCallback(async () => {
    if (!token || user?.role !== 'enterprise') return;
    const dto = await fetchEnterpriseCafeteria(token);
    setUser(enterpriseFromDto(dto, user.email));
  }, [token, user]);

  const isConsumer = user?.role === 'consumer';
  const isEnterprise = user?.role === 'enterprise';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        isConsumer,
        isEnterprise,
        loginConsumer,
        loginEnterprise,
        registerConsumer,
        registerEnterprise,
        logout,
        toggleFavorite,
        isFavorite,
        favorites,
        setConsumerTier,
        saveConsumerProfile,
        saveConsumerAvatar,
        removeConsumerAvatar,
        saveEnterpriseCafeteria,
        setEnterpriseSubscriptionTier,
        refreshEnterprise,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
