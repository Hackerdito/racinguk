import React, { useState } from 'react';
import { Plus, Trash2, Trophy, User, Palette } from 'lucide-react';
import { Car, COLORS, TRACK_SLOTS } from './types';

interface AdminPanelProps {
  cars: Car[];
  onAddCar: (name: string, color: string) => void;
  onUpdateSales: (id: string, sales: number) => void;
  onDeleteCar: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ cars, onAddCar, onUpdateSales, onDeleteCar }) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddCar(newName.trim(), newColor);
      setNewName('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Car */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          Agregar Nuevo Corredor
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nombre del Vendedor</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Color del Auto</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${newColor === color ? 'border-zinc-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            Agregar
          </button>
        </form>
      </section>

      {/* Manage Cars */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Control de Carrera
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <div key={car.id} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: car.color }} />
                  <span className="font-bold text-zinc-900">{car.name}</span>
                </div>
                <button 
                  onClick={() => onDeleteCar(car.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                  <span>Ventas: {car.sales}</span>
                  <span>Meta: {TRACK_SLOTS}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={TRACK_SLOTS}
                  value={car.sales}
                  onChange={(e) => onUpdateSales(car.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdateSales(car.id, Math.max(0, car.sales - 1))}
                    className="flex-1 py-1 bg-zinc-100 text-zinc-600 rounded-lg font-bold text-sm hover:bg-zinc-200"
                  >
                    -1
                  </button>
                  <button 
                    onClick={() => onUpdateSales(car.id, Math.min(TRACK_SLOTS, car.sales + 1))}
                    className="flex-1 py-1 bg-zinc-900 text-white rounded-lg font-bold text-sm hover:bg-zinc-800"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
