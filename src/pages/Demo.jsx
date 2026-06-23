import { Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  Camera,
  CreditCard,
  LogIn,
  Compass,
} from 'lucide-react';

const FLOW = [
  { icon: LogIn, title: 'Iniciá sesión', desc: 'Registrate o entrá con tu cuenta para favoritos, reseñas y planes Premium.' },
  { icon: Compass, title: 'Explorá / Mapa', desc: 'Descubrí cafeterías en CABA con fotos, distancia y reseñas.' },
  { icon: Star, title: 'Plan Premium', desc: 'Ampliá el radio de búsqueda y accedé a descuentos exclusivos.' },
  { icon: Camera, title: 'Fotos y reseñas', desc: 'Compartí tu experiencia en el detalle de cada local.' },
];

export default function Demo() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <p className="font-body text-xs uppercase tracking-widest text-coffee-400 dark:text-coffee-300">Ayuda</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-800 dark:text-cream-100">
          Primeros pasos
        </h1>
        <p className="font-body text-coffee-600 dark:text-coffee-300 leading-relaxed">
          Cómo explorar cafeterías, activar Premium y participar en la comunidad.
        </p>
      </div>

      <section className="rounded-2xl border border-sand-200 dark:border-coffee-600 bg-white dark:bg-coffee-800 p-6 space-y-4 shadow-card">
        <h2 className="font-display text-xl font-bold text-coffee-800 dark:text-cream-100">Empezá acá</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FLOW.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 p-3 rounded-xl bg-cream-50 dark:bg-coffee-800/40 border border-sand-200 dark:border-coffee-700">
              <Icon size={20} className="text-coffee-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-body font-semibold text-coffee-800 dark:text-cream-100 text-sm">{title}</p>
                <p className="font-body text-xs text-coffee-500 dark:text-coffee-300 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/login" className="btn-primary text-sm py-2.5">Ir a login</Link>
          <Link to="/explore" className="btn-secondary text-sm py-2.5">Explorar</Link>
          <Link to="/map" className="btn-secondary text-sm py-2.5 inline-flex items-center gap-1">
            <MapPin size={14} /> Mapa
          </Link>
          <Link to="/checkout/consumer-premium" className="btn-secondary text-sm py-2.5 inline-flex items-center gap-1">
            <CreditCard size={14} /> Premium
          </Link>
        </div>
      </section>

      <p className="font-body text-xs text-center text-coffee-400 dark:text-coffee-500 pb-8">
        <Link to="/terms" className="underline">Términos</Link>
      </p>
    </div>
  );
}
