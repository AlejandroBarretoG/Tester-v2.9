import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { initFirebase, testRealAuthConnection, FirebaseApp } from './services/firebase';
import { CommandPalette } from './components/CommandPalette';
import { DevNexusCanvas } from './components/DevNexusCanvas';
import { ModulesLab } from './components/ModulesLab';
import { useDevNexus } from './hooks/useDevNexus';
import { Settings, Cpu, Layers, Box, LayoutGrid } from 'lucide-react';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyB9IR6S_XDeHdqWQUsfwNE55S7LazuflOw",
  authDomain: "conexion-tester-suite.firebaseapp.com",
  projectId: "conexion-tester-suite",
  storageBucket: "conexion-tester-suite.firebasestorage.app",
  messagingSenderId: "1085453980210",
  appId: "1:1085453980210:web:3001b7acdea2d0c0e5a22b"
};

const DevNexusApp = () => {
  // 1. Core State
  const [firebaseInstance, setFirebaseInstance] = useState<FirebaseApp | null>(null);
  const [realAuthInstance, setRealAuthInstance] = useState<any>(null);
  const [geminiKey, setGeminiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  
  // 2. Intent Hook (The Brain)
  const { nexusState, activeModule, moduleConfig, feedback, executeCommand } = useDevNexus();

  const navigate = useNavigate();
  const location = useLocation();

  // 3. Auto-Init Effect
  useEffect(() => {
    const boot = async () => {
      // Auto-connect Firebase
      const savedConfig = localStorage.getItem('firebase_config_input') || JSON.stringify(DEFAULT_FIREBASE_CONFIG);
      try {
        const config = JSON.parse(savedConfig);
        const result = await testRealAuthConnection(config);
        if (result.success) {
          setFirebaseInstance(result.app as any);
          setRealAuthInstance(result.auth);
        }
      } catch (e) {
        console.error("Boot Error:", e);
      }
    };
    boot();
  }, []);

  const handleCommand = (prompt: string) => {
    if (!geminiKey) {
      alert("Por favor configura tu Gemini API Key en Ajustes (Settings) primero.");
      return;
    }
    executeCommand(prompt, geminiKey);
  };

  const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isActive 
          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden flex flex-col">
      
      {/* BACKGROUND MESH */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px]"></div>
      </div>

      {/* HEADER / TOP BAR */}
      <header className="relative z-10 h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight hidden sm:block">DevNexus <span className="text-xs font-mono text-indigo-400 font-normal ml-1">OS v3.1</span></h1>
          </div>
          
          {/* Main Navigation */}
          <nav className="flex items-center gap-1">
             <NavItem to="/" icon={<LayoutGrid size={16}/>} label="Canvas" />
             <NavItem to="/modules" icon={<Box size={16}/>} label="Modules Lab" />
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Feedback Status (Only visible on Canvas) */}
           {location.pathname === '/' && (
             <div className={`text-xs font-mono px-3 py-1 rounded-full border flex items-center gap-2 transition-all hidden md:flex ${
               nexusState === 'analyzing' || nexusState === 'assembling' 
                 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                 : nexusState === 'error' 
                   ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                   : 'bg-slate-800 border-slate-700 text-slate-500'
             }`}>
               <div className={`w-2 h-2 rounded-full ${nexusState === 'analyzing' ? 'bg-indigo-400 animate-ping' : nexusState==='ready' ? 'bg-green-400' : 'bg-slate-600'}`}></div>
               {feedback}
             </div>
           )}

           {/* Settings Trigger */}
           <button 
             onClick={() => {
               const key = prompt("Ingresa tu Gemini API Key:", geminiKey);
               if (key) {
                 setGeminiKey(key);
                 localStorage.setItem('gemini_api_key', key);
               }
             }}
             className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
             title="Configurar API Key"
           >
             <Settings size={20} />
           </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="relative z-10 flex-1 flex flex-col p-6 gap-6 max-w-7xl mx-auto w-full h-[calc(100vh-64px)]">
        <Routes>
          <Route path="/" element={
            <>
              {/* 1. COMMAND CENTER (Top) */}
              <div className="w-full shrink-0">
                <div className="flex flex-col items-center justify-center py-4">
                   <CommandPalette 
                     onExecute={handleCommand} 
                     isProcessing={nexusState === 'analyzing' || nexusState === 'assembling'} 
                   />
                </div>
              </div>

              {/* 2. DYNAMIC CANVAS (Center/Bottom) */}
              <div className="flex-1 min-h-0 relative">
                <DevNexusCanvas 
                  activeModule={activeModule} 
                  moduleConfig={moduleConfig}
                  firebaseInstance={firebaseInstance}
                  realAuthInstance={realAuthInstance}
                />
              </div>
            </>
          } />
          
          <Route path="/modules" element={
            <ModulesLab apiKey={geminiKey} />
          } />
        </Routes>
      </main>
    </div>
  );
};

// Router Wrapper
const App = () => {
  return (
    <Router>
      <DevNexusApp />
    </Router>
  );
};

export default App;