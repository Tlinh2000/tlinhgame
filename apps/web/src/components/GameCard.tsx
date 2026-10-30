import { Link } from 'react-router-dom';
import { ArrowUpRight, Users, Clock3, Snowflake, Flag, Flame, Swords, CircleDot, Crown } from 'lucide-react';
import type { GameDefinition } from '@tlinhgame/shared';

const icons = { ice: Snowflake, kart: Flag, lava: Flame, sword: Swords, ball: CircleDot, chess: Crown };
export function GameArt({ game, large = false }: { game: GameDefinition; large?: boolean }) {
  const Icon = icons[game.artwork];
  return <div className={`game-art art-${game.artwork} ${large ? 'large' : ''}`} aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-grid" /><div className="art-platform" /><Icon className="art-icon" strokeWidth={1.2} /><span className="art-word">{game.artwork === 'ice' ? 'ICE' : game.artwork === 'kart' ? 'RACE' : game.artwork === 'sword' ? 'DUEL' : game.category === 'Thể thao' ? 'PLAY' : 'ARENA'}</span><span className="art-number">{game.priority === 'first' ? 'ĐỢT ĐẦU' : 'LỘ TRÌNH'}</span></div>;
}
export function GameCard({ game }: { game: GameDefinition }) {
  return <Link to={`/games/${game.id}`} className="game-card"><div className="game-art-wrap"><GameArt game={game} /><span className="game-badge">{game.category}</span><span className="card-launch"><ArrowUpRight size={20} /></span></div><div className="game-card-body"><div className="game-card-heading"><h3>{game.name}</h3><span className={`development-tag ${game.priority === 'first' ? 'priority' : ''}`}>{game.priority === 'first' ? 'Ưu tiên' : 'Dự kiến'}</span></div><p>{game.summary}</p><div className="game-card-meta"><span><Users size={14} />{game.minPlayers === game.maxPlayers ? game.maxPlayers : `${game.minPlayers}–${game.maxPlayers}`} người</span><span><Clock3 size={14} />{game.duration}</span></div></div></Link>;
}
