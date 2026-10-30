import type { ReactNode, FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { House, Gamepad2, Radio, Settings2, Users, Trophy, ShoppingBag, UserRound, Search, ArrowUpRight, Volume2, VolumeX, ChevronRight, Code2 } from 'lucide-react';
import { useNetwork } from '../lib/network';
import { usePreferences } from '../lib/preferences';

const navItems = [
  { to: '/', label: 'Trang chủ', icon: House },
  { to: '/games', label: 'Thư viện game', icon: Gamepad2 },
  { to: '/connection', label: 'Kết nối', icon: Radio },
];
export function AppShell({ children }: { children: ReactNode }) {
  const network = useNetwork();
  const { preferences, update } = usePreferences();
  const navigate = useNavigate();
  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('search')?.toString().trim() ?? '';
    navigate(`/games${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };
  return <div className="app-layout">
    <a href="#main-content" className="skip-link">Bỏ qua điều hướng</a>
    <aside className="sidebar">
      <Link to="/" className="brand" aria-label="TlinhGame, trang chủ"><img src="/favicon.svg" alt="" /><span>Tlinh<span className="brand-light">Game</span><small>PLAY YOUR WAY</small></span></Link>
      <div className="nav-label">KHÁM PHÁ</div>
      <nav aria-label="Điều hướng chính">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} /><span>{label}</span>{to === '/connection' && <span className={`nav-dot ${network.connection === 'online' ? 'online' : ''}`} />}</NavLink>)}</nav>
      <div className="nav-label secondary-label">KHÔNG GIAN CỦA BẠN</div>
      <div className="upcoming-nav">{[{ icon: UserRound, label: 'Avatar Studio' }, { icon: Users, label: 'Bạn bè' }, { icon: Trophy, label: 'Bảng xếp hạng' }, { icon: ShoppingBag, label: 'Cửa hàng' }].map(({ icon: Icon, label }) => <div className="nav-link locked" key={label} aria-disabled="true"><Icon size={19} /><span>{label}</span><span className="soon">Sắp có</span></div>)}</div>
      <div className="sidebar-bottom"><div className="build-card"><div className="build-card-top"><Code2 size={17} /><span>CÙNG XÂY TLINHGAME</span></div><strong>Hành trình bắt đầu.</strong><p>Bản phát triển đầu tiên của nền tảng game mang dấu ấn của bạn.</p><Link to="/connection">Xem tiến độ kết nối <ArrowUpRight size={16} /></Link></div><NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/settings"><Settings2 size={19} /><span>Cài đặt</span></NavLink><div className="sidebar-version">TLINHGAME <span>v0.1 · Phần 2.1</span></div></div>
    </aside>
    <div className="main-column">
      <header className="topbar"><Link className="mobile-brand" to="/"><img src="/favicon.svg" alt="" />TlinhGame</Link><form className="global-search" onSubmit={search}><Search size={18} /><input name="search" aria-label="Tìm trò chơi" placeholder="Tìm trò chơi của bạn..." autoComplete="off" /><kbd>↵</kbd></form><div className="topbar-actions"><Link to="/connection" className={`connection-chip ${network.connection === 'online' ? 'connected' : ''}`} aria-label={network.connection === 'online' ? 'Máy chủ đã kết nối' : 'Máy chủ chưa kết nối'}><span className="status-dot" />{network.connection === 'online' ? 'Máy chủ kết nối' : network.connection === 'connecting' ? 'Đang kết nối' : 'Chưa kết nối'}</Link><button className="icon-button sound-toggle" onClick={() => update({ effectsMuted: !preferences.effectsMuted })} aria-label={preferences.effectsMuted ? 'Bật hiệu ứng âm thanh' : 'Tắt hiệu ứng âm thanh'} aria-pressed={preferences.effectsMuted}>{preferences.effectsMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}</button><Link to="/connection" className="guest-profile"><span className="guest-avatar"><UserRound size={18} /></span><span>Khách<small>Bản phát triển</small></span><ChevronRight size={14} /></Link></div></header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="footer"><span>© 2026 TlinhGame</span><span>Chơi theo cách của bạn.</span><Link to="/connection">Bản phát triển · Bộ khung kết nối</Link></footer>
    </div>
    <nav className="mobile-nav" aria-label="Điều hướng điện thoại">{[...navItems, { to: '/settings', label: 'Cài đặt', icon: Settings2 }].map(({ to, label, icon: Icon }) => <NavLink to={to} end={to === '/'} key={to} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={20} /><span>{label}</span></NavLink>)}</nav>
  </div>;
}
