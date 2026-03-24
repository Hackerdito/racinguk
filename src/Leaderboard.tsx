import React from 'react';
import { Car } from './types';
import { Trophy, Medal, TrendingUp } from 'lucide-react';

interface LeaderboardProps {
  cars: Car[];
  goal: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ cars, goal }) => {
  const sortedCars = [...cars].sort((a, b) => b.sales - a.sales);

  return (
    <div className="bg-white rounded-[32px] border border-zinc-200 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 bg-zinc-900 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Leaderboard</h2>
        </div>
        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Live Standings</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedCars.map((car, index) => (
          <div 
            key={car.id} 
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              index === 0 ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-zinc-50 border-zinc-100'
            }`}
          >
            {/* Rank */}
            <div className="flex flex-col items-center justify-center w-8">
              {index === 0 ? (
                <Medal className="w-6 h-6 text-yellow-500" />
              ) : (
                <span className="text-lg font-black text-zinc-400">#{index + 1}</span>
              )}
            </div>

            {/* Car Color Dot */}
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: car.color }} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-zinc-900 truncate">{car.name}</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase">
                <TrendingUp className="w-3 h-3" />
                {car.sales} / {goal} Ventas
              </div>
            </div>

            {/* Progress % */}
            <div className="text-right">
              <div className="text-xs font-black text-zinc-900">
                {Math.round((car.sales / goal) * 100)}%
              </div>
              <div className="w-12 h-1 bg-zinc-200 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (car.sales / goal) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        ))}

        {cars.length === 0 && (
          <div className="h-40 flex flex-col items-center justify-center text-zinc-400 italic gap-2">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 opacity-20" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">No hay corredores</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Meta: {goal} Ventas
        </div>
      </div>
    </div>
  );
};
