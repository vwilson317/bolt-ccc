import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
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

type JobType = 'internship' | 'entry-level';
type CompensationType = 'unpaid' | 'paid';

type Job = {
  id: string;
  title: string;
  team: string;
  type: JobType;
  compensation: CompensationType;
  location: string;
  summary: string;
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

const statusStyles: Record<string, string> = {
  live: 'bg-emerald-100 text-emerald-700',
  building: 'bg-amber-100 text-amber-700',
  idea: 'bg-slate-100 text-slate-700',
};

const jobs = [
  {
    id: 'social-content-internship',
    title: 'Social Content Internship',
    team: 'Social & Brand',
    type: 'internship',
    compensation: 'unpaid',
    location: 'Rio de Janeiro · Hybrid',
    summary: 'Support content planning, captions, and daily publishing while learning creator workflows.',
  },
  {
    id: 'social-content-assistant',
    title: 'Social Content Assistant',
    team: 'Social & Brand',
    type: 'entry-level',
    compensation: 'paid',
    location: 'Rio de Janeiro · Hybrid',
    summary: 'Own posting calendars, coordinate assets, and track performance on core social channels.',
  },
  {
    id: 'community-operations-internship',
    title: 'Community Operations Internship',
    team: 'Community Operations',
    type: 'internship',
    compensation: 'unpaid',
    location: 'Rio de Janeiro · On-site',
    summary: 'Help run events, member onboarding, and community support tasks with close team mentorship.',
  },
  {
    id: 'community-operations-associate',
    title: 'Community Operations Associate',
    team: 'Community Operations',
    type: 'entry-level',
    compensation: 'paid',
    location: 'Rio de Janeiro · On-site',
    summary: 'Coordinate event execution, support workflows, and weekly community reporting.',
  },
  {
    id: 'web-product-internship',
    title: 'Web Product Internship',
    team: 'Product & Engineering',
    type: 'internship',
    compensation: 'unpaid',
    location: 'Remote · Brazil',
    summary: 'Assist with QA, content updates, and simple UI improvements in a fast ship environment.',
  },
  {
    id: 'junior-web-product-specialist',
    title: 'Junior Web Product Specialist',
    team: 'Product & Engineering',
    type: 'entry-level',
    compensation: 'paid',
    location: 'Remote · Brazil',
    summary: 'Ship small product updates, collaborate with design, and maintain high-quality user flows.',
  },
  {
    id: 'photography-internship',
    title: 'Photography Internship',
    team: 'Creative Media',
    type: 'internship',
    compensation: 'unpaid',
    location: 'Rio de Janeiro · On-site',
    summary: 'Capture beach, event, and community moments while learning composition, lighting, and editing.',
  },
  {
    id: 'junior-photography-assistant',
    title: 'Junior Photography Assistant',
    team: 'Creative Media',
    type: 'entry-level',
    compensation: 'paid',
    location: 'Rio de Janeiro · On-site',
    summary: 'Lead photo sessions, organize assets, and deliver edited photo sets for campaigns and social.',
  },
  {
    id: 'marketing-internship',
    title: 'Marketing Internship',
    team: 'Growth & Partnerships',
    type: 'internship',
    compensation: 'unpaid',
    location: 'Rio de Janeiro · Hybrid',
    summary: 'Support campaign research, outreach, and reporting across growth and partnerships projects.',
  },
  {
    id: 'junior-marketing-coordinator',
    title: 'Junior Marketing Coordinator',
    team: 'Growth & Partnerships',
    type: 'entry-level',
    compensation: 'paid',
    location: 'Rio de Janeiro · Hybrid',
    summary: 'Coordinate marketing initiatives, partner activations, and channel-level campaign analysis.',
  },
] satisfies Job[];

const compensationStyles: Record<CompensationType, string> = {
  unpaid: 'bg-orange-100 text-orange-700',
  paid: 'bg-emerald-100 text-emerald-700',
};

const typeStyles: Record<JobType, string> = {
  internship: 'bg-sky-100 text-sky-700',
  'entry-level': 'bg-purple-100 text-purple-700',
};

const typeLabels: Record<JobType, string> = {
  internship: 'Internship',
  'entry-level': 'Entry-level',
};

const compensationLabels: Record<CompensationType, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
};

const CommunityHome: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | JobType>('all');
  const [selectedCompensation, setSelectedCompensation] = useState<'all' | CompensationType>('all');

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

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return jobs
      .filter((job) => {
        const matchesQuery =
          query.length === 0 ||
          [job.title, job.team, job.summary, job.location].some((value) =>
            value.toLowerCase().includes(query)
          );
        const matchesType = selectedType === 'all' || job.type === selectedType;
        const matchesCompensation =
          selectedCompensation === 'all' || job.compensation === selectedCompensation;

        return matchesQuery && matchesType && matchesCompensation;
      })
      .sort((a, b) => {
        if (a.compensation === b.compensation) {
          return a.title.localeCompare(b.title);
        }

        return a.compensation === 'unpaid' ? -1 : 1;
      });
  }, [searchQuery, selectedType, selectedCompensation]);

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

      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('communityHome.jobsTitle', 'Open Roles')}
            </h2>
            <p className="text-gray-600">
              {t(
                'communityHome.jobsDescription',
                'Browse internships and entry-level roles. Unpaid internships are listed first, followed by paid opportunities.'
              )}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Search roles</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Photography, marketing, community..."
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beach-300"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Role type</span>
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value as 'all' | JobType)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beach-300"
                >
                  <option value="all">All role types</option>
                  <option value="internship">Internships</option>
                  <option value="entry-level">Entry-level</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Compensation</span>
                <select
                  value={selectedCompensation}
                  onChange={(event) =>
                    setSelectedCompensation(event.target.value as 'all' | CompensationType)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beach-300"
                >
                  <option value="all">All compensation types</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-600">
              No roles match your filters yet. Try a different search term.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <article key={job.id} className="border border-gray-200 rounded-2xl p-6 shadow-sm bg-white">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${typeStyles[job.type]}`}
                    >
                      {typeLabels[job.type]}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${compensationStyles[job.compensation]}`}
                    >
                      {compensationLabels[job.compensation]}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{job.team}</p>
                  <p className="text-gray-600 mt-4">{job.summary}</p>
                  <p className="text-sm text-gray-500 mt-4">{job.location}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CommunityHome;
