import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types/database';
import { supabase } from '../lib/supabase';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  zipCode: string;
  setZipCode: (zip: string) => void;
  sessionId: string | null;
  ein: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [highContrast, setHighContrast] = useState(false);
  const [zipCode, setZipCode] = useState('10001');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ein, setEin] = useState('00-0000000');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageCode;
    if (savedLanguage) setLanguage(savedLanguage);

    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    setHighContrast(savedHighContrast);

    const savedZipCode = localStorage.getItem('zipCode');
    if (savedZipCode) setZipCode(savedZipCode);

    fetchEin();
    createSession();
  }, []);

  async function fetchEin() {
    const { data } = await supabase
      .from('platform_config')
      .select('value')
      .eq('key', 'ein')
      .maybeSingle();

    if (data?.value) {
      setEin(String(data.value).replace(/"/g, ''));
    }
  }

  async function createSession() {
    const savedSessionId = sessionStorage.getItem('sessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      return;
    }

    const { data, error } = await supabase
      .from('anonymous_sessions')
      .insert({
        zip_code: zipCode,
        language_preference: language,
      })
      .select()
      .single();

    if (data && !error) {
      setSessionId(data.id);
      sessionStorage.setItem('sessionId', data.id);
    }
  }

  const handleSetLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', String(newValue));
  };

  const handleSetZipCode = (zip: string) => {
    setZipCode(zip);
    localStorage.setItem('zipCode', zip);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        highContrast,
        toggleHighContrast,
        zipCode,
        setZipCode: handleSetZipCode,
        sessionId,
        ein,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
