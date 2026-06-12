import { Link } from 'react-router-dom';
import { MapPin, Star, Coffee, ArrowRight, Search, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import CafeteriaCard from '../components/CafeteriaCard';
import EmptyState from '../components/EmptyState';
import { useCafeterias } from '../context/CafeteriasContext';
import { useState } from 'react';

/** Posiciones fijas para el patrón del hero (evita solapamientos al re-render). */
const HERO_LOGO_POSITIONS = [
  { left: '8%', top: '12%', rotate: -12 },
  { left: '28%', top: '8%', rotate: 18 },
  { left: '52%', top: '15%', rotate: -8 },
  { left: '72%', top: '10%', rotate: 14 },
  { left: '88%', top: '18%', rotate: -20 },
  { left: '15%', top: '38%', rotate: 10 },
  { left: '38%', top: '42%', rotate: -16 },
  { left: '62%', top: '35%', rotate: 6 },
  { left: '82%', top: '40%', rotate: -10 },
  { left: '5%', top: '58%', rotate: 15 },
  { left: '45%', top: '55%', rotate: -6 },
  { left: '75%', top: '52%', rotate: 12 },
];

export default function Home() {
  const { cafes, loading, error, refetch } = useCafeterias();
  const featured = cafes.slice(0, 3);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-coffee-700 dark:bg-coffee-800 overflow-hidden isolate">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-0">
          {HERO_LOGO_POSITIONS.map((pos, i) => (
            <Logo
              key={i}
              size={36}
              className="absolute"
              positionStyles={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                transform: `rotate(${pos.rotate}deg)`,
                opacity: 0.35 + (i % 3) * 0.15,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 md:py-28 flex flex-col items-center text-center animate-fade-in">
          <Logo size={140} className="-mb-2 drop-shadow-2xl" />
          <h1 className="font-display text-4xl md:text-5xl font-bold text-cream-100 leading-tight mb-4">
            Find My Coffee
          </h1>
          <p className="font-body text-cream-200 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Descubrí las mejores cafeterías cerca tuyo. Reseñas reales, menús completos y todo lo que necesitás para encontrar tu rincón perfecto.
          </p>

          <div className="w-full max-w-xl flex gap-3 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-300" size={18} />
              <input
                type="text"
                placeholder="Barrio, nombre o tipo de café..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white/10 border border-white/25 text-cream-50 placeholder-cream-300 font-body focus:outline-none focus:ring-2 focus:ring-cream-200 focus:bg-white/15 transition-all"
              />
            </div>
            <Link
              to="/explore"
              state={{ search: searchQuery.trim() }}
              className="bg-cream-200 hover:bg-cream-100 text-coffee-800 font-body font-semibold px-6 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shrink-0"
            >
              Buscar
            </Link>
          </div>

          <div className="flex gap-10 text-cream-200">
            {[
              { label: 'Cafeterías', value: '200+' },
              { label: 'Reseñas', value: '4.800+' },
              { label: 'Barrios', value: '48' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl font-bold text-cream-50">{value}</p>
                <p className="font-body text-sm text-cream-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none leading-none">
          <svg viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
            <path
              d="M0 80 Q300 20 600 60 Q900 100 1200 40 L1200 80 Z"
              className="fill-cream-100 dark:fill-coffee-900"
            />
          </svg>
        </div>
      </section>

      {/* Featured cafes */}
      <section className="relative z-10 bg-cream-100 dark:bg-coffee-900 max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-body text-coffee-500 dark:text-coffee-300 text-sm uppercase tracking-widest mb-2">Destacadas</p>
            <h2 className="font-display text-4xl font-bold text-coffee-900 dark:text-cream-50">Cafeterías cerca tuyo</h2>
          </div>
          <Link
            to="/explore"
            className="hidden md:flex items-center gap-2 text-coffee-700 hover:text-coffee-900 dark:text-cream-200 dark:hover:text-cream-50 font-body font-semibold transition-colors"
          >
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        {error && !loading && (
          <EmptyState
            icon={AlertCircle}
            title="No pudimos cargar las cafeterías"
            description={error}
            actionLabel="Reintentar"
            onAction={refetch}
          />
        )}

        {loading ? (
          <p className="font-body text-coffee-600 dark:text-coffee-200 text-center py-12">Cargando cafeterías cercanas…</p>
        ) : !error && featured.length === 0 ? (
          <EmptyState
            emoji="☕"
            title="Sin cafeterías en el radio"
            description="Probá iniciar sesión como Premium para ampliar el radio."
            actionLabel="Explorar"
            actionTo="/explore"
          />
        ) : !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((cafe, i) => (
              <div key={cafe.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <CafeteriaCard cafe={cafe} />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/explore" className="btn-primary inline-flex items-center gap-2">
            <MapPin size={16} />
            Explorar todas las cafeterías
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 bg-coffee-700 dark:bg-coffee-800 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-cream-50 text-center mb-14">
            ¿Por qué Find My Coffee?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Cerca tuyo',
                desc: 'Encontrá cafeterías en tu barrio usando tu ubicación. Filtrá por distancia, horario y características.',
              },
              {
                icon: Star,
                title: 'Reseñas reales',
                desc: 'Lee opiniones de otros amantes del café. Calificá comida, servicio y ambiente por separado.',
              },
              {
                icon: Coffee,
                title: 'Menú completo',
                desc: 'Consultá el menú con precios antes de ir. Conocé las especialidades de cada local.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 bg-coffee-600 dark:bg-coffee-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={28} className="text-cream-100" />
                </div>
                <h3 className="font-display text-xl font-semibold text-cream-50 mb-3">{title}</h3>
                <p className="font-body text-cream-200 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 bg-cream-100 dark:bg-coffee-900 max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-4xl font-bold text-coffee-900 dark:text-cream-50 mb-4">
          ¿Tenés una cafetería?
        </h2>
        <p className="font-body text-coffee-600 dark:text-cream-200 text-lg mb-8 max-w-xl mx-auto">
          Registrá tu negocio gratis y llegá a miles de amantes del café en tu zona.
        </p>
        <Link to="/register-business" className="btn-primary inline-flex items-center gap-2">
          <Coffee size={16} />
          Registrar mi negocio
        </Link>
      </section>
    </div>
  );
}
