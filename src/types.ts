export interface Car {
  id: string;
  name: string;
  color: string;
  sales: number;
  updatedAt: number;
}

export interface Report {
  id: string;
  weekName: string;
  date: number;
  goal: number;
  results: {
    name: string;
    sales: number;
    color: string;
  }[];
}

export const DEFAULT_TRACK_SLOTS = 30;
export const COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#4CD964', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF2D55', // Pink
  '#AF52DE', // Violet
  '#FFD700', // Gold (changed from #FFCC00)
  '#8E8E93', // Gray
  '#C69C6D', // Tan
  '#FF375F', // Rose
  '#30D158', // Mint
  '#64D2FF', // Sky
  '#BF5AF2', // Lavender
  '#FF9F0A', // Amber
  '#FF453A', // Coral
  '#0A84FF', // Royal Blue
  '#32D74B', // Emerald
  '#FFD60A', // Lemon
  '#66D4CF', // Teal
  '#D81B60', // Magenta (changed from #FF375F)
  '#AC8E68', // Bronze
  '#5E5CE6', // Indigo
  '#DC143C', // Crimson (changed from #FF2D55)
  '#7D7D7D', // Slate
  '#E5E5EA', // Silver
  '#1C1C1E', // Dark
  '#F2F2F7', // Off-White
];
