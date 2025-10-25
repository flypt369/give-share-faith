import React, { useState } from 'react';
import { Home, Briefcase, HelpCircle, Heart, ChevronLeft, ChevronRight, DollarSign, Users } from 'lucide-react';
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

export function Questionnaire({ onComplete }: QuestionnaireProps) {
  const { language, zipCode, sessionId, ein } = useApp();
  const [step, setStep] = useState(1);
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
      if (needText.trim()) {
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

      if (giveText.trim()) {
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

      if (prayerText.trim()) {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {translate('whatNeed', language)}
              </h2>

              <div className="space-y-4">
                <textarea
                  value={needText}
                  onChange={(e) => handleNeedTextChange(e.target.value)}
                  placeholder={translate('typeHere', language)}
                  className="w-full min-h-32 p-4 text-lg border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
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
                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selectedNeedCategory === cat.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-neutral-700 dark:text-neutral-300">{cat.icon}</div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {translate(cat.label, language)}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {translate('next', language)}
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {translate('whatGive', language)}
              </h2>

              <div className="space-y-4">
                <textarea
                  value={giveText}
                  onChange={(e) => handleGiftTextChange(e.target.value)}
                  placeholder={translate('typeHere', language)}
                  className="w-full min-h-32 p-4 text-lg border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  aria-label={translate('whatGive', language)}
                />

                <VoiceInput onTranscript={(text) => handleGiftTextChange(giveText + ' ' + text)} />
              </div>

              {showTaxInfo && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 rounded-lg">
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
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
                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selectedGiftCategory === cat.value
                        ? 'border-green-600 bg-green-50 dark:bg-green-900'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-green-400'
                    }`}
                  >
                    <div className="text-neutral-700 dark:text-neutral-300">{cat.icon}</div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {translate(cat.label, language)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 text-lg font-semibold rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  <ChevronLeft className="w-6 h-6" />
                  {translate('back', language)}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {translate('next', language)}
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {translate('sayPrayer', language)}
              </h2>

              <div className="space-y-4">
                <textarea
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  placeholder={translate('typeHere', language)}
                  className="w-full min-h-32 p-4 text-lg border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  aria-label={translate('sayPrayer', language)}
                />

                <VoiceInput onTranscript={(text) => setPrayerText(prayerText + ' ' + text)} />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-4 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 text-lg font-semibold rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  <ChevronLeft className="w-6 h-6" />
                  {translate('back', language)}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 disabled:bg-neutral-400 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {submitting ? translate('loading', language) : translate('submit', language)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
