import { useEffect, useState } from 'react';
import { User, MapPin, Heart, History, Bell, LogOut, Star, Coffee, ChevronRight, Edit2, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCafeterias } from '../context/CafeteriasContext';
import { ApiError } from '../lib/apiClient';

export default function Profile() {
  const { user, logout, favorites, setConsumerTier, authLoading, isEnterprise } = useAuth();
  const { cafes } = useCafeterias();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('main');
  const [tierLoading, setTierLoading] = useState(false);
  const [tierError, setTierError] = useState('');
  const favoriteCafes = cafes.filter(c => favorites.includes(c.id));

  useEffect(() => {
    if (!authLoading && isEnterprise) navigate('/enterprise');
  }, [authLoading, isEnterprise, navigate]);

  const handleTierChange = async (tier) => {
    setTierError('');
    setTierLoading(true);
    try {
      await setConsumerTier(tier);
    } catch (e) {
      setTierError(e instanceof ApiError ? e.message : 'No se pudo actualizar el plan.');
    } finally {
      setTierLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-coffee-500">
        Cargando sesión…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <User size={48} className="mx-auto text-coffee-300 mb-4" />
          <h2 className="font-display text-2xl font-bold text-coffee-800 mb-2">Iniciá sesión</h2>
          <p className="font-body text-coffee-500 mb-6">Para ver tu perfil necesitás iniciar sesión.</p>
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

  const menuItems = [
    { icon: User, label: 'Datos de perfil', section: 'profile' },
    { icon: MapPin, label: 'Direcciones', section: 'addresses' },
    { icon: Heart, label: 'Favoritos', section: 'favorites', badge: favorites.length },
    { icon: History, label: 'Historial', section: 'history' },
    { icon: Bell, label: 'Centro de notificaciones', section: 'notifications' },
  ];

  const infoItems = [
    { icon: Star, label: 'Pasar a Premium', tier: 'Premium', show: !user.premium },
    { icon: Star, label: 'Volver a Free', tier: 'Free', show: user.premium },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-coffee-600 rounded-2xl flex items-center justify-center">
                <User size={28} className="text-cream-100" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-cream-100 border border-sand-300 rounded-full flex items-center justify-center">
                <Camera size={11} className="text-coffee-600" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-coffee-800">{user.name}</h2>
              <p className="font-body text-coffee-400 text-sm">{user.email}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                user.premium ? 'bg-amber-100 text-amber-700' : 'bg-cream-200 text-coffee-600'
              }`}>
                <Star size={10} className={user.premium ? 'fill-amber-500' : ''} />
                {user.tier || (user.premium ? 'Premium' : 'Free')}
              </span>
            </div>
            <button className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-cream-100 rounded-xl transition-colors">
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        {/* Mi cuenta */}
        <div className="card mb-4 overflow-hidden">
          <div className="px-5 py-3 bg-cream-100 border-b border-sand-200">
            <p className="font-body text-sm font-bold text-coffee-500 uppercase tracking-wider">Mi cuenta</p>
          </div>
          {menuItems.map(({ icon: Icon, label, section, badge }) => (
            <button
              key={section}
              onClick={() => setActiveSection(section === activeSection ? 'main' : section)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-cream-50 transition-colors border-b border-sand-100 last:border-0"
            >
              <div className="w-8 h-8 bg-cream-100 rounded-xl flex items-center justify-center">
                <Icon size={15} className="text-coffee-500" />
              </div>
              <span className="flex-1 text-left font-body text-sm text-coffee-700 font-medium">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="bg-coffee-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {badge}
                </span>
              )}
              <ChevronRight size={14} className="text-coffee-300" />
            </button>
          ))}
        </div>

        {/* Favorites expanded */}
        {activeSection === 'favorites' && favoriteCafes.length > 0 && (
          <div className="card mb-4 overflow-hidden animate-slide-down">
            <div className="px-5 py-3 bg-cream-100 border-b border-sand-200">
              <p className="font-body text-sm font-bold text-coffee-500">Mis favoritos</p>
            </div>
            {favoriteCafes.map(cafe => (
              <Link
                key={cafe.id}
                to={`/cafe/${cafe.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-cream-50 transition-colors border-b border-sand-100 last:border-0"
              >
                <img src={cafe.profileImage} alt={cafe.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-body text-sm font-semibold text-coffee-800">{cafe.name}</p>
                  <p className="font-body text-xs text-coffee-400">{cafe.neighborhood}</p>
                </div>
                {cafe.discountPercent != null && (
                  <span className="font-body text-xs text-amber-600 font-semibold">-{cafe.discountPercent}%</span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="card mb-4 overflow-hidden">
          <div className="px-5 py-3 bg-cream-100 border-b border-sand-200">
            <p className="font-body text-sm font-bold text-coffee-500 uppercase tracking-wider">Información</p>
          </div>
          {tierError && (
            <p className="px-5 py-2 font-body text-sm text-red-600">{tierError}</p>
          )}
          {infoItems.filter(i => i.show).map(({ icon: Icon, label, tier }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleTierChange(tier)}
              disabled={tierLoading}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-cream-50 transition-colors border-b border-sand-100 last:border-0 text-amber-600 disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-50">
                <Icon size={15} className="text-amber-500" />
              </div>
              <span className="flex-1 text-left font-body text-sm font-medium">{label}</span>
              <ChevronRight size={14} className="text-coffee-300" />
            </button>
          ))}
          <Link
            to="/register-business"
            className="flex items-center gap-3 px-5 py-4 hover:bg-cream-50 transition-colors border-b border-sand-100"
          >
            <div className="w-8 h-8 bg-cream-100 rounded-xl flex items-center justify-center">
              <Coffee size={15} className="text-coffee-500" />
            </div>
            <span className="flex-1 text-left font-body text-sm font-medium text-coffee-700">Registrar mi negocio</span>
            <ChevronRight size={14} className="text-coffee-300" />
          </Link>
          <Link
            to="/terms"
            className="flex items-center gap-3 px-5 py-4 hover:bg-cream-50 transition-colors"
          >
            <div className="w-8 h-8 bg-cream-100 rounded-xl flex items-center justify-center">
              <Star size={15} className="text-coffee-500" />
            </div>
            <span className="flex-1 text-left font-body text-sm font-medium text-coffee-700">Términos y condiciones</span>
            <ChevronRight size={14} className="text-coffee-300" />
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full card p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors font-body font-semibold"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
