import React from 'react';
import { Briefcase, GraduationCap, Instagram, Users, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';

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
      'University students in Rio who are organized and proactive',
      'Strong written communication in Portuguese; English is a plus',
      'Comfortable working in a startup-style environment'
    ],
    applyLink:
      'mailto:jobs@krlclosetclub.com?subject=Executive%20Assistant%20Application&body=Hi%20KRL%20Closet%20Club%2C%0A%0AI%20am%20applying%20for%20the%20Executive%20Assistant%20role.%0A%0AName%3A%0AUniversity%3A%0AWhatsApp%3A%0A%0AImmediate%20assignment%20submission%3A%0A',
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
      'Students who already create content for Instagram or Reels',
      'Strong visual taste and reliable posting habits',
      'Comfortable talking to people and filming in public'
    ],
    applyLink:
      'mailto:jobs@krlclosetclub.com?subject=Instagram%20Marketing%20Application&body=Hi%20KRL%20Closet%20Club%2C%0A%0AI%20am%20applying%20for%20the%20Instagram%20Marketing%20role.%0A%0AName%3A%0AUniversity%3A%0AInstagram%20handle%3A%0AWhatsApp%3A%0A%0APortfolio%20or%20sample%20links%3A%0A',
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
      'Students who enjoy in-person communication and sales-style outreach',
      'Confident, friendly, and resilient with follow-ups',
      'Portuguese fluency required; English helpful for mixed audiences'
    ],
    applyLink:
      'mailto:jobs@krlclosetclub.com?subject=Customer%20Relationships%20Application&body=Hi%20KRL%20Closet%20Club%2C%0A%0AI%20am%20applying%20for%20the%20Customer%20Relationships%20role.%0A%0AName%3A%0AUniversity%3A%0ANeighborhood%3A%0AWhatsApp%3A%0A%0ABrief%20note%20on%20why%20I%20fit%20this%20role%3A%0A',
    applyLabel: 'Apply for Customer Relationships'
  }
];

const Jobs: React.FC = () => {
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
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl">
            Join KRL Closet Club and build real work experience while earning income
          </h1>
          <p className="text-white/90 text-base md:text-lg mt-5 max-w-3xl">
            We are hiring motivated young people in Rio. These are entry-level roles with practical
            responsibilities, mentorship, and flexible schedules designed for student life.
          </p>
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
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                      {job.commitment}
                    </span>
                  </div>

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
