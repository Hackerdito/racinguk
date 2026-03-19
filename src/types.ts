export interface Car {
  id: string;
  name: string;
  color: string;
  sales: number; // 0 to 30
  updatedAt: number;
}

export const TRACK_SLOTS = 30;
export const COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#4CD964', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF2D55', // Pink
];
