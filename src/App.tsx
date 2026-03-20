import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { RaceTrack } from './RaceTrack';
import { AdminPanel } from './AdminPanel';
import { Leaderboard } from './Leaderboard';
import { Car, COLORS } from './types';
import { Trophy, Settings, LayoutDashboard, LogIn, LogOut, AlertCircle, ChevronRight, User, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, loginWithGoogle, logout, signInWithEmailAndPassword } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Error Boundary / Error Display Component
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 p-4 rounded-xl shadow-lg flex items-center gap-3 z-[100] animate-in slide-in-from-right">
    <AlertCircle className="w-5 h-5 text-red-500" />
    <div className="text-sm text-red-800 font-medium">{message}</div>
  </div>
);

// --- MAIN RACE VIEW COMPONENT ---
const RaceView = ({ cars }: { cars: Car[] }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Main Track Area */}
      <div className="flex-[2] space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-5xl font-black tracking-tighter text-zinc-900 uppercase italic">Circuito de ventas</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Cada venta es un paso hacia la meta de 30.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Líder Actual</span>
              <span className="font-black text-xl tracking-tight uppercase italic">
                {cars.length > 0 ? [...cars].sort((a, b) => b.sales - a.sales)[0].name : '---'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-400 shadow-inner">
              <Trophy className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        <RaceTrack cars={cars} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Ventas Equipo</h4>
            <div className="text-4xl font-black italic">{cars.reduce((acc, car) => acc + car.sales, 0)}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Promedio por Vendedor</h4>
            <div className="text-4xl font-black italic">
              {cars.length > 0 ? (cars.reduce((acc, car) => acc + car.sales, 0) / cars.length).toFixed(1) : 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Corredores Activos</h4>
            <div className="text-4xl font-black italic">{cars.length}</div>
          </div>
        </div>
      </div>

      {/* Sidebar Leaderboard */}
      <div className="flex-1 lg:max-w-sm">
        <Leaderboard cars={cars} />
      </div>
    </div>
  );
};

// --- LOGIN VIEW COMPONENT ---
const LoginView = ({ user, handleLogin, handleLogout, handleEmailLogin }: { 
  user: FirebaseUser | null; 
  handleLogin: () => void; 
  handleLogout: () => void;
  handleEmailLogin: (e: string, p: string) => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmailLogin(email, password);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-[40px] border border-zinc-200 shadow-2xl text-center space-y-8">
        <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Settings className="w-10 h-10 text-yellow-400" />
        </div>
        
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Admin Access</h2>
          <p className="text-zinc-500 font-medium text-sm mt-2">Gestiona la carrera y actualiza los resultados.</p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
              {user.photoURL && <img src={user.photoURL} alt={user.displayName || ''} className="w-12 h-12 rounded-full border border-white shadow-sm" />}
              <div className="text-left">
                <div className="font-bold text-zinc-900">{user.displayName || user.email}</div>
                <div className="text-xs text-zinc-500 font-medium">{user.email}</div>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin')}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg"
            >
              Ir al Panel de Control
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={onEmailSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="admin@ukracing.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
              >
                Ingresar
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase font-bold text-zinc-400"><span className="bg-white px-2">O</span></div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-4 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all shadow-sm"
            >
              <LogIn className="w-6 h-6" />
              Google (Solo Principal)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if authorized (main admin or in admins collection)
        if (currentUser.email === 'gerito.diseno@gmail.com') {
          setIsAuthorized(true);
        } else {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          setIsAuthorized(adminDoc.exists());
        }
      } else {
        setIsAuthorized(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Listener
  useEffect(() => {
    // Fixed order: as they were added (createdAt asc)
    const q = query(collection(db, 'cars'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const carsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Car[];
      setCars(carsData);
      setError(null);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError("Error al sincronizar datos. Verifica tu conexión.");
    });

    return () => unsubscribe();
  }, []);

  const handleAddCar = async (name: string, color: string) => {
    try {
      await addDoc(collection(db, 'cars'), {
        name,
        color,
        sales: 0,
        updatedAt: Date.now(),
        createdAt: Date.now(), // Fixed order field
      });
    } catch (err) {
      setError("No tienes permisos para agregar corredores.");
    }
  };

  const handleUpdateSales = async (id: string, sales: number) => {
    try {
      const carRef = doc(db, 'cars', id);
      await updateDoc(carRef, {
        sales,
        updatedAt: Date.now(),
      });
    } catch (err) {
      setError("No tienes permisos para actualizar ventas.");
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este corredor?')) {
      try {
        await deleteDoc(doc(db, 'cars', id));
      } catch (err) {
        setError("No tienes permisos para eliminar corredores.");
      }
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Error al iniciar sesión con Google.");
    }
  };

  const handleEmailLogin = async (e: string, p: string) => {
    try {
      await signInWithEmailAndPassword(auth, e, p);
    } catch (err: any) {
      setError("Error de login: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError("Error al cerrar sesión.");
    }
  };

  const isMainAdmin = user?.email === 'gerito.diseno@gmail.com';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
          <div className="text-zinc-400 font-mono tracking-widest uppercase text-xs">Cargando Carrera...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
        {error && <ErrorDisplay message={error} />}

        {/* Header */}
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-zinc-900 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">Uk Racing</h1>
            </Link>

            <nav className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-zinc-500 hover:bg-zinc-100 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Pista
              </Link>
              
              {isAuthorized ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-zinc-900 text-white transition-all shadow-md"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<RaceView cars={cars} />} />
            <Route path="/login" element={<LoginView user={user} handleLogin={handleLogin} handleLogout={handleLogout} handleEmailLogin={handleEmailLogin} />} />
            <Route 
              path="/admin" 
              element={
                isAuthorized ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-black tracking-tight text-zinc-900 uppercase italic">Panel de Control</h2>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Gestiona los corredores y actualiza los resultados.</p>
                    </div>
                    <AdminPanel
                      cars={cars}
                      onAddCar={handleAddCar}
                      onUpdateSales={handleUpdateSales}
                      onDeleteCar={handleDeleteCar}
                      isMainAdmin={isMainAdmin}
                    />
                  </motion.div>
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-zinc-200 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-400 text-sm font-medium">
            <p>© 2026 Uk Racing App. Datos sincronizados en tiempo real con Firebase.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-zinc-900 transition-colors">Términos</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">Soporte</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
