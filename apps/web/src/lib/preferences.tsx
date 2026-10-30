import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AudioManager } from './AudioManager';

export interface Preferences {
  quality: 'low' | 'high';
  reducedMotion: boolean;
  effectsVolume: number;
  effectsMuted: boolean;
}
const STORAGE_KEY = 'tlinhgame.preferences.v1';
function defaults(): Preferences {
  return { quality: 'high', reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches, effectsVolume: 0.4, effectsMuted: false };
}
function loadPreferences(): Preferences {
  const fallback = defaults();
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return fallback;
    const v = value as Record<string, unknown>;
    return {
      quality: v.quality === 'low' ? 'low' : 'high',
      reducedMotion: typeof v.reducedMotion === 'boolean' ? v.reducedMotion : fallback.reducedMotion,
      effectsVolume: typeof v.effectsVolume === 'number' && Number.isFinite(v.effectsVolume) ? Math.max(0, Math.min(1, v.effectsVolume)) : fallback.effectsVolume,
      effectsMuted: typeof v.effectsMuted === 'boolean' ? v.effectsMuted : false,
    };
  } catch { return fallback; }
}
interface PreferencesContextValue {
  preferences: Preferences;
  update: (patch: Partial<Preferences>) => void;
  reset: () => void;
  playTestSound: () => Promise<void>;
}
const Context = createContext<PreferencesContextValue | null>(null);
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const audio = useRef<AudioManager | null>(null);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); } catch { /* Cài đặt vẫn có hiệu lực trong phiên nếu trình duyệt chặn lưu. */ }
    document.documentElement.dataset.reducedMotion = String(preferences.reducedMotion);
  }, [preferences]);
  useEffect(() => () => { audio.current?.dispose(); audio.current = null; }, []);
  return <Context.Provider value={{
    preferences,
    update: patch => setPreferences(current => ({ ...current, ...patch })),
    reset: () => setPreferences(defaults()),
    playTestSound: async () => { audio.current ??= new AudioManager(); await audio.current.playTest(preferences.effectsVolume, preferences.effectsMuted); },
  }}>{children}</Context.Provider>;
}
export function usePreferences(): PreferencesContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('Thiếu PreferencesProvider');
  return context;
}
