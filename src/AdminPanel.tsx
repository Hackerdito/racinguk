import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Trophy, User, Palette, UserPlus, ShieldCheck, Download, Calendar, Flag } from 'lucide-react';
import { Car, COLORS, DEFAULT_TRACK_SLOTS, Report } from './types';
import { db, auth } from './firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

interface AdminPanelProps {
  cars: Car[];
  goal: number;
  onAddCar: (name: string, color: string) => void;
  onUpdateSales: (id: string, sales: number) => void;
  onDeleteCar: (id: string) => void;
  onUpdateGoal: (goal: number) => void;
  onCutoff: (weekName: string) => void;
  isMainAdmin: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ cars, goal, onAddCar, onUpdateSales, onDeleteCar, onUpdateGoal, onCutoff, isMainAdmin }) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newGoal, setNewGoal] = useState(goal.toString());
  const [weekName, setWeekName] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  
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

  useEffect(() => {
    setNewGoal(goal.toString());
  }, [goal]);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportsData);
    });
    return () => unsubscribe();
  }, []);

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

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedGoal = parseInt(newGoal);
    if (!isNaN(parsedGoal) && parsedGoal > 0) {
      onUpdateGoal(parsedGoal);
      alert('Meta actualizada correctamente');
    }
  };

  const handleCutoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weekName.trim()) {
      if (confirm(`¿Estás seguro de generar el corte para "${weekName}"? Esto reiniciará las ventas de todos los corredores a 0.`)) {
        onCutoff(weekName.trim());
        setWeekName('');
      }
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este reporte? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'reports', id));
      } catch (err) {
        alert('Error al eliminar el reporte.');
      }
    }
  };

  const downloadCSV = (report: Report) => {
    const headers = ['Posición', 'Corredor', 'Ventas', 'Meta', 'Porcentaje'];
    const rows = report.results
      .sort((a, b) => b.sales - a.sales)
      .map((r, i) => [
        i + 1,
        r.name,
        r.sales,
        report.goal,
        `${Math.round((r.sales / report.goal) * 100)}%`
      ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_${report.weekName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Configuración de la Carrera y Corte Semanal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meta */}
        <section className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase italic mb-6">
            <Flag className="w-6 h-6 text-indigo-600" />
            Configuración de Meta
          </h3>
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Meta de Ventas (Casillas)</label>
              <input
                type="number"
                min="1"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
            >
              Actualizar Meta
            </button>
          </form>
        </section>

        {/* Corte Semanal */}
        <section className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase italic mb-6">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Corte Semanal
          </h3>
          <form onSubmit={handleCutoffSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Nombre de la Semana</label>
              <input
                type="text"
                value={weekName}
                onChange={(e) => setWeekName(e.target.value)}
                placeholder="Ej: Semana 1 - Marzo"
                required
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
            >
              Generar Corte y Reiniciar
            </button>
          </form>
        </section>
      </div>

      {/* Reportes */}
      <section className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase italic mb-6">
          <Download className="w-6 h-6 text-indigo-600" />
          Reportes Semanales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="p-5 border border-zinc-200 rounded-2xl flex items-center justify-between bg-zinc-50">
              <div>
                <h4 className="font-bold text-zinc-900">{report.weekName}</h4>
                <p className="text-xs text-zinc-500">{new Date(report.date).toLocaleDateString()} • Meta: {report.goal}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadCSV(report)}
                  className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
                  title="Descargar Excel (CSV)"
                >
                  <Download className="w-5 h-5" />
                </button>
                {isMainAdmin && (
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-300 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                    title="Eliminar Reporte"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="col-span-full py-8 text-center text-zinc-400 text-sm font-medium italic">
              No hay reportes generados aún.
            </div>
          )}
        </div>
      </section>

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
                  <span>Meta: {goal}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={goal}
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
                    onClick={() => onUpdateSales(car.id, Math.min(goal, car.sales + 1))}
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
