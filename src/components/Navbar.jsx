import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Heart, LogOut, ChevronDown, Coffee, Star, Menu, X, Store, Compass, CircleHelp } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { getEmail } from '../lib/authStorage';
import { resolveMediaUrl } from '../lib/mediaUrl';

function formatDisplayName(name) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function Navbar() {
  const { user, token, authLoading, logout, isConsumer, isEnterprise } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const greetingName = user
    ? formatDisplayName(user.name)
    : token
      ? formatDisplayName(getEmail()?.split('@')[0] || '')
      : '';

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-coffee-700/95 backdrop-blur-md border-b border-coffee-600 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size={36} color="#f5e6cc" />
          <span className="font-display text-xl font-bold text-cream-100 group-hover:text-cream-200 transition-colors">
            Find My Coffee
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/explore" className="flex items-center gap-1.5 text-cream-200 hover:text-cream-50 transition-colors font-body text-sm">
            <Compass size={15} />
            <span>Explorar</span>
          </Link>
          <Link to="/map" className="flex items-center gap-1.5 text-cream-200 hover:text-cream-50 transition-colors font-body text-sm">
            <MapPin size={15} />
            <span>Mapa</span>
          </Link>
          <Link to="/demo" className="flex items-center gap-1.5 text-cream-200 hover:text-cream-50 transition-colors font-body text-sm">
            <CircleHelp size={15} />
            <span>Ayuda</span>
          </Link>
          {isConsumer && (
            <Link to="/favorites" className="flex items-center gap-1.5 text-cream-200 hover:text-cream-50 transition-colors font-body text-sm">
              <Heart size={15} />
              <span>Favoritos</span>
            </Link>
          )}
          {isEnterprise && (
            <Link to="/enterprise" className="flex items-center gap-1.5 text-cream-200 hover:text-cream-50 transition-colors font-body text-sm">
              <Store size={15} />
              <span>Mi cafetería</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:flex" />
          {user || (token && authLoading) ? (
            <>
              <p
                className="text-cream-100 font-body text-sm font-medium truncate max-w-[9rem] sm:max-w-[12rem] md:max-w-none"
                title={user?.email || getEmail() || undefined}
              >
                {authLoading && !user ? (
                  <span className="text-cream-300">Hola…</span>
                ) : (
                  <>
                    Hola, <span className="text-cream-50">{greetingName}</span>
                  </>
                )}
              </p>
              <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-coffee-600 hover:bg-coffee-500 text-cream-100 px-3 py-2 rounded-xl transition-all"
                aria-label="Menú de cuenta"
              >
                <div className="w-7 h-7 bg-cream-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={resolveMediaUrl(user.avatarUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : isEnterprise ? (
                    <Store size={14} className="text-coffee-700" />
                  ) : (
                    <User size={14} className="text-coffee-700" />
                  )}
                </div>
                <ChevronDown size={14} className={`hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-coffee-lg border border-sand-200 overflow-hidden animate-slide-down z-50">
                  <div className="px-4 py-3 bg-cream-100 border-b border-sand-200">
                    <p className="font-display font-semibold text-coffee-800 text-sm">{user.name}</p>
                    <p className="text-coffee-500 text-xs font-body">{user.email}</p>
                  </div>
                  <div className="py-2">
                    {isConsumer && (
                      <>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-coffee-700 hover:bg-cream-100 font-body text-sm">
                          <User size={15} className="text-coffee-400" /> Perfil consumidor
                        </Link>
                        <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-coffee-700 hover:bg-cream-100 font-body text-sm">
                          <Heart size={15} className="text-coffee-400" /> Favoritos
                        </Link>
                        {!user.premium && (
                          <Link to="/checkout/consumer-premium" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-amber-600 hover:bg-amber-50 font-body text-sm font-semibold">
                            <Star size={15} className="fill-amber-400" /> Plan Premium
                          </Link>
                        )}
                      </>
                    )}
                    {isEnterprise && (
                      <Link to="/enterprise" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-coffee-700 hover:bg-cream-100 font-body text-sm">
                        <Store size={15} className="text-coffee-400" /> Panel negocio
                      </Link>
                    )}
                    <div className="mx-4 my-1 border-t border-sand-200" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 font-body text-sm">
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-cream-200 hover:text-cream-50 font-body text-sm font-medium px-3 py-2">
                Iniciar sesión
              </Link>
              <Link to="/register" className="bg-cream-200 hover:bg-cream-100 text-coffee-800 font-body text-sm font-semibold px-4 py-2 rounded-xl">
                Registrarse
              </Link>
            </div>
          )}

          <button className="md:hidden text-cream-200 p-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-coffee-700 border-t border-coffee-600 px-4 py-4 flex flex-col gap-3 animate-slide-down">
          <Link to="/explore" onClick={() => setMenuOpen(false)} className="text-cream-200 font-body">Explorar</Link>
          <Link to="/map" onClick={() => setMenuOpen(false)} className="text-cream-200 font-body">Mapa</Link>
          <Link to="/demo" onClick={() => setMenuOpen(false)} className="text-cream-200 font-body">Ayuda</Link>
          <ThemeToggle />
          {isConsumer && <Link to="/favorites" onClick={() => setMenuOpen(false)} className="text-cream-200 font-body">Favoritos</Link>}
          {isEnterprise && <Link to="/enterprise" onClick={() => setMenuOpen(false)} className="text-cream-200 font-body">Mi cafetería</Link>}
          {!user && (
            <Link to="/register-business" onClick={() => setMenuOpen(false)} className="text-cream-200 font-body flex items-center gap-2">
              <Coffee size={15} /> Registrar negocio
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
