import React, { useState, useEffect } from 'react';
import { UserCircle2, Mail, Lock, LogIn, Link as LinkIcon, HelpCircle, RefreshCw, ArrowRight, Shield, LogOut, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuthFlow, AuthMode } from '../hooks/useAuthFlow';

interface AuthLabProps {
  authInstance: any;
  initialMode?: AuthMode;
}

export const AuthLab: React.FC<AuthLabProps> = ({ authInstance, initialMode = 'login' }) => {
  const { user, mode, setMode, status, message, login, linkAccount, resetPass, logout } = useAuthFlow(authInstance, initialMode as AuthMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sync mode prop if it changes dynamically from AI
  useEffect(() => {
    setMode(initialMode as AuthMode);
  }, [initialMode]);

  if (!authInstance) return <div className="p-4 text-center text-slate-500">Auth no inicializado.</div>;

  const handleSubmit = () => {
    if (mode === 'login') login(email, password);
    else if (mode === 'link') linkAccount(email, password);
    else if (mode === 'reset') resetPass(email);
  };

  // 1. Authenticated Permanent User View
  if (user && !user.isAnonymous) {
    return (
      <div className="bg-white p-8 rounded-xl border border-green-200 text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Sesión Segura Activa</h3>
        <p className="text-slate-600 mb-6">{user.email}</p>
        <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium">
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // 2. Forms View
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50">
         <button onClick={() => setMode('login')} className={`flex-1 py-3 text-sm font-medium ${mode === 'login' ? 'text-blue-600 border-b-2 border-blue-500 bg-white' : 'text-slate-500'}`}>Login</button>
         <button onClick={() => setMode('link')} className={`flex-1 py-3 text-sm font-medium ${mode === 'link' ? 'text-orange-600 border-b-2 border-orange-500 bg-white' : 'text-slate-500'}`}>Vincular</button>
         <button onClick={() => setMode('reset')} className={`flex-1 py-3 text-sm font-medium ${mode === 'reset' ? 'text-purple-600 border-b-2 border-purple-500 bg-white' : 'text-slate-500'}`}>Recuperar</button>
      </div>

      <div className="p-6 space-y-4">
        <div className="text-center mb-4">
           {mode === 'login' && <h3 className="font-bold text-slate-800">Acceder a cuenta</h3>}
           {mode === 'link' && <h3 className="font-bold text-slate-800">Guardar progreso actual</h3>}
           {mode === 'reset' && <h3 className="font-bold text-slate-800">Restablecer contraseña</h3>}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          
          {mode !== 'reset' && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}

          <button 
            onClick={handleSubmit} 
            disabled={status === 'loading'}
            className={`w-full py-3 text-white font-bold rounded-lg shadow-md transition-all flex justify-center items-center gap-2 ${
              mode === 'link' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'loading' ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
            {mode === 'login' ? 'Entrar' : mode === 'link' ? 'Vincular' : 'Enviar'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {status === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {message}
          </div>
        )}
      </div>
    </div>
  );
};