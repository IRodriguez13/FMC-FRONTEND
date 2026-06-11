import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CafeteriasProvider } from './context/CafeteriasContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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

function Layout({ children }) {
  useOptionalAnalytics();
  return (
    <div className="min-h-screen bg-cream-100 dark:bg-coffee-900 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function NoNavLayout({ children }) {
  useOptionalAnalytics();
  return (
    <div className="min-h-screen bg-cream-100 dark:bg-coffee-900 flex flex-col">
      <main className="flex-1">{children}</main>
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
                <Route path="/login" element={<NoNavLayout><Login /></NoNavLayout>} />
                <Route path="/register" element={<NoNavLayout><Register /></NoNavLayout>} />
                <Route path="/register-business" element={<NoNavLayout><RegisterBusiness /></NoNavLayout>} />

                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/explore" element={<Layout><Explore /></Layout>} />
                <Route path="/cafe/:id" element={<Layout><CafeDetail /></Layout>} />
                <Route path="/enterprise" element={<Layout><EnterpriseDashboard /></Layout>} />
                <Route path="/map" element={<Layout><MapView /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
                <Route path="/checkout/:planKey" element={<Layout><PaymentCheckout /></Layout>} />
                <Route path="/terms" element={<Layout><Terms /></Layout>} />
                <Route path="/demo" element={<Layout><Demo /></Layout>} />
                <Route path="*" element={<Layout><Home /></Layout>} />
              </Routes>
            </BrowserRouter>
          </CafeteriasProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
