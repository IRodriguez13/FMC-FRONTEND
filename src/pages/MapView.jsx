import { useState } from 'react';
import { MapPin, Search, X, Navigation, Loader2, AlertCircle, Crosshair, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCafeterias } from '../context/CafeteriasContext';
import { CABA } from '../lib/caba';
import CafeteriasMap from '../components/CafeteriasMap';

export default function MapView() {
  const { cafes, loading, error, coords, meta, refetch } = useCafeterias();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = search
    ? cafes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.neighborhood.toLowerCase().includes(search.toLowerCase())
      )
    : cafes;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-cream-100">
      <div className="p-4 bg-white border-b border-sand-200 shadow-sm z-20 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
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
            <p className="font-body text-xs text-coffee-500 hidden sm:block">
              {CABA.displayName}
              {meta ? ` · ${filtered.length} locales · ${meta.appliedRadiusKm} km` : ''}
            </p>
            <button type="button" onClick={refetch} className="btn-secondary text-xs py-2 px-3">
              Actualizar
            </button>
          </div>
        </div>
        <p className="font-body text-[11px] text-coffee-400 mt-2 max-w-6xl mx-auto">
          Mapa gratuito (OpenStreetMap + Leaflet). Punto azul = vos · tazas = cafeterías
          (<span className="text-amber-600 font-medium">ámbar</span> = Enterprise Premium).
        </p>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden min-h-0">
        <div className="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-sand-200 overflow-y-auto shrink-0 max-h-[36vh] md:max-h-none md:h-auto z-10">
          <div className="p-4">
            {loading && (
              <div className="flex items-center gap-2 text-coffee-500 font-body text-sm py-6">
                <Loader2 size={16} className="animate-spin" /> Cargando cafeterías…
              </div>
            )}
            {error && (
              <div className="py-4 space-y-2">
                <p className="font-body text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </p>
                <p className="text-xs text-coffee-500">¿Backend en marcha? <code>make up</code> en fmcbackend (puerto 5214)</p>
                <button type="button" onClick={refetch} className="btn-secondary text-sm py-2">
                  Reintentar
                </button>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className="font-body text-sm text-coffee-500 py-4">
                Sin cafeterías en el radio. Probá <code>make reset-db && make up</code> en el backend.
              </p>
            )}
            <div className="space-y-2">
              {filtered.map(cafe => (
                <button
                  key={cafe.id}
                  type="button"
                  onClick={() => setSelected(cafe)}
                  className={`w-full text-left flex gap-3 p-3 rounded-2xl border transition-all ${
                    selected?.id === cafe.id
                      ? 'border-coffee-500 bg-cream-100 shadow-coffee'
                      : 'border-sand-200 hover:border-coffee-300 hover:bg-cream-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-coffee-600 flex items-center justify-center shrink-0">
                    <Coffee size={20} className="text-cream-100" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-coffee-800 text-sm truncate">{cafe.name}</p>
                    <p className="font-body text-xs text-coffee-400 flex items-center gap-1">
                      <MapPin size={10} /> {cafe.neighborhood} ·{' '}
                      {cafe.distance < 1000 ? `${cafe.distance}m` : `${(cafe.distance / 1000).toFixed(1)}km`}
                      {cafe.subscriptionTier === 'Premium' && (
                        <span className="text-amber-600 font-semibold ml-1">· Premium</span>
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
            <div className="absolute inset-0 flex items-center justify-center bg-cream-200 font-body text-coffee-600 z-10">
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

          {coords && !loading && (
            <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-body text-coffee-600 shadow-md flex items-center gap-1.5 pointer-events-none">
              <Crosshair size={14} className="text-blue-500" />
              Tu ubicación (CABA)
            </div>
          )}

          {selected && !loading && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-2xl shadow-xl p-4 border border-sand-200 z-[1000]">
              <h3 className="font-display text-lg font-bold text-coffee-800">{selected.name}</h3>
              <p className="font-body text-sm text-coffee-500 flex items-center gap-1 mt-1">
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
