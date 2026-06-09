import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, X, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import CafeteriaCard from '../components/CafeteriaCard';
import { Link } from 'react-router-dom';
import { useCafeterias } from '../context/CafeteriasContext';
import { CABA } from '../lib/caba';

const SORT_OPTIONS = [
  { label: 'Más cercanas', value: 'distance' },
  { label: 'Nombre A-Z', value: 'name' },
];

export default function Explore() {
  const { cafes, loading, error, meta, refetch, radiusKm, setRadiusKm } = useCafeterias();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = [...cafes];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.neighborhood.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (premiumOnly) {
      list = list.filter(c => c.subscriptionTier === 'Premium');
    }

    list.sort((a, b) => {
      if (sort === 'distance') return a.distance - b.distance;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [cafes, search, sort, premiumOnly]);

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="bg-coffee-700 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-cream-300 mb-2">
            <MapPin size={14} />
            <span className="font-body text-sm">
              {CABA.displayName}
              {meta ? ` · radio ${meta.appliedRadiusKm} km · plan ${meta.viewerTier}` : ' · buscando cerca tuyo…'}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-cream-100 mb-6">Buscar cafeterías</h1>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" />
              <input
                type="text"
                placeholder="Nombre, barrio o dirección..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/95 border border-white/20 text-coffee-800 placeholder-coffee-400 font-body focus:outline-none focus:ring-2 focus:ring-cream-300 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-coffee-600">
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-body font-semibold transition-all ${
                showFilters || premiumOnly
                  ? 'bg-cream-200 text-coffee-800'
                  : 'bg-white/20 text-cream-100 hover:bg-white/30'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border-b border-sand-200 shadow-sm animate-slide-down">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="font-body text-sm font-semibold text-coffee-600">Ordenar:</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`px-3 py-1.5 rounded-full font-body text-sm transition-all ${
                    sort === opt.value ? 'bg-coffee-600 text-white' : 'bg-cream-100 text-coffee-600 hover:bg-cream-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPremiumOnly(!premiumOnly)}
              className={`px-3 py-1.5 rounded-full font-body text-sm transition-all ${
                premiumOnly ? 'bg-coffee-600 text-white' : 'bg-cream-100 text-coffee-600'
              }`}
            >
              Solo Enterprise Premium
            </button>
            <div className="flex items-center gap-2">
              <span className="font-body text-sm font-semibold text-coffee-600">Radio (km):</span>
              {[null, 2, 5, 10, 15].map((r) => (
                <button
                  key={String(r)}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`px-3 py-1.5 rounded-full font-body text-sm ${
                    radiusKm === r ? 'bg-coffee-600 text-white' : 'bg-cream-100 text-coffee-600'
                  }`}
                >
                  {r == null ? 'Auto' : r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-body text-sm font-medium border transition-all ${
              sort === opt.value
                ? 'bg-coffee-600 text-white border-coffee-600'
                : 'bg-white text-coffee-600 border-sand-300 hover:border-coffee-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <Link
          to="/map"
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full font-body text-sm font-medium border border-sand-300 bg-white text-coffee-600 hover:border-coffee-400 transition-all"
        >
          <MapPin size={13} />
          Ver en mapa
        </Link>
        <button
          onClick={refetch}
          className="flex-shrink-0 px-4 py-1.5 rounded-full font-body text-sm font-medium border border-sand-300 bg-white text-coffee-600"
        >
          Actualizar
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-20 text-coffee-500 font-body">
            <Loader2 size={20} className="animate-spin" />
            Cargando cafeterías…
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle className="text-red-500" size={32} />
            <p className="font-body text-coffee-600">{error}</p>
            <p className="font-body text-sm text-coffee-400">¿Está el backend en marcha? (make up · puerto 5214)</p>
            <button onClick={refetch} className="btn-primary">Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="font-body text-coffee-500 text-sm mb-4">
              {filtered.length} {filtered.length === 1 ? 'cafetería encontrada' : 'cafeterías encontradas'}
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">☕</div>
                <h3 className="font-display text-2xl font-semibold text-coffee-700 mb-2">Sin resultados</h3>
                <p className="font-body text-coffee-400 mb-6">Probá con otro término o ampliá el radio desde el backend.</p>
                <button onClick={() => { setSearch(''); setPremiumOnly(false); }} className="btn-secondary">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((cafe, i) => (
                  <div key={cafe.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <CafeteriaCard cafe={cafe} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
