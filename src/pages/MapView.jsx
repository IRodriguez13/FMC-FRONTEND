import { useState } from 'react';
import { MapPin, Search, X, Navigation, Loader2, AlertCircle, Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackNavLink from '../components/BackNavLink';
import { useCafeterias } from '../context/CafeteriasContext';
import { useAuth } from '../context/AuthContext';
import { CABA } from '../lib/caba';
import CafeteriasMap from '../components/CafeteriasMap';
import EmptyState from '../components/EmptyState';
import CafeCoverImage from '../components/CafeCoverImage';
import OwnCafeteriaBadge from '../components/OwnCafeteriaBadge';
import { isOwnEnterpriseCafeteria } from '../lib/ownCafeteria';

export default function MapView() {
  const { user } = useAuth();
  const { cafes, loading, error, coords, meta, refetch } = useCafeterias();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = search
    ? cafes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.neighborhood.toLowerCase().includes(search.toLowerCase())
      )
    : cafes;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-cream-100 dark:bg-coffee-900">
      <div className="p-4 bg-white dark:bg-coffee-800 border-b border-sand-200 dark:border-coffee-700 shadow-sm z-20 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <BackNavLink
            fallback="/explore"
            label="Volver"
            className="inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border border-sand-200 dark:border-coffee-600 text-coffee-700 dark:text-cream-100 hover:bg-cream-50 dark:hover:bg-coffee-700 shrink-0 self-start sm:self-center mb-0 font-body text-sm font-medium"
          />
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" />
            <input
              type="text"
              placeholder="Filtrar por nombre o barrio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 pr-10"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <p className="font-body text-xs text-coffee-500 dark:text-coffee-300 hidden sm:block">
              {CABA.displayName}
              {meta ? ` · ${filtered.length} locales · ${meta.appliedRadiusKm} km` : ''}
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="btn-secondary text-xs py-2 px-3 disabled:opacity-50"
            >
              {refreshing || loading ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden min-h-0">
        <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-coffee-800 border-b md:border-b-0 md:border-r border-sand-200 dark:border-coffee-700 overflow-y-auto shrink-0 max-h-[36vh] md:max-h-none md:h-auto z-10">
          <div className="p-4">
            {loading && (
              <div className="flex items-center gap-2 text-coffee-500 dark:text-coffee-300 font-body text-sm py-6">
                <Loader2 size={16} className="animate-spin" /> Cargando cafeterías…
              </div>
            )}
            {error && (
              <EmptyState
                icon={AlertCircle}
                title="No pudimos cargar el mapa"
                description={error}
                actionLabel="Reintentar"
                onAction={handleRefresh}
              />
            )}
            {!loading && !error && filtered.length === 0 && (
              <EmptyState
                emoji="🗺️"
                title="Sin cafeterías en el mapa"
                description="Ampliá el radio con Premium o probá más tarde."
                actionLabel="Explorar"
                actionTo="/explore"
              />
            )}
            <div className="space-y-2">
              {filtered.map(cafe => (
                <button
                  key={cafe.id}
                  type="button"
                  onClick={() => setSelected(cafe)}
                  className={`w-full text-left flex gap-3 p-3 rounded-2xl border transition-all ${
                    selected?.id === cafe.id
                      ? 'border-coffee-500 bg-cream-100 dark:bg-coffee-700 shadow-coffee'
                      : isOwnEnterpriseCafeteria(user, cafe.id)
                        ? 'border-coffee-400/70 dark:border-coffee-500 bg-cream-50/80 dark:bg-coffee-700/40 hover:border-coffee-400'
                        : 'border-sand-200 dark:border-coffee-600 hover:border-coffee-300 hover:bg-cream-50 dark:hover:bg-coffee-700/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-coffee-600">
                    <CafeCoverImage
                      src={cafe.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 mb-0.5">
                      <p className="font-body font-semibold text-coffee-800 dark:text-cream-100 text-sm truncate">{cafe.name}</p>
                      {isOwnEnterpriseCafeteria(user, cafe.id) && <OwnCafeteriaBadge />}
                    </div>
                    <p className="font-body text-xs text-coffee-400 dark:text-coffee-300 flex items-center gap-1 flex-wrap">
                      <MapPin size={10} /> {cafe.neighborhood} ·{' '}
                      {cafe.distance < 1000 ? `${cafe.distance}m` : `${(cafe.distance / 1000).toFixed(1)}km`}
                      {cafe.rating != null && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600">
                          <Star size={10} className="fill-amber-400" /> {cafe.rating}
                        </span>
                      )}
                      {cafe.subscriptionTier === 'Premium' && (
                        <span className="text-amber-600 font-semibold">· Premium</span>
                      )}
                      {user?.premium && cafe.discountPercent != null && (
                        <span className="text-amber-600 font-semibold">· -{cafe.discountPercent}%</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative min-h-[55vh] md:min-h-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-cream-200 dark:bg-coffee-800 font-body text-coffee-600 dark:text-coffee-300 z-10">
              <Loader2 className="animate-spin mr-2" size={20} /> Cargando mapa…
            </div>
          ) : (
            <CafeteriasMap
              cafes={filtered}
              userCoords={coords}
              selectedId={selected?.id}
              selectedCafe={selected}
              onSelect={setSelected}
            />
          )}

          {selected && !loading && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-coffee-800 rounded-2xl shadow-xl p-4 border border-sand-200 dark:border-coffee-600 z-[1000]">
              <CafeCoverImage src={selected.coverImage} alt="" className="w-full h-28 object-cover rounded-xl mb-3" />
              <div className="flex items-start gap-2 flex-wrap">
                <h3 className="font-display text-lg font-bold text-coffee-800 dark:text-cream-100">{selected.name}</h3>
                {isOwnEnterpriseCafeteria(user, selected.id) && <OwnCafeteriaBadge className="mt-1" />}
              </div>
              <p className="font-body text-sm text-coffee-500 dark:text-coffee-300 flex items-center gap-1 mt-1">
                <Navigation size={12} />
                {selected.address}
              </p>
              <Link to={`/cafe/${selected.id}`} className="btn-primary w-full mt-3 text-sm py-2 block text-center">
                Ver detalle
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
