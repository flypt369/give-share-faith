import React from 'react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';

export function Footer() {
  const { language, ein } = useApp();

  return (
    <footer className="mt-auto py-6 px-4 bg-sand-100 dark:bg-neutral-900 border-t border-tan-400 dark:border-neutral-700">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-tan-500 dark:text-neutral-300 leading-relaxed font-semibold">
          Give <span style={{ color: '#DD0303' }}>✝</span> Share is a 501(c)(3) charitable organization. EIN: {ein}. Contributions are tax-deductible to the fullest extent allowed by law. No goods or services were provided in exchange.
        </p>
      </div>
    </footer>
  );
}
