import { Link } from 'react-router-dom';
import { MapPin, Star, Coffee, ArrowRight, Search } from 'lucide-react';
import Logo from '../components/Logo';
import CafeteriaCard from '../components/CafeteriaCard';
import { useCafeterias } from '../context/CafeteriasContext';

export default function Home() {
  const { cafes, loading } = useCafeterias();
  const featured = cafes.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-coffee-700 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <Logo
              key={i}
              size={40}
              className="absolute"
              positionStyles={{
                position: 'absolute',
                left: `${(i % 5) * 25 + Math.random() * 10}%`,
                top: `${Math.floor(i / 5) * 30 + Math.random() * 15}%`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`,
                opacity: 0.2 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-30 flex flex-col items-center text-center animate-fade-in">
          <Logo size={140} className="-mb-2 drop-shadow-2xl" />
          <h1 className="font-display text-5xl md:text-xl font-bold text-cream-100 leading-tight mb-4">
            Find My Coffee
          </h1>
          <p className="font-body text-cream-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Descubrí las mejores cafeterías cerca tuyo. Reseñas reales, menús completos y todo lo que necesitás para encontrar tu rincón perfecto.
          </p>

          {/* Search bar */}
          <div className="w-full max-w-xl flex gap-3 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
              <input
                type="text"
                placeholder="Barrio, nombre o tipo de café..."
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-cream-100 placeholder-cream-400 font-body focus:outline-none focus:ring-2 focus:ring-cream-300 focus:bg-white/20 transition-all"
              />
            </div>
            <Link
              to="/explore"
              className="bg-cream-200 hover:bg-cream-100 text-coffee-800 font-body font-semibold px-6 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg"
            >
              Buscar
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 text-cream-300">
            {[
              { label: 'Cafeterías', value: '200+' },
              { label: 'Reseñas', value: '4.800+' },
              { label: 'Barrios', value: '48' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl font-bold text-cream-100">{value}</p>
                <p className="font-body text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80 Q300 20 600 60 Q900 100 1200 40 L1200 80 Z" fill="#faf3e0" />
          </svg>
        </div>
      </section>

      {/* Featured cafes */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-body text-coffee-400 text-sm uppercase tracking-widest mb-2">Destacadas</p>
            <h2 className="font-display text-4xl font-bold text-coffee-800">Cafeterías cerca tuyo</h2>
          </div>
          <Link
            to="/explore"
            className="hidden md:flex items-center gap-2 text-coffee-600 hover:text-coffee-800 font-body font-semibold transition-colors"
          >
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p className="font-body text-coffee-500 text-center py-12">Cargando cafeterías cercanas…</p>
        ) : (
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

      {/* Features section */}
      <section className="bg-coffee-700 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-cream-100 text-center mb-14">
            ¿Por qué Find My Coffee?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Cerca tuyo',
                desc: 'Encontrá cafeterías en tu barrio usando tu ubicación. Filtrá por distancia, horario y características.'
              },
              {
                icon: Star,
                title: 'Reseñas reales',
                desc: 'Lee opiniones de otros amantes del café. Calificá comida, servicio y ambiente por separado.'
              },
              {
                icon: Coffee,
                title: 'Menú completo',
                desc: 'Consultá el menú con precios antes de ir. Conocé las especialidades de cada local.'
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 bg-coffee-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={28} className="text-cream-200" />
                </div>
                <h3 className="font-display text-xl font-semibold text-cream-100 mb-3">{title}</h3>
                <p className="font-body text-cream-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-4xl font-bold text-coffee-800 mb-4">
          ¿Tenés una cafetería?
        </h2>
        <p className="font-body text-coffee-500 text-lg mb-8 max-w-xl mx-auto">
          Registrá tu negocio gratis y llegá a miles de amantes del café en tu zona.
        </p>
        <Link to="/register-business" className="btn-primary inline-flex items-center gap-2">
          <Coffee size={16} />
          Registrar mi negocio
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-900 text-cream-300 py-10 text-center">
        <Logo size={60} color="#e8c99a" />
        <p className="font-display text-xl font-semibold text-cream-100 mb-1">Find My Coffee</p>
        <p className="font-body text-sm">© 2024 · Hecho con ☕ en Buenos Aires</p>
      </footer>
    </div>
  );
}
