import React, { useEffect } from 'react';
import {
  Clock,
  Wifi,
  MessageSquare,
  XCircle,
  Users,
  Armchair,
  CreditCard,
  Music,
  Shield,
  Handshake,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { trackEvent } from '../services/posthogAnalyticsService';

const barracaPartners = [
  {
    area: 'Leme',
    accounts: [
      { handle: 'j.c_beach_point_23', url: 'https://www.instagram.com/j.c_beach_point_23?igsh=MWFqN21veDZzOGhxcQ==' },
      { handle: 'rasta.beach', url: 'https://www.instagram.com/rasta.beach?igsh=MXR5ZDRybnVtZmN2aQ==' },
    ],
  },
  {
    area: 'Copa',
    accounts: [
      { handle: 'barracasolmar99', url: 'https://www.instagram.com/barracasolmar99?igsh=MXcyMDJ0aHk3bnJxeA==' },
      { handle: 'barraca155', url: 'https://www.instagram.com/barraca155?igsh=MWdoaWJzNGtrMjNnbw==' },
    ],
  },
  {
    area: 'Arpoador',
    accounts: [
      { handle: 'barracaecologica26', url: 'https://www.instagram.com/barracaecologica26?igsh=MWV3c2RwYnl0dW5yYg==' },
      { handle: 'marciooliverrio23', url: 'https://www.instagram.com/marciooliverrio23?igsh=NTN1Nm45enduYTI0' },
    ],
  },
  {
    area: 'Ipanema',
    accounts: [
      { handle: 'barracadojota86x', url: 'https://www.instagram.com/barracadojota86x?igsh=bTQyaDd0ejBvdGU=' },
      { handle: 'nildobarracado', url: 'https://www.instagram.com/nildobarracado?igsh=dHNnOGQ0YXo0MGtu' },
      { handle: 'escritoriocarioca', url: 'https://www.instagram.com/escritoriocarioca?igsh=MXE1eWd3NTFqNDN6Nw==' },
    ],
  },
  {
    area: 'Leblon',
    accounts: [
      { handle: 'nembarraca145', url: 'https://www.instagram.com/nembarraca145?igsh=MXVranBraDZremxteQ==' },
      { handle: 'rainhadoleblon', url: 'https://www.instagram.com/rainhadoleblon?igsh=NzNscWpzNmZ2cDJw' },
    ],
  },
  {
    area: 'São Conrado',
    accounts: [
      { handle: 'hulkposto13', url: 'https://www.instagram.com/hulkposto13?igsh=cDZoaG5vc3NzcW0=' },
    ],
  },
];

const guidelines = [
  {
    number: 1,
    icon: Clock,
    title: 'Be On Time (Non-Negotiable)',
    critical: false,
    content: (
      <div className="space-y-3">
        <p className="text-gray-700">If you say you'll be there at a certain time, be there.</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            5–10 minutes late = fine
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            Anything beyond that = not acceptable
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            No vague ETAs
          </li>
        </ul>
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm">
          Once you set a time, you are responsible for showing up.
        </div>
      </div>
    ),
  },
  {
    number: 2,
    icon: Wifi,
    title: 'Go "Online" — Signal You\'re Live',
    critical: false,
    content: (
      <div className="space-y-3">
        <p className="text-gray-700">Once you arrive:</p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            Drop a live location pin
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            Take a photo of the setup
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            Send it to me → I'll post it
          </li>
        </ul>
        <div className="mt-3 bg-beach-50 border border-beach-100 rounded-xl px-4 py-3 text-beach-800 text-sm font-medium">
          Use: "Carioca Coastal Club is online"
        </div>
        <p className="text-gray-600 text-sm italic">No pin = it didn't happen.</p>
      </div>
    ),
  },
  {
    number: 3,
    icon: MessageSquare,
    title: 'Communication Rules — Keep It Tight',
    critical: false,
    content: (
      <div className="space-y-3">
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            <span><strong>Before</strong> → clear time + place</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            <span><strong>After arrival</strong> → stop messaging</span>
          </li>
        </ul>
        <div className="mt-3 bg-gray-900 text-white rounded-xl px-4 py-3 text-sm space-y-1">
          <p>You are not there to text.</p>
          <p>You are there to host.</p>
        </div>
      </div>
    ),
  },
  {
    number: 4,
    icon: XCircle,
    title: 'No RSVP Culture',
    critical: false,
    content: (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800 text-sm font-semibold">
          Do NOT ask people to RSVP, react, or confirm attendance.
        </div>
        <div>
          <p className="text-gray-700 font-medium mb-2">Why:</p>
          <ul className="space-y-1.5 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
              People don't engage unless others already have
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
              It creates the appearance that nothing is happening
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
              It adds unnecessary noise to the group
            </li>
          </ul>
        </div>
        <div className="mt-2 space-y-1 text-gray-700">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Reality:</p>
          <p>If someone is coming, they will message you directly.</p>
          <p>Your job is not to chase attendance.<br />Your job is to be there reliably.</p>
        </div>
      </div>
    ),
  },
  {
    number: 5,
    icon: Users,
    title: 'Host Energy — Facilitation',
    critical: false,
    content: (
      <div className="space-y-3">
        <p className="text-gray-700 font-medium">You are the connector.</p>
        <ul className="space-y-2 text-gray-700">
          {['Greet people', 'Pull in anyone who looks lost', 'Introduce people', 'Invite outsiders'].map(item => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-beach-600 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-3 bg-beach-50 border border-beach-100 rounded-xl px-4 py-3 text-beach-800 text-sm font-medium">
          "Hey, this is Carioca Coastal Club — come join us."
        </div>
      </div>
    ),
  },
  {
    number: 6,
    icon: Armchair,
    title: 'Chairs & Setup',
    critical: false,
    content: (
      <div className="space-y-3">
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            8 CC Club chairs = free
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            First come, first served
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            You are not responsible for pricing
          </li>
        </ul>
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm">
          If anything is off → message me
        </div>
      </div>
    ),
  },
  {
    number: 7,
    icon: CreditCard,
    title: 'Payments',
    critical: true,
    content: (
      <div className="space-y-3">
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
            Everyone pays their own tab
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
            No group tab
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
            No splitting later
          </li>
        </ul>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm font-medium">
          Tell people: Order → wait → pay → return
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800 text-sm">
          If you don't enforce this → <strong>you will be stuck with the bill</strong>
        </div>
      </div>
    ),
  },
  {
    number: 8,
    icon: Music,
    title: 'Activities = Better Events',
    critical: false,
    content: (
      <div className="space-y-3">
        <p className="text-gray-700 font-medium">Bring energy:</p>
        <div className="grid grid-cols-2 gap-2">
          {['Music (ideal)', 'Games / cards', 'Speaker / guitar', 'Icebreakers'].map(item => (
            <div key={item} className="bg-beach-50 border border-beach-100 rounded-lg px-3 py-2 text-beach-800 text-sm">
              {item}
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mt-1">Optional:</p>
        <ul className="space-y-1 text-gray-700 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
            Potluck
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
            Themes (sunset, social, etc.)
          </li>
        </ul>
      </div>
    ),
  },
  {
    number: 9,
    icon: Shield,
    title: 'Hosting Structure',
    critical: false,
    content: (
      <div className="space-y-3">
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            Primary host = runs it
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
            Secondary = supports
          </li>
        </ul>
        <div className="space-y-2">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm">
            At least one host must be <strong>physically there</strong>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm">
            No indirect coordination
          </div>
        </div>
      </div>
    ),
  },
];

const HostingGuidelines: React.FC = () => {
  useEffect(() => {
    trackEvent('hosting_guidelines_page_viewed', { page_path: '/hosting-guidelines' });
  }, []);

  const handleInstagramClick = (handle: string, url: string) => {
    trackEvent('barraca_partner_instagram_clicked', { handle, url, page_path: '/hosting-guidelines' });
    const isInstagramBrowser = /Instagram/.test(navigator.userAgent);
    if (isInstagramBrowser) {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <SEOHead
        title="Hosting Guidelines | Carioca Coastal Club"
        description="Guidelines for CC Club hosts — punctuality, payments, energy, and barraca partnerships."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-beach-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <p className="text-3xl mb-3">🌴</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Carioca Coastal Club<br />Hosting Guidelines
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            Your job is simple: create a reliable, welcoming experience.
          </p>
        </div>
      </section>

      {/* Guidelines */}
      <section className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {guidelines.map(({ number, icon: Icon, title, critical, content }) => (
            <article
              key={number}
              className={`bg-white rounded-2xl border shadow-sm p-6 ${
                critical ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    critical ? 'bg-red-600 text-white' : 'bg-beach-600 text-white'
                  }`}
                >
                  {number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${critical ? 'text-red-600' : 'text-beach-600'}`} />
                    <h2 className="text-lg font-bold text-gray-900">
                      {title}
                      {critical && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          CRITICAL
                        </span>
                      )}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="pl-[3.25rem]">{content}</div>
            </article>
          ))}

          {/* Section 10 — Keep the Group Clean / Partnership Manager */}
          <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-beach-600 text-white">
                10
              </div>
              <div className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-beach-600" />
                <h2 className="text-lg font-bold text-gray-900">Keep the Group Clean</h2>
              </div>
            </div>

            <div className="pl-[3.25rem] space-y-5">
              {/* Partnership manager announcement */}
              <div className="bg-ocean-50 border border-ocean-100 rounded-xl px-4 py-4 space-y-3">
                <p className="text-gray-700">
                  I'm assigning <strong>Barraca Partnership Managers</strong> for each location.
                </p>
                <p className="text-gray-700 text-sm">Each person is responsible for:</p>
                <ul className="space-y-1.5 text-gray-700 text-sm">
                  {[
                    'Day-to-day communication with the barraca',
                    'Negotiating prices and agreements',
                    'Managing the relationship overall',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-ocean-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-600 text-sm">
                  Ideally pick a barraca near where you live — you'll personally benefit from the partnership too.
                </p>
              </div>

              {/* Commission callout */}
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm font-medium">
                Any partnership or deal you broker = <strong>100% commission to you.</strong> I won't take a dime.
              </div>

              {/* Bigger goal */}
              <p className="text-gray-700 text-sm">
                The bigger goal: expand CC Club across all key beach areas — Copa, Leblon, multiple in Ipanema,
                Arpoador, and other high-traffic zones. This is how we build real presence and consistency.
              </p>

              {/* Barraca list */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-beach-600" />
                  <p className="font-semibold text-gray-900">Current barraca suggestions by area</p>
                </div>
                <div className="space-y-4">
                  {barracaPartners.map(({ area, accounts }) => (
                    <div key={area}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{area}</p>
                      <div className="space-y-2">
                        {accounts.map(({ handle, url }) => (
                          <button
                            key={handle}
                            onClick={() => handleInstagramClick(handle, url)}
                            className="flex items-center gap-2 text-sm text-beach-700 hover:text-beach-800 font-medium group"
                          >
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                              </svg>
                            </span>
                            @{handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                One person per barraca for now. If you have a friend who'd be a great fit, add them to the group
                and we'll sort it out together.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default HostingGuidelines;
