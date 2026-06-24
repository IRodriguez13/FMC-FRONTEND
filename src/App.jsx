import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useOutlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { CafeteriasProvider } from './context/CafeteriasContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteTransition from './components/RouteTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Terms from './pages/Terms';
import { useOptionalAnalytics } from './lib/useOptionalAnalytics';

const Explore = lazy(() => import('./pages/Explore'));
const CafeDetail = lazy(() => import('./pages/CafeDetail'));
const MapView = lazy(() => import('./pages/MapView'));
const Profile = lazy(() => import('./pages/Profile'));
const Favorites = lazy(() => import('./pages/Favorites'));
const RegisterBusiness = lazy(() => import('./pages/RegisterBusiness'));
const EnterpriseDashboard = lazy(() => import('./pages/EnterpriseDashboard'));
const PaymentCheckout = lazy(() => import('./pages/PaymentCheckout'));
const Demo = lazy(() => import('./pages/Demo'));

function PageFallback() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[40vh] text-coffee-500 dark:text-coffee-300 font-body text-sm gap-2">
      <Loader2 size={18} className="animate-spin" aria-hidden />
      Cargando…
    </div>
  );
}

function SuspenseOutlet() {
  const outlet = useOutlet();
  return <Suspense fallback={<PageFallback />}>{outlet}</Suspense>;
}

function Layout() {
  useOptionalAnalytics();
  const location = useLocation();
  const outlet = useOutlet();
  const isMap = location.pathname === '/map';

  return (
    <div
      className={`bg-cream-100 dark:bg-coffee-900 flex flex-col ${
        isMap ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      <Navbar />
      <RouteTransition location={location}>{outlet}</RouteTransition>
      {!isMap && <Footer />}
    </div>
  );
}

function NoNavLayout() {
  useOptionalAnalytics();
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-coffee-900 flex flex-col">
      <RouteTransition location={location} variant="fade">{outlet}</RouteTransition>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CafeteriasProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<NoNavLayout />}>
                  <Route element={<SuspenseOutlet />}>
                    <Route path="/register-business" element={<RegisterBusiness />} />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                <Route element={<Layout />}>
                  <Route element={<SuspenseOutlet />}>
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/cafe/:id" element={<CafeDetail />} />
                    <Route path="/enterprise" element={<EnterpriseDashboard />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/checkout/:planKey" element={<PaymentCheckout />} />
                    <Route path="/demo" element={<Demo />} />
                  </Route>
                  <Route path="/" element={<Home />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<Home />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CafeteriasProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
