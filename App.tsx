import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { Header } from './src/components/Header';
import { Footer } from './src/components/Footer';
import { LandingStories } from './src/components/LandingStories';
import { Questionnaire } from './src/components/Questionnaire';
import { Results } from './src/components/Results';

function AppContent() {
  const { highContrast, setSubmissionType } = useApp();
  const [stage, setStage] = useState<'stories' | 'questionnaire' | 'results'>('stories');

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [highContrast]);

  const handleHomeClick = () => {
    setStage('stories');
    setSubmissionType(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {stage !== 'stories' && <Header onHomeClick={handleHomeClick} />}

      <main className="flex-1">
        {stage === 'stories' && <LandingStories onComplete={() => setStage('questionnaire')} />}
        {stage === 'questionnaire' && <Questionnaire onComplete={() => setStage('results')} />}
        {stage === 'results' && <Results />}
      </main>

      {stage !== 'stories' && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
