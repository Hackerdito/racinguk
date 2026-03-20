import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Trophy, User, Palette, UserPlus, ShieldCheck } from 'lucide-react';
import { Car, COLORS, TRACK_SLOTS } from './types';
import { db, auth } from './firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

interface AdminPanelProps {
  cars: Car[];
  onAddCar: (name: string, color: string) => void;
  onUpdateSales: (id: string, sales: number) => void;
  onDeleteCar: (id: string) => void;
  isMainAdmin: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ cars, onAddCar, onUpdateSales, onDeleteCar, isMainAdmin }) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  
  // Admin Management State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  useEffect(() => {
    if (isMainAdmin) {
      const unsubscribe = onSnapshot(collection(db, 'admins'), (snapshot) => {
        const adminData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdminUser[];
        setAdmins(adminData);
      });
      return () => unsubscribe();
    }
  }, [isMainAdmin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddCar(newName.trim(), newColor);
      setNewName('');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsAdminLoading(true);

    try {
      // We use a secondary app instance to create the user without signing out the current main admin
      const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAdminEmail, newAdminPassword);
      const user = userCredential.user;

      // Add to admins collection
      await setDoc(doc(db, 'admins', user.uid), {
        email: newAdminEmail,
        role: 'admin'
      });

      setNewAdminEmail('');
      setNewAdminPassword('');
      alert('Admin creado exitosamente');
    } catch (err: any) {
      console.error(err);
      setAdminError(err.message);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este administrador?')) {
      try {
        await deleteDoc(doc(db, 'admins', id));
      } catch (err: any) {
        setAdminError(err.message);
      }
    }
  };

  return (
    <div className="space-y-12">
      {/* Admin Management (Only for Main Admin) */}
      {isMainAdmin && (
        <section className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase italic">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              Gestión de Administradores
            </h3>
          </div>

          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 ml-1">Email Nuevo Admin</label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                placeholder="email@ejemplo.com"
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 ml-1">Contraseña</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAdminLoading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isAdminLoading ? 'Creando...' : 'Crear Admin'}
            </button>
            {adminError && <p className="col-span-full text-red-500 text-[10px] font-bold uppercase mt-2">{adminError}</p>}
          </form>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Administradores Actuales</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="text-sm font-bold text-zinc-700">{admin.email}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {admins.length === 0 && <p className="text-zinc-400 text-xs italic p-4">No hay administradores adicionales.</p>}
            </div>
          </div>
        </section>
      )}

      {/* Add New Car */}
      <section className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase italic mb-6">
          <Plus className="w-6 h-6 text-indigo-600" />
          Agregar Nuevo Corredor
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Nombre del Vendedor</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Color del Auto</label>
              <div className="grid grid-cols-10 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${newColor === color ? 'border-zinc-900 scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-12 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
          >
            Agregar Corredor
          </button>
        </form>
      </section>

      {/* Manage Cars */}
      <section className="space-y-6">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase italic">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Control de Carrera
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col gap-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: car.color }} />
                  <span className="font-black text-zinc-900 uppercase italic tracking-tight">{car.name}</span>
                </div>
                <button 
                  onClick={() => onDeleteCar(car.id)}
                  className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Ventas: {car.sales}</span>
                  <span>Meta: {TRACK_SLOTS}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={TRACK_SLOTS}
                  value={car.sales}
                  onChange={(e) => onUpdateSales(car.id, parseInt(e.target.value))}
                  className="w-full h-3 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onUpdateSales(car.id, Math.max(0, car.sales - 1))}
                    className="py-3 bg-zinc-100 text-zinc-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors"
                  >
                    -1
                  </button>
                  <button 
                    onClick={() => onUpdateSales(car.id, Math.min(TRACK_SLOTS, car.sales + 1))}
                    className="py-3 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors shadow-md"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cars.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-[32px] border border-dashed border-zinc-300">
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No hay corredores registrados.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
