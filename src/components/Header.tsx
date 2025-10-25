import { Globe, Moon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';
import { LanguageCode } from '../types/database';

export function Header() {
  const { language, setLanguage, toggleHighContrast } = useApp();

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'ht', label: 'Kreyòl' },
    { code: 'zh', label: '中文' },
  ];

  return (
    <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 py-4 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {translate('appName', language)}
          </h1>
          <span className="hidden sm:inline-block text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
            {translate('nonprofit', language)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleHighContrast}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={translate('highContrast', language)}
            title={translate('highContrast', language)}
          >
            <Moon className="w-5 h-5" />
          </button>

          <div className="relative group">
            <button
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={translate('changeLanguage', language)}
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{language.toUpperCase()}</span>
            </button>

            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg ${
                    language === lang.code ? 'bg-blue-50 dark:bg-blue-900 font-semibold' : ''
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
