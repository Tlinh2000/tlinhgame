import { Route, Routes, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { GameLibraryPage, GameDetailsPage } from './pages/GameLibraryPage';
import { ConnectionPage } from './pages/ConnectionPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);
  return <AppShell><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/games" element={<GameLibraryPage />} />
    <Route path="/games/:gameId" element={<GameDetailsPage />} />
    <Route path="/connection" element={<ConnectionPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<div className="empty-page"><h1>Trang này chưa có</h1><p>Quay lại trang chủ để tiếp tục khám phá TlinhGame.</p><Link className="button primary" to="/">Về trang chủ</Link></div>} />
  </Routes></AppShell>;
}
