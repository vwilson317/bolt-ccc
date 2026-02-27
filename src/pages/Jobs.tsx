import React, { useEffect } from 'react';
import { Briefcase, GraduationCap, Instagram, Users, CheckCircle2, QrCode, Code2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { trackEvent } from '../services/posthogAnalyticsService';

type JobListing = {
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

const jobs: JobListing[] = [
  {
    title: 'Executive Assistant to the CEO',
    icon: Briefcase,
    commitment: 'Part-time, flexible hours (Rio-based)',
    pay: 'Entry-level stipend + paid trial assignment',
    summary:
      'Work directly with the founder to keep operations moving fast: scheduling, follow-ups, and execution support.',
    responsibilities: [
      'Manage calendar, messages, and daily priority tracking',
      'Create weekly action summaries and keep tasks organized',
      'Support outreach and coordination with partners'
    ],
    idealFor: [
      'Rio-based candidates; Brazilian background and university enrollment are strong advantages',
      'Strong written communication in Portuguese; English is a plus',
      'Comfortable working in a startup-style environment'
    ],
    applyLink:
      'https://wa.me/16789826137?text=Hi%20KRL%20Closet%20Club%2C%20I%20want%20to%20apply%20for%20the%20Executive%20Assistant%20role.',
    applyLabel: 'Apply for Executive Assistant'
  },
  {
    title: 'Social Media (Instagram) Marketing Assistant',
    icon: Instagram,
    commitment: 'Part-time, field + remote mix',
    pay: 'Base stipend + growth bonus based on performance',
    summary:
      'Help us grow awareness and engagement on Instagram with consistent content and local storytelling.',
    responsibilities: [
      'Capture and edit short-form content at beach locations',
      'Plan weekly posting calendar and caption drafts',
      'Track follower growth, saves, shares, and campaign outcomes'
    ],
    idealFor: [
      'Rio-based candidates; Brazilian background and university enrollment are strong advantages',
      'Students who already create content for Instagram or Reels',
      'Strong visual taste and reliable posting habits',
      'Comfortable talking to people and filming in public'
    ],
    applyLink:
      'https://wa.me/16789826137?text=Hi%20KRL%20Closet%20Club%2C%20I%20want%20to%20apply%20for%20the%20Instagram%20Marketing%20role.',
    applyLabel: 'Apply for Instagram Marketing'
  },
  {
    title: 'Customer Relationships Representative',
    icon: Users,
    commitment: 'Part-time, mostly in-person (Rio beaches)',
    pay: 'Base stipend + signup bonus incentives',
    summary:
      'Meet barraca teams directly, explain KRL Closet Club offerings, and help onboard new partners.',
    responsibilities: [
      'Visit barracas, build trust, and introduce partnership benefits',
      'Support registration conversations and onboarding follow-through',
      'Collect feedback from operators to improve our service'
    ],
    idealFor: [
      'Rio-based candidates; Brazilian background and university enrollment are strong advantages',
      'Students who enjoy in-person communication and sales-style outreach',
      'Confident, friendly, and resilient with follow-ups',
      'Portuguese fluency required; English helpful for mixed audiences'
    ],
    applyLink:
      'https://wa.me/16789826137?text=Hi%20KRL%20Closet%20Club%2C%20I%20want%20to%20apply%20for%20the%20Customer%20Relationships%20role.',
    applyLabel: 'Apply for Customer Relationships'
  },
  {
    title: 'Street Activation & QR Outreach Ambassador',
    icon: QrCode,
    commitment: 'Part-time, in-person activation shifts (Rio beaches)',
    pay: 'Entry-level stipend + performance incentives',
    summary:
      'Engage people in high-traffic beach areas, invite them to scan the QR code, and represent the KRL Closet Club mission with confidence and energy.',
    responsibilities: [
      'Approach beachgoers and explain the value of scanning the KRL Closet Club QR code',
      'Share the brand mission clearly and answer common questions',
      'Track daily scan activity and feedback from conversations'
    ],
    idealFor: [
      'Rio-based candidates; Brazilian background and university enrollment are strong advantages',
      'Comfortable speaking with new people and maintaining positive energy',
      'Reliable, coachable, and motivated by measurable outreach results'
    ],
    applyLink:
      'https://wa.me/16789826137?text=Hi%20KRL%20Closet%20Club%2C%20I%20want%20to%20apply%20for%20the%20Street%20Activation%20%26%20QR%20Outreach%20Ambassador%20role.',
    applyLabel: 'Apply for QR Outreach'
  },
  {
    title: 'Software Engineering Intern (Mission AI)',
    icon: Code2,
    commitment: 'Part-time, remote-first with flexible schedule',
    pay: 'Entry-level stipend',
    summary:
      'Support Mission AI and product development through coding tasks, small feature builds, bug fixes, and implementation support across the platform.',
    responsibilities: [
      'Work on practical coding tasks with clear guidance from the team',
      'Help ship small features and fixes in the web product',
      'Document progress and communicate blockers early'
    ],
    idealFor: [
      'No prior professional experience required',
      'General interest in software engineering and willingness to learn fast',
      'Must have access to your own computer and be a trustworthy, reliable person'
    ],
    applyLink:
      'https://wa.me/16789826137?text=Hi%20KRL%20Closet%20Club%2C%20I%20want%20to%20apply%20for%20the%20Software%20Engineering%20Intern%20(Mission%20AI)%20role.',
    applyLabel: 'Apply for Engineering Intern'
  }
];

const Jobs: React.FC = () => {
  useEffect(() => {
    trackEvent('jobs_page_viewed', {
      page_path: '/jobs',
      role_count: jobs.length
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
        title="Jobs | KRL Closet Club"
        description="Open opportunities at KRL Closet Club in Rio de Janeiro for university students and early-career talent."
      />

      <section className="bg-gradient-to-br from-beach-600 via-beach-500 to-sunset-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1 text-sm font-medium mb-5">
            <GraduationCap className="h-4 w-4" />
            Rio opportunities for university students
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl">Join CC club</h1>
          <p className="text-white/90 text-base md:text-lg mt-5 max-w-3xl">
            We are hiring motivated young people in Rio. Every role on this page is entry-level,
            with practical responsibilities, mentorship, and flexible schedules designed for student life.
          </p>
          <div className="mt-6 max-w-3xl rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm md:text-base text-white/95">
            We especially want to hear from candidates who live in Rio. Being Brazilian and currently in university is a strong plus for these openings.
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {jobs.map((job) => {
              const Icon = job.icon;
              return (
                <article key={job.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-beach-50 text-beach-700 flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-beach-700 bg-beach-50 rounded-full px-3 py-1">
                        Entry-level
                      </span>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                        {job.commitment}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 -mt-2 mb-4">
                    Rio-based applicants preferred
                  </p>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <p className="text-sm font-medium text-beach-700 mb-3">{job.pay}</p>
                  <p className="text-gray-700 leading-relaxed mb-5">{job.summary}</p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">What you will do</h3>
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
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Ideal candidate</h3>
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
