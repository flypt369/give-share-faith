import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const { language } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      const langMap: Record<string, string> = {
        en: 'en-US',
        es: 'es-ES',
        ht: 'fr-FR',
        zh: 'zh-CN',
      };
      recognitionInstance.lang = langMap[language] || 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language]);

  function toggleListening() {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  }

  if (!recognition) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-4 rounded-lg font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
        isListening
          ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 animate-pulse'
          : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
      }`}
      aria-label={translate(isListening ? 'stopVoice' : 'useVoice', language)}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      <span>{translate(isListening ? 'stopVoice' : 'useVoice', language)}</span>
    </button>
  );
}
