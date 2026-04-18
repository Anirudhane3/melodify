import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import PlaylistsPage from './pages/PlaylistsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminUpload from './pages/AdminUpload';
import './components/Layout/Layout.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MusicProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/playlists" element={
              <ProtectedRoute>
                <Layout>
                  <PlaylistsPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/playlists/:id" element={
              <ProtectedRoute>
                <Layout>
                  <PlaylistsPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout>
                  <AdminUpload />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MusicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
