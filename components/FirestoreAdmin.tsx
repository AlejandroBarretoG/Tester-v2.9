import React, { useState, useEffect } from 'react';
import { Database, Plus, Save, Trash2, Loader2, AlertCircle, CheckCircle2, FileJson, FolderTree, RefreshCw, Layout, Settings, Search } from 'lucide-react';
import { fetchDocuments, createDocument, updateDocument, deleteDocument } from '../services/firestoreAdmin';
import { getRegisteredCollections, registerCollection } from '../services/registryService';
import { FirestoreSourceBadge } from './FirestoreSourceBadge';

interface FirestoreAdminProps {
  firebaseInstance: any;
  initialCollection?: string; // New Prop for Intent System
}

const DEFAULT_COLLECTIONS = ['users', '_app_registry'];

export const FirestoreAdmin: React.FC<FirestoreAdminProps> = ({ firebaseInstance, initialCollection }) => {
  const [knownCollections, setKnownCollections] = useState<string[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [manualCollectionInput, setManualCollectionInput] = useState('');
  
  // Selection State
  const [collectionName, setCollectionName] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor State
  const [jsonContent, setJsonContent] = useState('');
  const [isNewDoc, setIsNewDoc] = useState(false);
  
  // Feedback
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // 1. Handle Intent Injection
  useEffect(() => {
    if (firebaseInstance && initialCollection) {
      handleSelectCollection(initialCollection);
    }
  }, [initialCollection, firebaseInstance]);

  // 2. Load Registry on Mount
  useEffect(() => {
    if (firebaseInstance) loadRegistry();
  }, [firebaseInstance]);

  const loadRegistry = async () => {
    setLoadingRegistry(true);
    const result = await getRegisteredCollections(firebaseInstance);
    const dynamicCollections = (result.success && result.collections) ? result.collections : [];
    const merged = Array.from(new Set([...DEFAULT_COLLECTIONS, ...dynamicCollections])).sort();
    setKnownCollections(merged);
    setLoadingRegistry(false);
  };

  const handleManualAddCollection = async () => {
    const name = manualCollectionInput.trim();
    if (!name) return;
    if (!knownCollections.includes(name)) {
      setKnownCollections(prev => [...prev, name].sort());
    }
    registerCollection(firebaseInstance, name);
    handleSelectCollection(name);
    setManualCollectionInput('');
  };

  const handleSelectCollection = (name: string) => {
    setCollectionName(name);
    handleLoadCollection(name);
  };

  const handleLoadCollection = async (name: string) => {
    if (!firebaseInstance) return;
    setStatus('loading');
    setMessage('');
    setSelectedDocId(null);
    setDocuments([]);
    
    const result = await fetchDocuments(firebaseInstance, name);
    
    if (result.success) {
      setDocuments(result.data || []);
      setStatus('idle');
      setJsonContent('');
      setIsNewDoc(false);
    } else {
      setStatus('error');
      setMessage(result.error || 'Error al cargar colección');
    }
  };

  const handleSelectDoc = (doc: any) => {
    setSelectedDocId(doc.id);
    setIsNewDoc(false);
    const { id, ...data } = doc;
    setJsonContent(JSON.stringify(data, null, 2));
    setMessage('');
  };

  const handleNewDoc = () => {
    setSelectedDocId(null);
    setIsNewDoc(true);
    setJsonContent('{\n  "key": "value"\n}');
    setMessage('');
  };

  const handleSave = async () => {
    if (!firebaseInstance) return;
    let parsedData;
    try {
      parsedData = JSON.parse(jsonContent);
    } catch (e) {
      setStatus('error');
      setMessage('JSON Inválido.');
      return;
    }

    setStatus('loading');
    let result;
    if (isNewDoc) {
      result = await createDocument(firebaseInstance, collectionName, parsedData);
    } else if (selectedDocId) {
      result = await updateDocument(firebaseInstance, collectionName, selectedDocId, parsedData);
    } else return;

    if (result.success) {
      setStatus('success');
      setMessage(isNewDoc ? 'Creado.' : 'Actualizado.');
      const refresh = await fetchDocuments(firebaseInstance, collectionName);
      if (refresh.success) {
        setDocuments(refresh.data || []);
        if (isNewDoc && result.data?.id) {
           const newDoc = refresh.data?.find((d: any) => d.id === result.data.id);
           if (newDoc) handleSelectDoc(newDoc);
        } else if (selectedDocId) {
           const current = refresh.data?.find((d: any) => d.id === selectedDocId);
           if (current) handleSelectDoc(current);
        }
      }
    } else {
      setStatus('error');
      setMessage(result.error || 'Error.');
    }
  };

  const handleDelete = async () => {
    if (!selectedDocId || !firebaseInstance) return;
    if (!confirm('¿Eliminar?')) return;
    setStatus('loading');
    const result = await deleteDocument(firebaseInstance, collectionName, selectedDocId);
    if (result.success) {
      setStatus('success');
      setMessage('Eliminado.');
      setDocuments(prev => prev.filter(d => d.id !== selectedDocId));
      setSelectedDocId(null);
      setJsonContent('');
      setIsNewDoc(false);
    } else {
      setStatus('error');
      setMessage(result.error || 'Error.');
    }
  };

  if (!firebaseInstance) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
        <Database size={48} className="mb-4 opacity-50" />
        <p>Conecta Firebase primero.</p>
      </div>
    );
  }

  const filteredDocs = documents.filter(doc => 
    doc.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
      {/* Sidebar */}
      <div className="w-48 sm:w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 bg-white border-b border-slate-200">
           <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Colecciones</h3>
           <div className="flex gap-2">
             <input type="text" value={manualCollectionInput} onChange={e=>setManualCollectionInput(e.target.value)} placeholder="Añadir..." className="flex-1 text-xs px-2 py-1.5 border rounded" onKeyDown={e=>e.key==='Enter' && handleManualAddCollection()} />
             <button onClick={handleManualAddCollection} className="px-2 border rounded hover:bg-slate-50"><Plus size={14}/></button>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {knownCollections.map(col => (
            <button key={col} onClick={() => handleSelectCollection(col)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${collectionName===col ? 'bg-white shadow text-orange-600' : 'text-slate-600 hover:bg-slate-100'}`}>
               {col.startsWith('_') ? <Settings size={14}/> : <Database size={14}/>} <span className="truncate">{col}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Docs List */}
      <div className="w-48 sm:w-64 border-r border-slate-200 flex flex-col bg-white shrink-0">
         <div className="p-4 border-b border-slate-100 h-[60px] flex items-center justify-between">
            <span className="font-bold text-slate-700 text-sm flex items-center gap-2"><FileJson size={16}/> Documentos</span>
            {collectionName && <span className="text-xs bg-slate-100 px-2 rounded">{documents.length}</span>}
         </div>
         <div className="flex-1 overflow-y-auto">
            {filteredDocs.map(doc => (
               <button key={doc.id} onClick={()=>handleSelectDoc(doc)} className={`w-full text-left px-4 py-2 text-xs font-mono truncate hover:bg-slate-50 ${selectedDocId===doc.id ? 'bg-orange-50 text-orange-700 border-l-2 border-orange-500' : ''}`}>
                 {doc.id}
               </button>
            ))}
         </div>
         {collectionName && <button onClick={handleNewDoc} className="p-3 text-xs text-center border-t text-slate-500 hover:bg-slate-50 font-medium">+ Crear Nuevo</button>}
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {(selectedDocId || isNewDoc) ? (
          <>
             <div className="p-2 px-4 border-b border-slate-200 bg-white h-[60px] flex justify-between items-center">
                <div className="flex items-center gap-2">
                   {isNewDoc ? <Plus className="text-green-500"/> : <FileJson className="text-orange-500"/>}
                   <span className="font-mono text-xs font-bold">{isNewDoc ? 'NUEVO' : selectedDocId}</span>
                </div>
                <div className="flex gap-2">
                   {!isNewDoc && <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded"><Trash2 size={16}/></button>}
                   <button onClick={handleSave} disabled={status==='loading'} className="bg-slate-900 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2">
                      {status==='loading' ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Guardar
                   </button>
                </div>
             </div>
             <textarea value={jsonContent} onChange={e=>setJsonContent(e.target.value)} className="flex-1 w-full p-4 font-mono text-sm bg-transparent outline-none resize-none" spellCheck={false}/>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-300">Selecciona un documento</div>
        )}
      </div>
    </div>
  );
};