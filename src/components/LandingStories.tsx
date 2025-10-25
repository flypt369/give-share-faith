import React, { useState, useEffect } from 'react';
import { ChevronRight, SkipForward } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { Story } from '../types/database';

interface LandingStoriesProps {
  onComplete: () => void;
}

export function LandingStories({ onComplete }: LandingStoriesProps) {
  const { language, zipCode } = useApp();
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [helpTextIndex, setHelpTextIndex] = useState(0);

  const helpTexts = ['Food', 'Housing', 'Mental Health', 'Prayer', 'Job Help', 'Something Else?'];

  useEffect(() => {
    fetchStories();
  }, [zipCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHelpTextIndex((prev) => (prev + 1) % helpTexts.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  async function fetchStories() {
    setLoading(true);
    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setStories(data);
    }
    setLoading(false);
  }

  function handleNext() {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-neutral-900 dark:to-neutral-800">
        <p className="text-xl text-neutral-600 dark:text-neutral-400">{translate('loading', language)}</p>
      </div>
    );
  }

  if (stories.length === 0) {
    onComplete();
    return null;
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            {translate('nonprofit', language)}
          </span>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Need help with{' '}
            <span className="inline-block min-w-[200px] text-blue-600 dark:text-blue-400 transition-all duration-300">
              {helpTexts[helpTextIndex]}
            </span>
          </h2>
        </div>

        <div className="mb-8">
          <p className="text-2xl md:text-3xl text-neutral-800 dark:text-neutral-100 leading-relaxed font-light">
            {currentStory.anonymized_text}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {stories.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-8 bg-blue-600 dark:bg-blue-400'
                    : 'w-2 bg-neutral-300 dark:bg-neutral-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onComplete}
              className="px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
              <SkipForward className="w-5 h-5" />
              <span className="hidden sm:inline">{translate('skipStories', language)}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {translate(currentIndex < stories.length - 1 ? 'continueReading' : 'next', language)}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center max-w-xl">
        <p className="text-lg text-neutral-700 dark:text-neutral-300 font-medium">
          "Give ✝ Share connects neighbors in need with those who can give—rooted in compassion, designed for dignity."
        </p>
      </div>
    </div>
  );
}
