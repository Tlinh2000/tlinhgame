import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, Users, Clock3, Gamepad2, LockKeyhole } from 'lucide-react';
import { CATEGORIES, GAME_CATALOG } from '@tlinhgame/shared';
import { GameArt, GameCard } from '../components/GameCard';

function normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd'); }
export function GameLibraryPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? 'Tất cả';
  const update = (key: string, value: string) => setParams(previous => { const next = new URLSearchParams(previous); if (value && value !== 'Tất cả') next.set(key, value); else next.delete(key); return next; }, { replace: true });
  const games = GAME_CATALOG.filter(game => (category === 'Tất cả' || game.category === category) && normalize(`${game.name} ${game.category} ${game.summary}`).includes(normalize(query)));
  return <div className="page"><div className="page-intro"><span className="section-overline">TÌM CUỘC CHƠI PHÙ HỢP</span><h1>Thư viện game<span className="heading-dot">.</span></h1><p>Những thể loại đang được lên kế hoạch cho TlinhGame. Ice Arena và Kart Racing được ưu tiên phát triển trước.</p></div><div className="library-toolbar"><div className="category-tabs" aria-label="Thể loại">{CATEGORIES.map(item => <button key={item} onClick={() => update('category', item)} className={category === item ? 'selected' : ''} aria-pressed={category === item}>{item}</button>)}</div><label className="library-search"><Search size={17} /><input aria-label="Lọc danh sách game" value={query} onChange={event => update('q', event.target.value)} placeholder="Tìm tên game..." /></label></div><div className="library-count"><span>{games.length} trò chơi trong lộ trình</span><span>Chưa mở thi đấu</span></div>{games.length > 0 ? <div className="game-grid library-grid">{games.map(game => <GameCard game={game} key={game.id} />)}</div> : <div className="empty-state"><Search size={32} /><h2>Chưa tìm thấy trò chơi</h2><p>Thử một tên khác hoặc xóa bộ lọc.</p><button className="button secondary" onClick={() => setParams({})}>Xóa bộ lọc</button></div>}</div>;
}
export function GameDetailsPage() {
  const { gameId } = useParams();
  const game = GAME_CATALOG.find(item => item.id === gameId);
  if (!game) return <div className="page empty-state"><h1>Không tìm thấy game</h1><Link className="button secondary" to="/games">Về thư viện</Link></div>;
  return <div className="page"><Link className="back-link" to="/games"><ArrowLeft size={16} />Về thư viện game</Link><div className="game-details"><GameArt game={game} large /><div className="game-details-copy"><span className="section-overline">{game.category.toUpperCase()} · TRONG LỘ TRÌNH</span><h1>{game.name}</h1><p className="detail-summary">{game.summary}</p><div className="detail-stats"><span><Users size={18} />{game.minPlayers === game.maxPlayers ? game.maxPlayers : `${game.minPlayers}–${game.maxPlayers}`} người</span><span><Clock3 size={18} />{game.duration}</span></div><div className="notice"><LockKeyhole size={19} /><p><strong>Chưa mở thi đấu</strong>Phần 2.1 mới có bộ khung. Game này chưa có mô phỏng trận đấu và chưa được kiểm thử online.</p></div><Link className="button secondary" to="/connection">Kiểm tra kết nối máy chủ <ArrowLeft className="arrow-right" size={16} /></Link></div></div><div className="rules-grid"><section className="panel"><h2>Luật chơi dự kiến</h2><p>{game.rules}</p></section><section className="panel"><h2><Gamepad2 size={20} />Điều khiển dự kiến</h2><p>{game.controls}</p></section></div></div>;
}
