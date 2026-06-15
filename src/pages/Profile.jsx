import { useEffect, useState } from 'react';
import { User, MapPin, Heart, History, Bell, LogOut, Star, Coffee, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BackNavLink from '../components/BackNavLink';
import ProfileAvatarEditor from '../components/ProfileAvatarEditor';
import { useAuth } from '../context/AuthContext';
import { useCafeterias } from '../context/CafeteriasContext';
import { fetchConsumerFavorites } from '../api/consumerApi';
import CafeCoverImage from '../components/CafeCoverImage';
import { mapFavoriteItem } from '../lib/favoriteMapper';
import { friendlyApiMessage } from '../lib/userFacingError';

function ProfilePanel({ children, className = '', allowOverflow = false }) {
  return (
    <div
      className={`rounded-2xl border border-sand-200 dark:border-coffee-600 bg-white dark:bg-coffee-800 shadow-card ${
        allowOverflow ? 'overflow-visible' : 'overflow-hidden'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div className="px-5 py-3 bg-cream-100 dark:bg-coffee-700/80 border-b border-sand-200 dark:border-coffee-600">
      <p className="font-body text-sm font-bold text-coffee-600 dark:text-coffee-200 uppercase tracking-wider">
        {children}
      </p>
    </div>
  );
}

const menuRowClass =
  'w-full flex items-center gap-3 px-5 py-4 hover:bg-cream-50 dark:hover:bg-coffee-700/60 transition-colors border-b border-sand-100 dark:border-coffee-700 last:border-0';

const linkRowClass =
  'flex items-center gap-3 px-5 py-4 hover:bg-cream-50 dark:hover:bg-coffee-700/60 transition-colors border-b border-sand-100 dark:border-coffee-700 last:border-0';

const iconBoxClass =
  'w-8 h-8 bg-cream-100 dark:bg-coffee-700 rounded-xl flex items-center justify-center shrink-0';

export default function Profile() {
  const { user, token, logout, favorites, setConsumerTier, saveConsumerProfile, saveConsumerAvatar, removeConsumerAvatar, authLoading, isEnterprise } = useAuth();
  const { refetch } = useCafeterias();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('main');
  const [tierLoading, setTierLoading] = useState(false);
  const [tierError, setTierError] = useState('');
  const [profileForm, setProfileForm] = useState({ displayName: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [favoriteCafes, setFavoriteCafes] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'consumer') {
      setFavoriteCafes([]);
      return;
    }
    let cancelled = false;
    setFavoritesLoading(true);
    fetchConsumerFavorites(token)
      .then((res) => {
        if (cancelled) return;
        setFavoriteCafes((res.items ?? []).map((item) => mapFavoriteItem(item, user?.premium)));
      })
      .catch(() => {
        if (!cancelled) setFavoriteCafes([]);
      })
      .finally(() => {
        if (!cancelled) setFavoritesLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, user?.role, user?.premium, favorites.length]);

  useEffect(() => {
    if (user) setProfileForm({ displayName: user.name || '' });
  }, [user]);

  useEffect(() => {
    if (!authLoading && isEnterprise) navigate('/enterprise');
  }, [authLoading, isEnterprise, navigate]);

  const handleTierChange = async (tier) => {
    setTierError('');
    setTierLoading(true);
    try {
      const newToken = await setConsumerTier(tier);
      await refetch(newToken);
    } catch (e) {
      setTierError(friendlyApiMessage(e, 'No pudimos actualizar tu plan. Probá de nuevo.'));
    } finally {
      setTierLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-coffee-600 dark:text-coffee-200">
        Cargando sesión…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <User size={48} className="mx-auto text-coffee-400 dark:text-coffee-300 mb-4" />
          <h2 className="font-display text-2xl font-bold text-coffee-900 dark:text-cream-50 mb-2">Iniciá sesión</h2>
          <p className="font-body text-coffee-600 dark:text-coffee-200 mb-6">Para ver tu perfil necesitás iniciar sesión.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="btn-primary">Iniciar sesión</Link>
            <Link to="/register" className="btn-secondary">Registrarse</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSection = (section) => {
    setProfileError('');
    setProfileMessage('');
    setActiveSection(section === activeSection ? 'main' : section);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    const name = profileForm.displayName.trim();
    if (!name) {
      setProfileError('El nombre no puede estar vacío.');
      return;
    }
    if (name.length > 80) {
      setProfileError('El nombre no puede superar 80 caracteres.');
      return;
    }
    setProfileSaving(true);
    try {
      await saveConsumerProfile({ displayName: name });
      setProfileMessage('Perfil actualizado.');
    } catch (err) {
      setProfileError(friendlyApiMessage(err, 'No pudimos guardar tu perfil. Probá de nuevo.'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProfileError('');
    setProfileMessage('');
    setAvatarUploading(true);
    try {
      await saveConsumerAvatar(file);
      setProfileMessage('Foto de perfil actualizada.');
    } catch (err) {
      setProfileError(friendlyApiMessage(err, 'No pudimos subir la foto. Probá con otra imagen.'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setProfileError('');
    setProfileMessage('');
    setAvatarUploading(true);
    try {
      await removeConsumerAvatar();
      setProfileMessage('Foto de perfil eliminada.');
    } catch (err) {
      setProfileError(friendlyApiMessage(err, 'No pudimos quitar la foto de perfil.'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const menuItems = [
    { icon: User, label: 'Datos de perfil', section: 'profile' },
    { icon: MapPin, label: 'Direcciones', section: 'addresses' },
    { icon: Heart, label: 'Favoritos', section: 'favorites', badge: favorites.length },
    { icon: History, label: 'Historial', section: 'history' },
    { icon: Bell, label: 'Centro de notificaciones', section: 'notifications' },
  ];

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-coffee-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackNavLink
          fallback="/explore"
          label="Volver"
          className="inline-flex items-center gap-2 text-coffee-700 dark:text-cream-200 hover:text-coffee-900 dark:hover:text-cream-50 font-body text-sm mb-6 transition-colors"
        />

        <ProfilePanel allowOverflow className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <ProfileAvatarEditor
              name={user.name}
              avatarUrl={user.avatarUrl}
              disabled={avatarUploading}
              onFileSelect={handleAvatarSelect}
              onRemove={handleAvatarRemove}
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold leading-snug text-coffee-900 dark:text-cream-50 line-clamp-2">{user.name}</h2>
              <p className="font-body text-coffee-600 dark:text-coffee-300 text-sm truncate">{user.email}</p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                  user.premium
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-100'
                    : 'bg-cream-200 dark:bg-coffee-700 text-coffee-700 dark:text-cream-200'
                }`}
              >
                <Star size={10} className={user.premium ? 'fill-amber-500' : ''} />
                {user.tier || (user.premium ? 'Premium' : 'Free')}
              </span>
            </div>
          </div>
        </ProfilePanel>

        <ProfilePanel className="mb-4">
          <SectionHeader>Mi cuenta</SectionHeader>
          {menuItems.map(({ icon: Icon, label, section, badge }) => (
            <button key={section} type="button" onClick={() => toggleSection(section)} className={menuRowClass}>
              <div className={iconBoxClass}>
                <Icon size={15} className="text-coffee-500 dark:text-coffee-300" />
              </div>
              <span className="flex-1 text-left font-body text-sm text-coffee-800 dark:text-cream-100 font-medium">
                {label}
              </span>
              {badge !== undefined && badge > 0 && (
                <span className="bg-coffee-600 dark:bg-coffee-500 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-semibold">
                  {badge}
                </span>
              )}
              <ChevronRight size={14} className="text-coffee-400 dark:text-coffee-500 shrink-0" />
            </button>
          ))}
        </ProfilePanel>

        {activeSection === 'profile' && (
          <ProfilePanel className="mb-4 p-5 animate-slide-down">
            <form onSubmit={handleProfileSave} className="space-y-4 font-body text-sm">
              <div>
                <label htmlFor="displayName" className="block font-semibold text-coffee-900 dark:text-cream-50 mb-1.5">
                  Nombre para mostrar
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  maxLength={80}
                  value={profileForm.displayName}
                  onChange={e => {
                    setProfileForm({ displayName: e.target.value });
                    if (profileError) setProfileError('');
                  }}
                  className="w-full rounded-xl border border-sand-200 dark:border-coffee-600 bg-cream-50 dark:bg-coffee-700 px-4 py-2.5 text-coffee-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-coffee-400"
                />
                <p className="font-body text-xs text-coffee-500 dark:text-coffee-400 mt-1">
                  Obligatorio. Se muestra en el saludo y en tu perfil.
                </p>
              </div>
              <div>
                <p className="text-coffee-600 dark:text-coffee-200">
                  <span className="font-semibold text-coffee-900 dark:text-cream-50">Email:</span> {user.email}
                </p>
                <p className="text-coffee-500 dark:text-coffee-400 text-xs mt-1">
                  El email es tu identificador de acceso y no se puede cambiar desde aquí.
                </p>
              </div>
              <p className="text-coffee-600 dark:text-coffee-200">
                <span className="font-semibold text-coffee-900 dark:text-cream-50">Plan:</span> {user.tier || 'Free'}
                {user.premium && (
                  <span className="ml-2 text-amber-700 dark:text-amber-300">· Accedés a descuentos comerciales</span>
                )}
              </p>
              {profileError && <p className="text-red-600 dark:text-red-300">{profileError}</p>}
              {profileMessage && <p className="text-green-700 dark:text-green-300">{profileMessage}</p>}
              <p className="font-body text-xs text-coffee-500 dark:text-coffee-400">
                Para cambiar o quitar tu foto, usá el ícono de lápiz sobre el avatar de arriba.
              </p>
              <div className="pt-1">
                <button type="submit" disabled={profileSaving || avatarUploading} className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50">
                  {profileSaving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </ProfilePanel>
        )}

        {activeSection === 'addresses' && (
          <ProfilePanel className="mb-4 p-5 animate-slide-down font-body text-sm text-coffee-600 dark:text-coffee-200">
            Las direcciones guardadas llegarán en una versión futura. Por ahora usamos tu ubicación en{' '}
            <Link to="/map" className="text-coffee-800 dark:text-cream-100 underline">Mapa</Link> y{' '}
            <Link to="/explore" className="text-coffee-800 dark:text-cream-100 underline">Explorar</Link>.
          </ProfilePanel>
        )}

        {activeSection === 'favorites' && (
          <ProfilePanel className="mb-4 animate-slide-down">
            <div className="px-5 py-3 bg-cream-100 dark:bg-coffee-700/80 border-b border-sand-200 dark:border-coffee-600 flex items-center justify-between">
              <p className="font-body text-sm font-bold text-coffee-600 dark:text-coffee-200">Mis favoritos</p>
              <Link to="/favorites" className="text-xs text-coffee-700 dark:text-cream-200 underline">
                Ver todos
              </Link>
            </div>
            {favoritesLoading ? (
              <p className="px-5 py-6 font-body text-sm text-coffee-500 dark:text-coffee-400">Cargando favoritos…</p>
            ) : favoriteCafes.length === 0 ? (
              <p className="px-5 py-4 font-body text-sm text-coffee-600 dark:text-coffee-200">
                Sin favoritos.{' '}
                <Link to="/explore" className="underline text-coffee-800 dark:text-cream-50">Explorar cafeterías</Link>
              </p>
            ) : (
              favoriteCafes.map(cafe => (
                <Link key={cafe.id} to={`/cafe/${cafe.id}`} className={linkRowClass}>
                  <CafeCoverImage
                    src={cafe.coverImage}
                    alt={cafe.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-coffee-900 dark:text-cream-50 truncate">
                      {cafe.name}
                    </p>
                    <p className="font-body text-xs text-coffee-500 dark:text-coffee-300">{cafe.neighborhood}</p>
                  </div>
                  {user.premium && cafe.discountPercent != null && (
                    <span className="font-body text-xs text-amber-700 dark:text-amber-300 font-semibold shrink-0">
                      -{cafe.discountPercent}%
                    </span>
                  )}
                </Link>
              ))
            )}
          </ProfilePanel>
        )}

        {activeSection === 'history' && (
          <ProfilePanel className="mb-4 p-5 animate-slide-down font-body text-sm text-coffee-600 dark:text-coffee-200">
            El historial de visitas no está disponible en este MVP. Usá favoritos para guardar locales.
          </ProfilePanel>
        )}

        {activeSection === 'notifications' && (
          <ProfilePanel className="mb-4 p-5 animate-slide-down font-body text-sm text-coffee-600 dark:text-coffee-200">
            No hay notificaciones pendientes.
          </ProfilePanel>
        )}

        <ProfilePanel className="mb-4">
          <SectionHeader>Información</SectionHeader>
          {tierError && (
            <p className="px-5 py-2 font-body text-sm text-red-600 dark:text-red-300">{tierError}</p>
          )}
          {!user.premium && (
            <Link
              to="/checkout/consumer-premium"
              className={`${linkRowClass} hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300`}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/40 shrink-0">
                <Star size={15} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="flex-1 text-left font-body text-sm font-medium">Pasar a Premium</span>
              <ChevronRight size={14} className="text-coffee-400 dark:text-coffee-500 shrink-0" />
            </Link>
          )}
          {user.premium && (
            <button
              type="button"
              onClick={() => handleTierChange('Free')}
              disabled={tierLoading}
              className={`${menuRowClass} disabled:opacity-50`}
            >
              <div className={iconBoxClass}>
                <Star size={15} className="text-coffee-500 dark:text-coffee-300" />
              </div>
              <span className="flex-1 text-left font-body text-sm font-medium text-coffee-800 dark:text-cream-100">
                {tierLoading ? 'Actualizando…' : 'Volver a Free'}
              </span>
              <ChevronRight size={14} className="text-coffee-400 dark:text-coffee-500 shrink-0" />
            </button>
          )}
          <Link to="/register-business" className={linkRowClass}>
            <div className={iconBoxClass}>
              <Coffee size={15} className="text-coffee-500 dark:text-coffee-300" />
            </div>
            <span className="flex-1 text-left font-body text-sm font-medium text-coffee-800 dark:text-cream-100">
              Registrar mi negocio
            </span>
            <ChevronRight size={14} className="text-coffee-400 dark:text-coffee-500 shrink-0" />
          </Link>
          <Link to="/terms" className={linkRowClass}>
            <div className={iconBoxClass}>
              <Star size={15} className="text-coffee-500 dark:text-coffee-300" />
            </div>
            <span className="flex-1 text-left font-body text-sm font-medium text-coffee-800 dark:text-cream-100">
              Términos y condiciones
            </span>
            <ChevronRight size={14} className="text-coffee-400 dark:text-coffee-500 shrink-0" />
          </Link>
        </ProfilePanel>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-2xl border border-sand-200 dark:border-coffee-600 bg-white dark:bg-coffee-800 p-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-body font-semibold shadow-card"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
