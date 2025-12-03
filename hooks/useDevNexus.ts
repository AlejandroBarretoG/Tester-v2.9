import { useState } from 'react';
import { interpretPrompt, CAPABILITY_MANIFEST, IntentResult } from '../services/intentEngine';

export type NexusState = 'idle' | 'analyzing' | 'assembling' | 'ready' | 'error';

export const useDevNexus = () => {
  const [nexusState, setNexusState] = useState<NexusState>('idle');
  const [activeModule, setActiveModule] = useState<keyof typeof CAPABILITY_MANIFEST | null>(null);
  const [moduleConfig, setModuleConfig] = useState<any>({});
  const [feedback, setFeedback] = useState<string>('Esperando comando...');

  const executeCommand = async (prompt: string, apiKey: string) => {
    if (!prompt) return;

    setNexusState('analyzing');
    setFeedback('Analizando intención semántica...');

    try {
      // 1. AI Interpretation
      const intent: IntentResult = await interpretPrompt(apiKey, prompt);
      
      setNexusState('assembling');
      setFeedback(`Ensamblando módulo: ${intent.intentId}...`);
      
      // Artificial delay for "Assembling" effect (UX)
      await new Promise(resolve => setTimeout(resolve, 800));

      // 2. State Update
      setActiveModule(intent.intentId as any);
      setModuleConfig(intent.config);
      setNexusState('ready');
      setFeedback('Sistema listo.');

    } catch (error: any) {
      setNexusState('error');
      setFeedback(`Error del núcleo: ${error.message}`);
    }
  };

  const resetNexus = () => {
    setNexusState('idle');
    setActiveModule(null);
    setFeedback('Esperando comando...');
  };

  return {
    nexusState,
    activeModule,
    moduleConfig,
    feedback,
    executeCommand,
    resetNexus
  };
};