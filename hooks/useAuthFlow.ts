import { useState, useEffect } from 'react';
import { linkWithCredential, EmailAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from '../services/firebase';

export type AuthMode = 'link' | 'login' | 'reset';

export const useAuthFlow = (authInstance: any, initialMode: AuthMode = 'login') => {
  const [user, setUser] = useState<any>(authInstance?.currentUser || null);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authInstance) {
      const unsub = authInstance.onAuthStateChanged((u: any) => {
        setUser(u);
        if (u && u.isAnonymous && mode !== 'link') setMode('link');
      });
      return () => unsub();
    }
  }, [authInstance]);

  // Actions
  const login = async (email: string, pass: string) => {
    setStatus('loading');
    try {
      await signInWithEmailAndPassword(authInstance, email, pass);
      setStatus('success');
      setMessage('Bienvenido de nuevo.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  const linkAccount = async (email: string, pass: string) => {
    setStatus('loading');
    try {
      if (!user) throw new Error("No hay usuario activo.");
      const cred = EmailAuthProvider.credential(email, pass);
      await linkWithCredential(user, cred);
      setStatus('success');
      setMessage('Cuenta vinculada permanentemente.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  const resetPass = async (email: string) => {
    setStatus('loading');
    try {
      await sendPasswordResetEmail(authInstance, email);
      setStatus('success');
      setMessage(`Correo enviado a ${email}`);
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  const logout = async () => {
    await signOut(authInstance);
  };

  return {
    user,
    mode,
    setMode,
    status,
    message,
    login,
    linkAccount,
    resetPass,
    logout
  };
};