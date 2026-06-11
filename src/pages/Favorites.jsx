import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCafeterias } from '../context/CafeteriasContext';
import CafeteriaCard from '../components/CafeteriaCard';

export default function Favorites() {
  const { user, favorites } = useAuth();
  const { cafes } = useCafeterias();
  const favCafes = cafes.filter(c => favorites.includes(c.id));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cream-100 dark:bg-coffee-900">
        <div className="text-center">
          <Heart size={48} className="mx-auto text-coffee-400 dark:text-coffee-300 mb-4" />
          <h2 className="font-display text-2xl font-bold text-coffee-900 dark:text-cream-50 mb-2">Tus favoritos</h2>
          <p className="font-body text-coffee-600 dark:text-coffee-200 mb-6">
            Iniciá sesión para ver y guardar tus cafeterías favoritas.
          </p>
          <Link to="/login" className="btn-primary">Iniciar sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-coffee-900">
      <div className="bg-coffee-700 dark:bg-coffee-800 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-cream-200 hover:text-cream-50 font-body text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
          <h1 className="font-display text-3xl font-bold text-cream-50 flex items-center gap-3">
            <Heart size={28} className="fill-cream-200 text-cream-200" />
            Mis Favoritos
          </h1>
          <p className="font-body text-cream-200 mt-1">
            {favCafes.length} {favCafes.length === 1 ? 'cafetería guardada' : 'cafeterías guardadas'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {favCafes.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={56} className="mx-auto text-coffee-300 dark:text-coffee-600 mb-4" />
            <h3 className="font-display text-2xl font-semibold text-coffee-800 dark:text-cream-100 mb-2">
              Sin favoritos todavía
            </h3>
            <p className="font-body text-coffee-600 dark:text-coffee-300 mb-6">
              Explorá cafeterías y guardá las que más te gusten con el corazón en cada tarjeta.
            </p>
            <Link to="/explore" className="btn-primary">Explorar cafeterías</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favCafes.map((cafe, i) => (
              <div key={cafe.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <CafeteriaCard cafe={cafe} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
