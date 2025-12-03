import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Shield, Database, Mic, Music, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  onExecute: (prompt: string) => void;
  isProcessing: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onExecute, isProcessing }) => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onExecute(input);
      setInput('');
    }
  };

  const PROMPTS = [
    { cat: 'Auth', icon: <Shield size={14}/>, label: 'Login Seguro', text: 'Generar sistema de Login seguro' },
    { cat: 'Data', icon: <Database size={14}/>, label: 'Admin Users', text: 'Crear panel de administración de users' },
    { cat: 'AI', icon: <Mic size={14}/>, label: 'Bot Sarcástico', text: 'Crear asistente virtual sarcástico' },
    { cat: 'Creative', icon: <Music size={14}/>, label: 'OST 8-Bits', text: 'Generar banda sonora 8-bits' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 relative z-50">
      
      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-75 blur transition duration-1000 group-hover:duration-200 ${isProcessing ? 'animate-pulse' : 'opacity-25'}`}></div>
        <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
          <div className="pl-4 text-slate-400">
            <Sparkles size={20} className={isProcessing ? "animate-spin text-indigo-400" : ""} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? "La IA está ensamblando tu interfaz..." : "¿Qué quieres construir hoy? (Ej: 'Crear panel de usuarios')"}
            className="w-full bg-transparent text-white p-4 outline-none placeholder:text-slate-500"
            autoFocus
          />
          <button 
            type="submit" 
            disabled={!input || isProcessing}
            className="mr-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-0 disabled:translate-x-4 transform duration-300"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </form>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Module Factory Chip */}
        <button
           onClick={() => navigate('/modules')}
           className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-800/50 border border-indigo-500/30 rounded-full text-xs text-indigo-200 transition-all hover:scale-105"
        >
           <span className="text-indigo-400"><Box size={14}/></span>
           Abrir Fábrica de Módulos
        </button>

        {PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => onExecute(p.text)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-all hover:scale-105 hover:border-indigo-500/50"
          >
            <span className={`${p.cat === 'Auth' ? 'text-green-400' : p.cat === 'Data' ? 'text-orange-400' : 'text-blue-400'}`}>
              {p.icon}
            </span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};