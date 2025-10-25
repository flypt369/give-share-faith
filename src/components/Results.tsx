import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { Resource, Organization } from '../types/database';

interface ResourceWithOrg extends Resource {
  organization?: Organization;
}

const bibleVerses = [
  { text: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
  { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18" },
  { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6" },
  { text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.", reference: "Psalm 23:1-3" },
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  { text: "He heals the brokenhearted and binds up their wounds.", reference: "Psalm 147:3" },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" },
  { text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", reference: "John 14:27" },
];

export function Results() {
  const { language, zipCode, submissionType, prayerText } = useApp();
  const [resources, setResources] = useState<ResourceWithOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse] = useState(bibleVerses[Math.floor(Math.random() * bibleVerses.length)]);

  useEffect(() => {
    fetchResources();
  }, [zipCode]);

  async function fetchResources() {
    setLoading(true);

    const { data } = await supabase
      .from('resources')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('active', true)
      .contains('zip_codes_served', [zipCode])
      .limit(10);

    if (data) {
      setResources(data.map(r => ({
        ...r,
        organization: Array.isArray(r.organization) ? r.organization[0] : r.organization
      })));
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sand-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sage-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-tan-500 dark:text-neutral-400 font-semibold">{translate('finding', language)}</p>
        </div>
      </div>
    );
  }

  if (submissionType === 'prayer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-sand-100 dark:from-neutral-900 dark:to-neutral-800 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-cream-50 dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-tan-400 dark:border-neutral-700">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-sage-600 rounded-full mb-6">
                <Heart className="w-10 h-10 text-cream-50" fill="currentColor" />
              </div>
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                We Will Pray For You
              </h2>
              <p className="text-xl text-tan-500 dark:text-neutral-300 font-semibold leading-relaxed">
                Your prayer request has been received. Our faith community will lift up your request: <span className="italic">"{prayerText}"</span>
              </p>
            </div>

            <div className="bg-sand-100 dark:bg-neutral-700 rounded-xl p-6 md:p-8 border-l-4 border-sage-600">
              <p className="text-2xl text-neutral-900 dark:text-neutral-100 leading-relaxed mb-4 font-light italic">
                "{selectedVerse.text}"
              </p>
              <p className="text-lg text-sage-600 dark:text-sage-600 font-bold text-right">
                — {selectedVerse.reference}
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-tan-500 dark:text-neutral-300 font-semibold leading-relaxed">
                May God's peace be with you. You are not alone in this journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-sand-100 dark:from-neutral-900 dark:to-neutral-800 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {translate('thankYou', language)}
          </h2>
          <p className="text-xl text-tan-500 dark:text-neutral-300 font-semibold">
            {resources.length > 0 ? translate('matches', language) : translate('noMatches', language)}
          </p>
        </div>

        <div className="space-y-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-cream-50 dark:bg-neutral-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-tan-400 dark:border-neutral-700"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {resource.name}
                  </h3>

                  {resource.organization && (
                    <p className="text-lg text-sage-600 dark:text-sage-600 mb-3 font-semibold">
                      {resource.organization.name}
                    </p>
                  )}

                  <p className="text-tan-500 dark:text-neutral-300 mb-4 leading-relaxed font-medium">
                    {resource.description}
                  </p>

                  <div className="space-y-2">
                    {resource.organization?.address && (
                      <div className="flex items-start gap-2 text-sage-600 dark:text-neutral-400">
                        <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                        <span className="font-medium">{resource.organization.address}</span>
                      </div>
                    )}

                    {resource.organization?.contact_phone && (
                      <div className="flex items-center gap-2 text-sage-600 dark:text-neutral-400">
                        <Phone className="w-5 h-5 flex-shrink-0" />
                        <a
                          href={`tel:${resource.organization.contact_phone}`}
                          className="hover:text-tan-500 dark:hover:text-sage-600 font-medium"
                        >
                          {resource.organization.contact_phone}
                        </a>
                      </div>
                    )}

                    {resource.organization?.contact_email && (
                      <div className="flex items-center gap-2 text-sage-600 dark:text-neutral-400">
                        <Mail className="w-5 h-5 flex-shrink-0" />
                        <a
                          href={`mailto:${resource.organization.contact_email}`}
                          className="hover:text-tan-500 dark:hover:text-sage-600 font-medium"
                        >
                          {resource.organization.contact_email}
                        </a>
                      </div>
                    )}

                    {resource.capacity && (
                      <div className="flex items-center gap-2 text-sage-600 dark:text-neutral-400">
                        <Clock className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{resource.capacity}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className="inline-block px-4 py-2 bg-sand-100 dark:bg-sage-800 text-sage-600 dark:text-cream-50 rounded-full text-sm font-bold">
                    {translate(resource.category, language)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {resources.length === 0 && (
          <div className="bg-cream-50 dark:bg-neutral-800 rounded-xl shadow-lg p-8 text-center border-2 border-tan-400 dark:border-neutral-700">
            <p className="text-lg text-tan-500 dark:text-neutral-300 mb-4 font-semibold">
              We're actively building our network of local partners. Please check back soon, or contact us directly for assistance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
