export declare const CATEGORIES: readonly ["Tất cả", "Sinh tồn", "Đua xe", "Đối kháng", "Thể thao", "Trí tuệ"];
export type Category = (typeof CATEGORIES)[number];
export interface GameDefinition {
    id: string;
    name: string;
    category: Exclude<Category, 'Tất cả'>;
    minPlayers: number;
    maxPlayers: number;
    summary: string;
    rules: string;
    controls: string;
    duration: string;
    artwork: 'ice' | 'kart' | 'lava' | 'sword' | 'ball' | 'chess';
    priority: 'first' | 'later';
    status: 'planned';
}
export declare const GAME_CATALOG: readonly GameDefinition[];
