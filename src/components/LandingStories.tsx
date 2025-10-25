import React, { useState, useEffect } from 'react';
import { ChevronRight, SkipForward } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';
import { AppName } from '../lib/appName';

interface LandingStoriesProps {
  onComplete: () => void;
}

export function LandingStories({ onComplete }: LandingStoriesProps) {
  const { language } = useApp();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [helpTextIndex, setHelpTextIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const helpTexts = ['Food', 'Housing', 'Mental Health', 'Prayer', 'Job Help', 'Something Else?'];

  const localStories = [
    {
      image: '/asian-man-walking-on-street-with-groceries-on-hands.webp',
      imageAlt: 'Community member with groceries',
      imagePosition: 'center 35%',
      text: 'Someone in your community was recently able to get food for their family. Your generosity makes stories like this possible. Together, we are building a network of care—one neighbor at a time.'
    },
    {
      image: '/danielle.png',
      imageAlt: 'Danielle',
      imagePosition: 'center 20%',
      text: '"My name is Danielle. For a long time, I believed asking for help meant I was falling behind. I kept my worries tucked away behind a smile, convincing everyone, including myself, that I could manage everything alone.\n\nI work full-time, I take care of my mother, and I have a daughter who makes every long day worth it. Still, I noticed the weight getting heavier. The missed checkups. The quick meals grabbed between shifts. The stress that never ended, only paused.\n\nOne afternoon at the clinic, a woman handed me a card and said, \'You deserve care too.\' I wanted to laugh it off. Yet later that night, I tapped on the link.\n\nIt was the first time someone asked, \'How can we support you today?\' No judgment. No assumptions. Just kindness and options.\n\nNow I know care does not replace strength. It restores it.\n\nI am still the one holding my family together. The only difference is that now, someone is holding me too."'
    }
  ];

  useEffect(() => {
    const helpInterval = setInterval(() => {
      setHelpTextIndex((prev) => (prev + 1) % helpTexts.length);
    }, 1500);

    return () => clearInterval(helpInterval);
  }, []);

  useEffect(() => {
    const storyInterval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentStoryIndex((prev) => (prev + 1) % localStories.length);
        setFade(true);
      }, 500);
    }, 45000);

    return () => clearInterval(storyInterval);
  }, []);

  const currentStory = localStories[currentStoryIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cream-50 to-sand-100 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <div className="max-w-4xl w-full bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className={`relative h-64 md:h-80 w-full overflow-hidden transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          <img
            src={currentStory.image}
            alt={currentStory.imageAlt}
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: currentStory.imagePosition }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream-50 dark:from-neutral-800 to-transparent"></div>
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-sage-600 text-cream-50 rounded-full text-sm font-semibold">
              <span>
                Give <span style={{ color: '#DD0303' }}>✝</span> Share is a 501(c)(3) nonprofit
              </span>
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

          <div className={`mb-8 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-lg md:text-xl text-tan-500 dark:text-neutral-100 leading-relaxed font-light max-h-[400px] overflow-y-auto">
              {currentStory.text.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {localStories.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStoryIndex
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
                onClick={onComplete}
                className="px-6 py-3 bg-sage-600 hover:bg-sage-700 text-cream-50 font-bold rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-sage-600"
              >
                {translate('next', language)}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center max-w-xl">
        <p className="text-lg text-tan-500 dark:text-neutral-300 font-semibold">
          "Give <span style={{ color: '#DD0303' }}>✝</span> Share connects neighbors in need with those who can give—rooted in compassion, designed for dignity."
        </p>
      </div>
    </div>
  );
}
