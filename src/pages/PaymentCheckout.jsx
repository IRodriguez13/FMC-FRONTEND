import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, Shield, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCafeterias } from '../context/CafeteriasContext';
import { useToast } from '../context/ToastContext';
import { friendlyApiMessage } from '../lib/userFacingError';

const PLANS = {
  'consumer-premium': {
    title: 'Plan Premium — Consumidor',
    price: '$2.990',
    period: '/mes',
    benefits: [
      'Radio de búsqueda ampliado (15 km)',
      'Hasta 50 cafeterías por consulta',
      'Descuentos comerciales visibles en listados',
    ],
    activate: 'consumer',
    successPath: '/profile',
  },
  'enterprise-premium': {
    title: 'Plan Premium — Enterprise',
    price: '$9.990',
    period: '/mes',
    benefits: [
      'Mayor visibilidad en el mapa (ranking boost)',
      'Aparecés antes que locales Standard en /nearby',
      'Icono ámbar en el mapa',
    ],
    activate: 'enterprise',
    successPath: '/enterprise',
  },
};

export default function PaymentCheckout() {
  const { planKey } = useParams();
  const plan = PLANS[planKey];
  const navigate = useNavigate();
  const { user, authLoading, isConsumer, isEnterprise, setConsumerTier, setEnterpriseSubscriptionTier } = useAuth();
  const { refetch } = useCafeterias();
  const toast = useToast();

  const [step, setStep] = useState('form');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true, state: { from: `/checkout/${planKey}` } });
      return;
    }
    if (plan?.activate === 'consumer' && !isConsumer) navigate('/enterprise', { replace: true });
    if (plan?.activate === 'enterprise' && !isEnterprise) navigate('/profile', { replace: true });
  }, [authLoading, user, isConsumer, isEnterprise, plan, planKey, navigate]);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-body text-coffee-600 mb-4">Plan de pago no encontrado.</p>
          <Link to="/" className="btn-primary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const alreadyPremium =
    (plan.activate === 'consumer' && user?.premium) ||
    (plan.activate === 'enterprise' && user?.cafeteria?.subscriptionTier === 'Premium');

  const activatePremium = async () => {
    setError('');
    setActivating(true);
    try {
      if (plan.activate === 'consumer') {
        const newToken = await setConsumerTier('Premium');
        await refetch(newToken);
      } else {
        await setEnterpriseSubscriptionTier('Premium');
        await refetch();
      }
      setStep('done');
      toast.success('Premium activado correctamente.');
    } catch (e) {
      setError(friendlyApiMessage(e, 'No pudimos activar Premium. Probá de nuevo.'));
    } finally {
      setActivating(false);
    }
  };

  const handleFakePay = async () => {
    setError('');
    setStep('processing');
    await new Promise(r => setTimeout(r, 1500));
    await activatePremium();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-coffee-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-coffee-900">
      <div className="bg-coffee-700 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <Link
            to={plan.successPath}
            className="inline-flex items-center gap-2 text-cream-300 hover:text-cream-100 font-body text-sm mb-4"
          >
            <ArrowLeft size={16} /> Volver
          </Link>
          <h1 className="font-display text-2xl font-bold text-cream-100 flex items-center gap-2">
            <CreditCard size={24} />
            Pasarela de pagos
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-coffee-400 dark:text-coffee-300">Suscripción</p>
              <h2 className="font-display text-xl font-bold text-coffee-800 dark:text-cream-100 mt-1">{plan.title}</h2>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-coffee-800 dark:text-cream-100">{plan.price}</p>
              <p className="font-body text-xs text-coffee-400">{plan.period}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {plan.benefits.map(b => (
              <li key={b} className="flex items-start gap-2 font-body text-sm text-coffee-600 dark:text-coffee-200">
                <Star size={14} className="text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {alreadyPremium && step !== 'done' && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-100 px-4 py-3 rounded-xl font-body text-sm">
            Ya tenés Premium activo. Podés volver al panel o probar los privilegios en explore/mapa.
          </div>
        )}

        {step === 'form' && !alreadyPremium && (
          <div className="card p-6 space-y-4">
            <p className="font-body text-sm font-semibold text-coffee-700 dark:text-cream-100 flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              Datos de tarjeta
            </p>
            <input
              className="input-field"
              placeholder="Número de tarjeta"
              defaultValue="4111 1111 1111 1111"
              readOnly
            />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="MM/AA" defaultValue="12/28" readOnly />
              <input className="input-field" placeholder="CVV" defaultValue="123" readOnly />
            </div>
            <button type="button" onClick={handleFakePay} className="btn-primary w-full py-3">
              Pagar con tarjeta
            </button>
            <button
              type="button"
              onClick={activatePremium}
              disabled={activating}
              className="btn-secondary w-full py-3 dark:border-coffee-500 dark:text-cream-100 dark:hover:bg-coffee-800"
            >
              {activating ? 'Activando…' : 'Activar Premium'}
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="card p-8 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-coffee-500 mb-3" />
            <p className="font-body text-coffee-600 dark:text-coffee-300">Procesando pago…</p>
          </div>
        )}

        {step === 'done' && (
          <div className="card p-8 text-center space-y-4">
            <CheckCircle2 size={40} className="mx-auto text-green-600" />
            <p className="font-display text-xl font-bold text-coffee-800 dark:text-cream-100">¡Premium activado!</p>
            <p className="font-body text-sm text-coffee-500 dark:text-coffee-300">
              Tus privilegios ya están disponibles en explore y mapa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/explore" className="btn-primary">Ver descuentos en Explore</Link>
              <Link to={plan.successPath} className="btn-secondary">Ir al panel</Link>
            </div>
          </div>
        )}

        {error && (
          <p className="font-body text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
