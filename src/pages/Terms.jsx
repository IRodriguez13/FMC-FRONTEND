import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-coffee-900 dark:text-cream-50 mb-6 text-center">
          Términos y condiciones
        </h1>

        <div className="rounded-2xl border border-sand-200 dark:border-coffee-600 bg-white dark:bg-coffee-800 p-6 md:p-8 font-body text-coffee-700 dark:text-coffee-100 text-sm leading-relaxed space-y-4 shadow-card">
          <p>
            Find My Coffee conecta consumidores con cafeterías en CABA. Los planes Premium amplían
            radio de búsqueda, visibilidad de descuentos y ranking en el mapa.
          </p>
          <p>
            Las reseñas y fotos publicadas por usuarios deben respetar las normas de convivencia.
            Los datos de ubicación se usan solo para mostrar cafeterías en CABA.
          </p>
          <p className="text-coffee-500 dark:text-coffee-400 text-xs pt-2">
            Última actualización: junio 2026
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
          <Link to="/profile" className="btn-secondary">
            Mi perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
