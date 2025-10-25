import React from 'react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';

export function Footer() {
  const { language, ein } = useApp();

  return (
    <footer className="mt-auto py-6 px-4 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-300 dark:border-neutral-700">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {translate('footer', language, { ein })}
        </p>
      </div>
    </footer>
  );
}
