import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { Header } from './src/components/Header';
import { Footer } from './src/components/Footer';
import { LandingStories } from './src/components/LandingStories';
import { Questionnaire } from './src/components/Questionnaire';
import { Results } from './src/components/Results';

function AppContent() {
  const { highContrast } = useApp();
  const [stage, setStage] = useState<'stories' | 'questionnaire' | 'results'>('stories');

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [highContrast]);

  return (
    <div className="min-h-screen flex flex-col">
      {stage !== 'stories' && <Header />}

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
