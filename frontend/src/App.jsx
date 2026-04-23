import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import PlaylistsPage from './pages/PlaylistsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminUpload from './pages/AdminUpload';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MusicProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46' },
            }}
          />
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/" element={
              <ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>
            } />
            <Route path="/playlists" element={
              <ProtectedRoute><Layout><PlaylistsPage /></Layout></ProtectedRoute>
            } />
            <Route path="/playlists/:id" element={
              <ProtectedRoute><Layout><PlaylistsPage /></Layout></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><Layout><AdminUpload /></Layout></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MusicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
