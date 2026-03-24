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
  '#FFCC00', // Gold
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
  '#FF375F', // Magenta
  '#AC8E68', // Bronze
  '#5E5CE6', // Indigo
  '#FF2D55', // Crimson
  '#7D7D7D', // Slate
  '#E5E5EA', // Silver
  '#1C1C1E', // Dark
  '#F2F2F7', // Off-White
];
