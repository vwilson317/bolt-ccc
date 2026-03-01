import React, { useEffect } from 'react';
import { Briefcase, GraduationCap, Instagram, Users, CheckCircle2, QrCode, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import SEOHead from '../components/SEOHead';
import { trackEvent } from '../services/posthogAnalyticsService';

type JobListing = {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  commitment: string;
  pay: string;
  summary: string;
  responsibilities: string[];
  idealFor: string[];
  applyLink: string;
  applyLabel: string;
};

const buildApplyLink = (jobTitle: string, t: TFunction): string => {
  const message =
    `${t('jobsPage.whatsapp.intro', { jobTitle })}\n\n` +
    `${t('jobsPage.whatsapp.name')}:\n` +
    `${t('jobsPage.whatsapp.university')}:\n` +
    `${t('jobsPage.whatsapp.age')}:\n` +
    `${t('jobsPage.whatsapp.interestOptional')}:\n` +
    `${t('jobsPage.whatsapp.background')}:`;

  return `https://wa.me/16789826137?text=${encodeURIComponent(message)}`;
};

const jobDefinitions: Array<Pick<JobListing, 'key' | 'icon'>> = [
  {
    key: 'executiveAssistant',
    icon: Briefcase,
  },
  {
    key: 'socialMediaAssistant',
    icon: Instagram,
  },
  {
    key: 'customerRelationships',
    icon: Users,
  },
  {
    key: 'streetActivation',
    icon: QrCode,
  },
  {
    key: 'engineeringIntern',
    icon: Code2,
  }
];

const Jobs: React.FC = () => {
  const { t } = useTranslation();

  const jobs: JobListing[] = jobDefinitions.map(({ key, icon }) => {
    const title = t(`jobsPage.roles.${key}.title`);
    return {
      key,
      icon,
      title,
      commitment: t(`jobsPage.roles.${key}.commitment`),
      pay: t(`jobsPage.roles.${key}.pay`),
      summary: t(`jobsPage.roles.${key}.summary`),
      responsibilities: t(`jobsPage.roles.${key}.responsibilities`, { returnObjects: true }) as string[],
      idealFor: t(`jobsPage.roles.${key}.idealFor`, { returnObjects: true }) as string[],
      applyLabel: t(`jobsPage.roles.${key}.applyLabel`),
      applyLink: buildApplyLink(title, t)
    };
  });

  useEffect(() => {
    trackEvent('jobs_page_viewed', {
      page_path: '/jobs',
      role_count: jobDefinitions.length
    });
  }, []);

  const handleApplyClick = (jobTitle: string) => {
    trackEvent('jobs_apply_clicked', {
      page_path: '/jobs',
      role_title: jobTitle
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <SEOHead
        title={t('jobsPage.seo.title')}
        description={t('jobsPage.seo.description')}
      />

      <section className="bg-gradient-to-br from-beach-600 via-beach-500 to-sunset-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1 text-sm font-medium mb-5">
            <GraduationCap className="h-4 w-4" />
            {t('jobsPage.hero.badge')}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl">{t('jobsPage.hero.title')}</h1>
          <p className="text-white/90 text-base md:text-lg mt-5 max-w-3xl">
            {t('jobsPage.hero.description')}
          </p>
          <div className="mt-6 max-w-3xl rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm md:text-base text-white/95">
            {t('jobsPage.hero.highlight')}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {jobs.map((job) => {
              const Icon = job.icon;
              return (
                <article key={job.key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-beach-50 text-beach-700 flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-beach-700 bg-beach-50 rounded-full px-3 py-1">
                        {t('jobsPage.labels.entryLevel')}
                      </span>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                        {job.commitment}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 -mt-2 mb-4">
                    {t('jobsPage.labels.rioPreferred')}
                  </p>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <p className="text-sm font-medium text-beach-700 mb-3">{job.pay}</p>
                  <p className="text-gray-700 leading-relaxed mb-5">{job.summary}</p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">{t('jobsPage.labels.whatYouWillDo')}</h3>
                      <ul className="space-y-2">
                        {job.responsibilities.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-beach-600 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">{t('jobsPage.labels.idealCandidate')}</h3>
                      <ul className="space-y-2">
                        {job.idealFor.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-beach-600 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <a
                    href={job.applyLink}
                    onClick={() => handleApplyClick(job.title)}
                    className="mt-6 inline-flex items-center justify-center w-full rounded-xl bg-beach-600 hover:bg-beach-700 text-white font-semibold py-3 transition-colors duration-200"
                  >
                    {job.applyLabel}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jobs;
