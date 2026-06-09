import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CafeteriasProvider } from './context/CafeteriasContext';
import Navbar from './components/Navbar';
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

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar />
      {children}
    </div>
  );
}

function NoNavLayout({ children }) {
  return <div className="min-h-screen">{children}</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <CafeteriasProvider>
      <BrowserRouter>
        <Routes>
          {/* No navbar on auth pages */}
          <Route path="/login" element={<NoNavLayout><Login /></NoNavLayout>} />
          <Route path="/register" element={<NoNavLayout><Register /></NoNavLayout>} />
          <Route path="/register-business" element={<NoNavLayout><RegisterBusiness /></NoNavLayout>} />

          {/* With navbar */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/explore" element={<Layout><Explore /></Layout>} />
          <Route path="/cafe/:id" element={<Layout><CafeDetail /></Layout>} />
          <Route path="/enterprise" element={<Layout><EnterpriseDashboard /></Layout>} />
          <Route path="/map" element={<Layout><MapView /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>
      </BrowserRouter>
      </CafeteriasProvider>
    </AuthProvider>
  );
}
