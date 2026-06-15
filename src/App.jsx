import { BrowserRouter, Routes, Route, useLocation, useOutlet } from 'react-router-dom';
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
import Explore from './pages/Explore';
import CafeDetail from './pages/CafeDetail';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import RegisterBusiness from './pages/RegisterBusiness';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import PaymentCheckout from './pages/PaymentCheckout';
import Terms from './pages/Terms';
import Demo from './pages/Demo';
import { useOptionalAnalytics } from './lib/useOptionalAnalytics';

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
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register-business" element={<RegisterBusiness />} />
                </Route>

                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/cafe/:id" element={<CafeDetail />} />
                  <Route path="/enterprise" element={<EnterpriseDashboard />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/checkout/:planKey" element={<PaymentCheckout />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/demo" element={<Demo />} />
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
