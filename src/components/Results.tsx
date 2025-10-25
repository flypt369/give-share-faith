import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translate } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { Resource, Organization } from '../types/database';

interface ResourceWithOrg extends Resource {
  organization?: Organization;
}

export function Results() {
  const { language, zipCode } = useApp();
  const [resources, setResources] = useState<ResourceWithOrg[]>([]);
  const [loading, setLoading] = useState(true);

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
