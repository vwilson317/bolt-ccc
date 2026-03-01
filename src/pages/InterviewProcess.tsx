import React, { useEffect } from 'react';
import { CheckCircle2, Handshake, MessageSquare, Target, ClipboardCheck } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { trackEvent } from '../services/posthogAnalyticsService';

const processSteps = [
  {
    title: 'Apply and Introduce Yourself',
    description:
      'Send a short WhatsApp message with your background, university status, and which role you want.'
  },
  {
    title: 'Receive the Partnership Brief',
    description:
      'You will get a concise challenge brief focused on one business goal: progressing a partnership conversation with Mudo Lingo.'
  },
  {
    title: 'Execute in Your Role Style',
    description:
      'Show how you can contribute through your lane, such as outreach support, social amplification, stakeholder follow-up, or relationship management.'
  },
  {
    title: 'Submit Clear Evidence',
    description:
      'Share concrete outputs: messages sent, responses received, meeting progress, and next-step commitments.'
  },
  {
    title: 'Final Evaluation and Offer Decision',
    description:
      'Candidates are evaluated on professionalism, consistency, and measurable progress toward the partnership goal.'
  }
];

const interviewStartMessage = encodeURIComponent(
  'Hi CC Club, I want to start the interview process.\n\n' +
    'Role interested in:\n' +
    'Name:\n' +
    'University:\n' +
    'Age:\n' +
    'Interest (optional):\n' +
    'Background:'
);

const InterviewProcess: React.FC = () => {
  useEffect(() => {
    trackEvent('interview_process_page_viewed', {
      page_path: '/interview-process',
      process_step_count: processSteps.length
    });
  }, []);

  const handleStartInterviewClick = () => {
    trackEvent('interview_process_start_clicked', {
      page_path: '/interview-process'
    });
  };

  const handleResourceClick = () => {
    trackEvent('interview_resource_clicked', {
      page_path: '/interview-process',
      resource_name: 'mundo_lingo_rio',
      resource_url: 'https://mundolingo.org/Rio-de-Janeiro'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <SEOHead
        title="Interview Process | CC Club"
        description="Learn the CC Club interview process and practical challenge centered on partnership progress."
      />

      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-beach-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm font-medium mb-5">
            <Handshake className="h-4 w-4" />
            Practical interview evaluation
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl">Interview Process</h1>
          <p className="text-white/90 text-base md:text-lg mt-5 max-w-3xl">
            We hire based on real execution, not only resumes. Our current interview challenge is tied
            to one strategic objective: helping move a potential partnership with Mudo Lingo forward.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <div className="space-y-4">
              {processSteps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-beach-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-white rounded-2xl border border-gray-200 p-6">
              <Target className="h-6 w-6 text-beach-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluation Focus</h3>
              <p className="text-gray-700">
                We look for initiative, communication quality, follow-through, and ability to create real
                partnership momentum.
              </p>
            </article>
            <article className="bg-white rounded-2xl border border-gray-200 p-6">
              <MessageSquare className="h-6 w-6 text-beach-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Standard</h3>
              <p className="text-gray-700">
                Keep communication respectful and organized. We value candidates who document actions and
                handle outreach with maturity.
              </p>
            </article>
            <article className="bg-white rounded-2xl border border-gray-200 p-6">
              <ClipboardCheck className="h-6 w-6 text-beach-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Offer Criteria</h3>
              <p className="text-gray-700">
                Strong candidates can earn priority hiring based on measurable progress. Securing the Mudo
                Lingo partnership receives top consideration for role placement.
              </p>
            </article>
          </div>

          <div className="mt-8 bg-beach-50 border border-beach-100 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-beach-700" />
              Ready to start
            </h3>
            <p className="text-gray-700 mb-4">
              Send your role choice and a short introduction on WhatsApp. We will reply with the current
              challenge brief and success criteria.
            </p>
            <a
              href={`https://wa.me/16789826137?text=${interviewStartMessage}`}
              onClick={handleStartInterviewClick}
              className="inline-flex items-center justify-center rounded-xl bg-beach-600 hover:bg-beach-700 text-white font-semibold px-5 py-3 transition-colors duration-200"
            >
              Start Interview Process
            </a>
          </div>

          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Resources for Interview Task</h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                Mundo Lingo Rio page:{' '}
                <a
                  href="https://mundolingo.org/Rio-de-Janeiro"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleResourceClick}
                  className="text-beach-700 hover:text-beach-800 underline"
                >
                  https://mundolingo.org/Rio-de-Janeiro
                </a>
              </li>
              <li>City manager contact name: Polina Feofanova (from the website contact page)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InterviewProcess;
