import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Gift, Instagram } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { trackEvent } from '../services/posthogAnalyticsService';

type Project = {
  id: string;
  name: string;
  description: string;
  status: 'live' | 'building' | 'idea';
  internalHref?: string;
  externalHref?: string;
  whatsappHref?: string;
  ctaLabel?: string;
};

const projects = [
  {
    id: 'carioca-coastal-club',
    name: 'Carioca Coastal Club',
    description:
      'The original beach barraca discovery and loyalty experience, now featured as project #1.',
    status: 'live',
    internalHref: '/projects/carioca-coastal-club',
    whatsappHref: 'https://chat.whatsapp.com/FVLJK8eqKzUKY7oUfnymD5?mode=gi_t',
    ctaLabel: 'View Project',
  },
  {
    id: 'quatro',
    name: 'Quartou',
    description: 'Looking for a room in Brazil? They got you covered.',
    status: 'live',
    internalHref: 'http://quartou.com.br/',
  },
  {
    id: 'inflama',
    name: 'Inflama',
    description: 'A Brazilian Tinder clone currently being built and tested in public.',
    status: 'building',
    whatsappHref: 'https://chat.whatsapp.com/IbCoAHeqcQiFpT2rYgA88g?mode=gi_t',
  },
  {
    id: 'brazil-digital-nomands',
    name: 'BrazilDigitalNomands',
    description: 'A community site for digital nomads in Brazil.',
    status: 'building',
    externalHref: 'http://brazildigitalnomands.com/',
    ctaLabel: 'View Site',
  },
  {
    id: 'language-flash-cards',
    name: 'Language Flash Cards',
    description: 'An idea-stage product to make language learning easier with fast daily repetition.',
    status: 'idea',
    whatsappHref: 'https://chat.whatsapp.com/Eod2G6s7LCVAMdrjYtOAoc?mode=gi_t',
  },
] satisfies Project[];

const THAIS_PROMO_URL = '/projects/carioca-coastal-club?promo=thais-follow';

const statusStyles: Record<string, string> = {
  live: 'bg-emerald-100 text-emerald-700',
  building: 'bg-amber-100 text-amber-700',
  idea: 'bg-slate-100 text-slate-700',
};

const CommunityHome: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    trackEvent('community_home_viewed', {
      page: 'community_home',
      project_count: projects.length,
      category: 'Community Home',
    });
  }, []);

  const trackProjectAction = useCallback(
    (
      actionType: 'project_open' | 'whatsapp_join',
      project: Project,
      targetType: 'internal' | 'external' | 'whatsapp',
      targetUrl?: string
    ) => {
      trackEvent('community_project_action_clicked', {
        action_type: actionType,
        page: 'community_home',
        project_id: project.id,
        project_name: project.name,
        project_status: project.status,
        target_type: targetType,
        target_url: targetUrl,
        category: 'Community Home',
      });
    },
    []
  );

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={t('communityHome.seo.title', 'Carioca Coastal Club - Build In Public Community')}
        description={t(
          'communityHome.seo.description',
          'A build-in-public community hub sharing projects, experiments, and progress in the open.'
        )}
        image="https://cariocacoastalclub.com/group-v-1-logo.jpg"
        url="https://cariocacoastalclub.com"
        type="website"
        siteName="Carioca Coastal Club"
        locale="en_US"
        twitterCard="summary_large_image"
      />

      <section className="pt-28 pb-16 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-wide uppercase text-beach-600 mb-4">
            {t('communityHome.eyebrow', 'Community + Build In Public')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {t('communityHome.title', 'Carioca Coastal Club is now a public builder journey.')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {t(
              'communityHome.description',
              'This site now tracks what we are building in public: shipping projects, sharing progress, and growing a community around real products.'
            )}
          </p>
        </div>
      </section>

      <section className="py-10 border-b border-rose-100 bg-gradient-to-r from-amber-50 via-rose-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  <Gift className="h-3.5 w-3.5 mr-1.5" />
                  Featured Member Discount
                </div>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">Thais&apos; Barraca Discount Pass</h2>
                <p className="mt-1 text-gray-700">
                  Follow <span className="font-semibold">@thai.82ipanema</span> and claim your reusable supporter badge.
                </p>
              </div>
              <Link
                to={THAIS_PROMO_URL}
                onClick={() =>
                  trackEvent('community_promo_open_clicked', {
                    promo_id: 'thais-follow',
                    page: 'community_home',
                    target_path: THAIS_PROMO_URL,
                    category: 'Community Home',
                  })
                }
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Open Thais Promo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('communityHome.projectsTitle', 'Projects')}
            </h2>
            <p className="text-gray-600">
              {t('communityHome.projectsDescription', 'A growing list of what we are shipping in public.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <article key={project.id} className="border border-gray-200 rounded-2xl p-6 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${statusStyles[project.status]}`}
                  >
                    {t(`communityHome.status.${project.status}`, project.status)}
                  </span>
                </div>
                <p className="text-gray-600 mb-5">{t(`communityHome.projects.${project.id}.description`, project.description)}</p>
                <div className="flex flex-wrap gap-3">
                  {project.internalHref && (
                    <Link
                      to={project.internalHref}
                      onClick={() => trackProjectAction('project_open', project, 'internal', project.internalHref)}
                      className="inline-flex items-center text-beach-600 font-semibold hover:text-beach-700"
                    >
                      {t(`communityHome.projects.${project.id}.cta`, project.ctaLabel || 'View Project')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  )}
                  {project.externalHref && (
                    <a
                      href={project.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackProjectAction('project_open', project, 'external', project.externalHref)}
                      className="inline-flex items-center text-beach-600 font-semibold hover:text-beach-700"
                    >
                      {t(`communityHome.projects.${project.id}.cta`, project.ctaLabel || 'View Site')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  )}
                  {project.whatsappHref && (
                    <a
                      href={project.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackProjectAction('whatsapp_join', project, 'whatsapp', project.whatsappHref)}
                      className="inline-flex items-center px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t('communityHome.whatsappCta', 'Join the WhatsApp Group')}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommunityHome;
