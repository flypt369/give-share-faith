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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cream-50 to-sand-100 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <div className="max-w-4xl w-full bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            src="/asian-man-walking-on-street-with-groceries-on-hands.webp"
            alt="Community member with groceries"
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: 'center 35%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream-50 to-transparent"></div>
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-sage-600 text-cream-50 rounded-full text-sm font-semibold">
              {translate('nonprofit', language)}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              Need help with{' '}
              <span className="inline-block min-w-[200px] text-sage-600 dark:text-sage-600 transition-all duration-300">
                {helpTexts[helpTextIndex]}
              </span>
            </h2>
          </div>

          <div className="mb-8">
            <p className="text-2xl md:text-3xl text-tan-500 dark:text-neutral-100 leading-relaxed font-light">
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
                      ? 'w-8 bg-sage-600 dark:bg-sage-600'
                      : 'w-2 bg-tan-400 dark:bg-neutral-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onComplete}
                className="px-4 py-3 text-tan-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sage-600 rounded-lg"
              >
                <SkipForward className="w-5 h-5" />
                <span className="hidden sm:inline">{translate('skipStories', language)}</span>
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-sage-600 hover:bg-sage-700 text-cream-50 font-bold rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-sage-600"
              >
                {translate(currentIndex < stories.length - 1 ? 'continueReading' : 'next', language)}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center max-w-xl">
        <p className="text-lg text-tan-500 dark:text-neutral-300 font-semibold">
          "Give ✝ Share connects neighbors in need with those who can give—rooted in compassion, designed for dignity."
        </p>
      </div>
    </div>
  );
}
