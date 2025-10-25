import React, { useState } from 'react';
import { Home, Briefcase, HelpCircle, Heart, ChevronLeft, ChevronRight, DollarSign, Users, HandHeart, Hand } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';
import { VoiceInput } from './VoiceInput';
import { classifyNeed, classifyGift, detectGiverType, generatePrayer } from '../lib/textClassification';
import { supabase } from '../lib/supabase';
import { NeedCategory, GiftCategory } from '../types/database';

const FoodIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
  </svg>
);

interface QuestionnaireProps {
  onComplete: () => void;
}

type PathChoice = 'need' | 'give' | 'prayer' | null;

export function Questionnaire({ onComplete }: QuestionnaireProps) {
  const { language, zipCode, sessionId, ein } = useApp();
  const [pathChoice, setPathChoice] = useState<PathChoice>(null);
  const [needText, setNeedText] = useState('');
  const [giveText, setGiveText] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [selectedNeedCategory, setSelectedNeedCategory] = useState<NeedCategory | null>(null);
  const [selectedGiftCategory, setSelectedGiftCategory] = useState<GiftCategory | null>(null);
  const [showTaxInfo, setShowTaxInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const needCategories: { value: NeedCategory; icon: React.ReactNode; label: string }[] = [
    { value: 'food', icon: <FoodIcon />, label: 'food' },
    { value: 'shelter', icon: <Home className="w-8 h-8" />, label: 'shelter' },
    { value: 'employment', icon: <Briefcase className="w-8 h-8" />, label: 'employment' },
    { value: 'other', icon: <HelpCircle className="w-8 h-8" />, label: 'other' },
  ];

  const giftCategories: { value: GiftCategory; icon: React.ReactNode; label: string }[] = [
    { value: 'food', icon: <FoodIcon />, label: 'food' },
    { value: 'shelter', icon: <Home className="w-8 h-8" />, label: 'shelter' },
    { value: 'employment', icon: <Briefcase className="w-8 h-8" />, label: 'employment' },
    { value: 'spiritual', icon: <Heart className="w-8 h-8" />, label: 'spiritual' },
    { value: 'financial', icon: <DollarSign className="w-8 h-8" />, label: 'financial' },
    { value: 'volunteer', icon: <Users className="w-8 h-8" />, label: 'volunteer' },
    { value: 'other', icon: <HelpCircle className="w-8 h-8" />, label: 'other' },
  ];

  function handleNeedTextChange(text: string) {
    setNeedText(text);
    if (text.trim()) {
      const category = classifyNeed(text);
      setSelectedNeedCategory(category);
    }
  }

  function handleGiftTextChange(text: string) {
    setGiveText(text);
    if (text.trim()) {
      const category = classifyGift(text);
      setSelectedGiftCategory(category);

      const giverType = detectGiverType(text);
      if (giverType !== 'individual') {
        setShowTaxInfo(true);
      } else {
        setShowTaxInfo(false);
      }
    }
  }

  async function handleSubmit() {
    setSubmitting(true);

    try {
      if (pathChoice === 'need' && needText.trim()) {
        const category = selectedNeedCategory || classifyNeed(needText);
        await supabase.from('needs').insert({
          session_id: sessionId,
          category,
          description: needText,
          zip_code: zipCode,
          urgency: 'medium',
          status: 'open',
        });
      }

      if (pathChoice === 'give' && giveText.trim()) {
        const category = selectedGiftCategory || classifyGift(giveText);
        const giverType = detectGiverType(giveText);
        await supabase.from('gifts').insert({
          session_id: sessionId,
          giver_type: giverType,
          category,
          description: giveText,
          zip_code: zipCode,
          status: 'available',
        });
      }

      if (pathChoice === 'prayer' && prayerText.trim()) {
        const generatedPrayer = generatePrayer(prayerText, language);
        await supabase.from('prayers').insert({
          session_id: sessionId,
          request_text: prayerText,
          generated_prayer: generatedPrayer,
          zip_code: zipCode,
        });
      }

      onComplete();
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream-50 to-sand-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {!pathChoice && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  {translate('chooseAction', language)}
                </h2>
                <p className="text-lg text-tan-500 dark:text-neutral-400">
                  Select one option to continue
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <button
                  onClick={() => setPathChoice('need')}
                  className="group bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all focus:outline-none focus:ring-4 focus:ring-sage-600 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-sand-100 dark:bg-sage-700 rounded-full flex items-center justify-center group-hover:bg-tan-400 dark:group-hover:bg-sage-600 transition-colors">
                      <Hand className="w-10 h-10 text-sage-600 dark:text-cream-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {translate('iNeed', language)}
                    </h3>
                    <p className="text-tan-500 dark:text-neutral-400 leading-relaxed">
                      {translate('needDescription', language)}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPathChoice('give')}
                  className="group bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all focus:outline-none focus:ring-4 focus:ring-sage-600 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-sand-100 dark:bg-sage-700 rounded-full flex items-center justify-center group-hover:bg-tan-400 dark:group-hover:bg-sage-600 transition-colors">
                      <HandHeart className="w-10 h-10 text-sage-600 dark:text-cream-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {translate('iCanGive', language)}
                    </h3>
                    <p className="text-tan-500 dark:text-neutral-400 leading-relaxed">
                      {translate('giveDescription', language)}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPathChoice('prayer')}
                  className="group bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all focus:outline-none focus:ring-4 focus:ring-sage-600 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-sand-100 dark:bg-sage-700 rounded-full flex items-center justify-center group-hover:bg-tan-400 dark:group-hover:bg-sage-600 transition-colors">
                      <Heart className="w-10 h-10 text-sage-600 dark:text-cream-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {translate('prayerRequest', language)}
                    </h3>
                    <p className="text-tan-500 dark:text-neutral-400 leading-relaxed">
                      {translate('prayerDescription', language)}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {pathChoice === 'need' && (
            <div className="bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 md:p-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {translate('whatNeed', language)}
                </h2>

                <div className="space-y-4">
                  <textarea
                    value={needText}
                    onChange={(e) => handleNeedTextChange(e.target.value)}
                    placeholder={translate('typeHere', language)}
                    className="w-full min-h-32 p-4 text-lg border-2 border-tan-400 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    aria-label={translate('whatNeed', language)}
                  />

                  <VoiceInput onTranscript={(text) => handleNeedTextChange(needText + ' ' + text)} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {needCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedNeedCategory(cat.value);
                        if (!needText.trim()) {
                          setNeedText(translate(cat.label, language));
                        }
                      }}
                      className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-sage-600 ${
                        selectedNeedCategory === cat.value
                          ? 'border-sage-600 bg-sand-100 dark:bg-sage-800'
                          : 'border-tan-400 dark:border-neutral-600 hover:border-sage-600'
                      }`}
                    >
                      <div className="text-sage-600 dark:text-neutral-300">{cat.icon}</div>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {translate(cat.label, language)}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setPathChoice(null)}
                    className="px-6 py-4 bg-sand-100 dark:bg-neutral-700 hover:bg-tan-400 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 text-lg font-bold rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sage-600"
                  >
                    <ChevronLeft className="w-6 h-6" />
                    {translate('back', language)}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !needText.trim()}
                    className="flex-1 py-4 bg-sage-600 hover:bg-sage-700 disabled:bg-neutral-400 text-cream-50 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-sage-600"
                  >
                    {submitting ? translate('loading', language) : translate('submit', language)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {pathChoice === 'give' && (
            <div className="bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 md:p-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {translate('whatGive', language)}
                </h2>

                <div className="space-y-4">
                  <textarea
                    value={giveText}
                    onChange={(e) => handleGiftTextChange(e.target.value)}
                    placeholder={translate('typeHere', language)}
                    className="w-full min-h-32 p-4 text-lg border-2 border-tan-400 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    aria-label={translate('whatGive', language)}
                  />

                  <VoiceInput onTranscript={(text) => handleGiftTextChange(giveText + ' ' + text)} />
                </div>

                {showTaxInfo && (
                  <div className="p-4 bg-sand-100 dark:bg-sage-800 border-l-4 border-sage-600 rounded-lg">
                    <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-semibold">
                      {translate('taxInfo', language, { ein })}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {giftCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedGiftCategory(cat.value);
                        if (!giveText.trim()) {
                          setGiveText(translate(cat.label, language));
                        }
                      }}
                      className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-sage-600 ${
                        selectedGiftCategory === cat.value
                          ? 'border-sage-600 bg-sand-100 dark:bg-sage-800'
                          : 'border-tan-400 dark:border-neutral-600 hover:border-sage-600'
                      }`}
                    >
                      <div className="text-sage-600 dark:text-neutral-300">{cat.icon}</div>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {translate(cat.label, language)}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setPathChoice(null)}
                    className="px-6 py-4 bg-sand-100 dark:bg-neutral-700 hover:bg-tan-400 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 text-lg font-bold rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sage-600"
                  >
                    <ChevronLeft className="w-6 h-6" />
                    {translate('back', language)}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !giveText.trim()}
                    className="flex-1 py-4 bg-sage-600 hover:bg-sage-700 disabled:bg-neutral-400 text-cream-50 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-sage-600"
                  >
                    {submitting ? translate('loading', language) : translate('submit', language)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {pathChoice === 'prayer' && (
            <div className="bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 md:p-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {translate('sayPrayer', language)}
                </h2>

                <div className="space-y-4">
                  <textarea
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    placeholder={translate('typeHere', language)}
                    className="w-full min-h-32 p-4 text-lg border-2 border-tan-400 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    aria-label={translate('sayPrayer', language)}
                  />

                  <VoiceInput onTranscript={(text) => setPrayerText(prayerText + ' ' + text)} />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setPathChoice(null)}
                    className="px-6 py-4 bg-sand-100 dark:bg-neutral-700 hover:bg-tan-400 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 text-lg font-bold rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sage-600"
                  >
                    <ChevronLeft className="w-6 h-6" />
                    {translate('back', language)}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !prayerText.trim()}
                    className="flex-1 py-4 bg-sage-600 hover:bg-sage-700 disabled:bg-neutral-400 text-cream-50 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-sage-600"
                  >
                    {submitting ? translate('loading', language) : translate('submit', language)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
