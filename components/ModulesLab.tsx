import React, { useState } from 'react';
import { Layers, Code2, Download, Play, Loader2, Copy, Check, FileCode, Box } from 'lucide-react';
import { generateModuleCode, GeneratedModule } from '../services/moduleGen';

interface ModulesLabProps {
  apiKey: string;
}

export const ModulesLab: React.FC<ModulesLabProps> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [moduleData, setModuleData] = useState<GeneratedModule | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!apiKey) {
      alert("Por favor configura tu API Key en los ajustes primero.");
      return;
    }

    setIsGenerating(true);
    setModuleData(null);

    try {
      const result = await generateModuleCode(apiKey, prompt);
      setModuleData(result);
      setActiveFileIndex(0);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!moduleData) return;
    const code = moduleData.files[activeFileIndex].code;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadAll = () => {
    if (!moduleData) return;
    // Simple approach: download each file individually
    moduleData.files.forEach(file => {
      downloadFile(file.name, file.code);
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* LEFT PANEL: INPUT */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 shadow-xl flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4 text-indigo-400">
             <Box size={24} />
             <h2 className="text-xl font-bold text-white">Fábrica de Módulos</h2>
          </div>
          
          <p className="text-slate-400 text-sm mb-6">
            Describe el componente o funcionalidad que necesitas. La IA generará la estructura de archivos, lógica y estilos.
          </p>

          <div className="flex-1 flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Una galería de imágenes con grid masonry y modal de vista previa..."
              className="w-full flex-1 bg-slate-800 border border-slate-600 rounded-lg p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
              disabled={isGenerating}
            />
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Play size={18} fill="currentColor" />}
              {isGenerating ? "Arquitectando..." : "Generar Módulo"}
            </button>
          </div>
        </div>

        {/* Status / History (Placeholder) */}
        {moduleData && (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Check size={16} />
              <span className="font-bold text-sm">Generación Exitosa</span>
            </div>
            <p className="text-green-200/60 text-xs">
              Módulo <strong>{moduleData.moduleName}</strong> listo para exportar.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: CODE VIEWER */}
      <div className="w-full md:w-2/3 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {moduleData ? (
          <>
            {/* Header / Tabs */}
            <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-2">
              <div className="flex overflow-x-auto custom-scrollbar">
                {moduleData.files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-mono border-r border-slate-800 transition-colors ${
                      activeFileIndex === idx 
                        ? 'bg-slate-800 text-indigo-400' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <FileCode size={14} />
                    {file.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pr-2">
                <button 
                  onClick={handleCopyCode}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Copiar código"
                >
                  {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
                </button>
                <button 
                  onClick={handleDownloadAll}
                  className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                  title="Descargar archivos"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 overflow-auto bg-[#0d1117] p-6 relative group">
              <pre className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                <code>{moduleData.files[activeFileIndex].code}</code>
              </pre>
            </div>
            
            {/* Footer Info */}
            <div className="bg-slate-900 border-t border-slate-800 p-2 px-4 text-xs text-slate-500 flex justify-between">
               <span>{moduleData.description}</span>
               <span>{moduleData.files[activeFileIndex].code.length} chars</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50">
            <Layers size={64} strokeWidth={1} className="mb-4" />
            <h3 className="text-xl font-light">Vista Previa de Código</h3>
            <p className="text-sm">El código generado aparecerá aquí.</p>
          </div>
        )}
      </div>

    </div>
  );
};