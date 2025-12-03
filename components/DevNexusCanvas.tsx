import React from 'react';
import { AuthLab } from './AuthLab';
import { FirestoreAdmin } from './FirestoreAdmin';
import { VoiceLab } from './VoiceLab';
import { SynthLab } from './SynthLab';
import { StatusCard } from './StatusCard';
import { Layout, Cpu } from 'lucide-react';

interface DevNexusCanvasProps {
  activeModule: string | null;
  moduleConfig: any;
  firebaseInstance: any;
  realAuthInstance: any;
}

export const DevNexusCanvas: React.FC<DevNexusCanvasProps> = ({ activeModule, moduleConfig, firebaseInstance, realAuthInstance }) => {
  
  if (!activeModule) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40">
        <Cpu size={64} className="mb-4 text-slate-700" strokeWidth={1} />
        <h2 className="text-xl font-light">Esperando Intención...</h2>
        <p className="text-sm">Usa la barra de comandos para invocar un módulo.</p>
      </div>
    );
  }

  // Dynamic Routing based on Intent ID
  const renderModule = () => {
    switch (activeModule) {
      case 'AUTH_SYSTEM':
        return <AuthLab authInstance={realAuthInstance} initialMode={moduleConfig.initialMode} />;
      
      case 'DB_ADMIN':
        return <FirestoreAdmin firebaseInstance={firebaseInstance} initialCollection={moduleConfig.initialCollection} />;
      
      case 'VOICE_AGENT':
        // VoiceLab would need a small refactor to accept initialPersonality prop too, 
        // but for now we render it as is.
        return <VoiceLab />;
        
      case 'AUDIO_SYNTH':
        return <SynthLab />;
        
      default:
        return (
          <div className="p-12 text-center">
            <h3 className="text-xl font-bold text-red-400">Módulo No Encontrado</h3>
            <p className="text-slate-400">ID: {activeModule}</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl h-full overflow-hidden flex flex-col relative">
        {/* Window Controls Decor */}
        <div className="h-8 bg-black/20 border-b border-white/5 flex items-center px-4 gap-2">
           <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
           <span className="ml-4 text-xs font-mono text-slate-500 flex items-center gap-2">
             <Layout size={10} /> {activeModule}
           </span>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-100 text-slate-900 relative">
           {renderModule()}
        </div>
      </div>
    </div>
  );
};