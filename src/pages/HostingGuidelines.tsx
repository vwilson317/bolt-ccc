import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  trackHostingGuidelinesView,
  trackHostingGuidelinesSectionRead,
  trackHostingBarracaPartnerClick,
} from '../services/posthogAnalyticsService';

const barracaPartners = [
  {
    areaKey: 'leme' as const,
    accounts: [
      { handle: 'j.c_beach_point_23', url: 'https://www.instagram.com/j.c_beach_point_23?igsh=MWFqN21veDZzOGhxcQ==' },
      { handle: 'rasta.beach', url: 'https://www.instagram.com/rasta.beach?igsh=MXR5ZDRybnVtZmN2aQ==' },
    ],
  },
  {
    areaKey: 'copa' as const,
    accounts: [
      { handle: 'barracasolmar99', url: 'https://www.instagram.com/barracasolmar99?igsh=MXcyMDJ0aHk3bnJxeA==' },
      { handle: 'barraca155', url: 'https://www.instagram.com/barraca155?igsh=MWdoaWJzNGtrMjNnbw==' },
    ],
  },
  {
    areaKey: 'arpoador' as const,
    accounts: [
      { handle: 'barracaecologica26', url: 'https://www.instagram.com/barracaecologica26?igsh=MWV3c2RwYnl0dW5yYg==' },
      { handle: 'marciooliverrio23', url: 'https://www.instagram.com/marciooliverrio23?igsh=NTN1Nm45enduYTI0' },
    ],
  },
  {
    areaKey: 'ipanema' as const,
    accounts: [
      { handle: 'barracadojota86x', url: 'https://www.instagram.com/barracadojota86x?igsh=bTQyaDd0ejBvdGU=' },
      { handle: 'nildobarracado', url: 'https://www.instagram.com/nildobarracado?igsh=dHNnOGQ0YXo0MGtu' },
      { handle: 'escritoriocarioca', url: 'https://www.instagram.com/escritoriocarioca?igsh=MXE1eWd3NTFqNDN6Nw==' },
    ],
  },
  {
    areaKey: 'leblon' as const,
    accounts: [
      { handle: 'nembarraca145', url: 'https://www.instagram.com/nembarraca145?igsh=MXVranBraDZremxteQ==' },
      { handle: 'rainhadoleblon', url: 'https://www.instagram.com/rainhadoleblon?igsh=NzNscWpzNmZ2cDJw' },
    ],
  },
  {
    areaKey: 'saoConrado' as const,
    accounts: [
      { handle: 'hulkposto13', url: 'https://www.instagram.com/hulkposto13?igsh=cDZoaG5vc3NzcW0=' },
    ],
  },
];

// Fires once per section when it scrolls into view
function useSectionObserver(sectionNumber: number, sectionTitle: string) {
  const ref = useRef<HTMLElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          trackHostingGuidelinesSectionRead(sectionNumber, sectionTitle);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionNumber, sectionTitle]);

  return ref;
}

const HostingGuidelines: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    trackHostingGuidelinesView();
  }, []);

  const handleInstagramClick = (handle: string, url: string, area: string) => {
    trackHostingBarracaPartnerClick(handle, area);
    const isInstagramBrowser = /Instagram/.test(navigator.userAgent);
    if (isInstagramBrowser) {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Individual section refs for scroll tracking
  const ref1 = useSectionObserver(1, t('hostingGuidelines.g1.title'));
  const ref2 = useSectionObserver(2, t('hostingGuidelines.g2.title'));
  const ref3 = useSectionObserver(3, t('hostingGuidelines.g3.title'));
  const ref4 = useSectionObserver(4, t('hostingGuidelines.g4.title'));
  const ref5 = useSectionObserver(5, t('hostingGuidelines.g5.title'));
  const ref6 = useSectionObserver(6, t('hostingGuidelines.g6.title'));
  const ref7 = useSectionObserver(7, t('hostingGuidelines.g7.title'));
  const ref8 = useSectionObserver(8, t('hostingGuidelines.g8.title'));
  const ref9 = useSectionObserver(9, t('hostingGuidelines.g9.title'));
  const ref10 = useSectionObserver(10, t('hostingGuidelines.g10.title'));

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <SEOHead
        title={t('hostingGuidelines.seoTitle')}
        description={t('hostingGuidelines.seoDescription')}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-beach-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <p className="text-3xl mb-3">🌴</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            {t('hostingGuidelines.hero.title')}
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            {t('hostingGuidelines.hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* 1 — Be On Time */}
          <article ref={ref1} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={1} icon={Clock} title={t('hostingGuidelines.g1.title')} />
            <div className="pl-[3.25rem] space-y-3">
              <p className="text-gray-700">{t('hostingGuidelines.g1.intro')}</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  {t('hostingGuidelines.g1.lateOk')}
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  {t('hostingGuidelines.g1.lateBad')}
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  {t('hostingGuidelines.g1.noEta')}
                </li>
              </ul>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm">
                {t('hostingGuidelines.g1.rule')}
              </div>
            </div>
          </article>

          {/* 2 — Go Online */}
          <article ref={ref2} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={2} icon={Wifi} title={t('hostingGuidelines.g2.title')} />
            <div className="pl-[3.25rem] space-y-3">
              <p className="text-gray-700">{t('hostingGuidelines.g2.intro')}</p>
              <ul className="space-y-2 text-gray-700">
                {(['dropPin', 'takePhoto', 'sendToMe'] as const).map(key => (
                  <li key={key} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
                    {t(`hostingGuidelines.g2.${key}`)}
                  </li>
                ))}
              </ul>
              <div className="bg-beach-50 border border-beach-100 rounded-xl px-4 py-3 text-beach-800 text-sm font-medium">
                {t('hostingGuidelines.g2.signal')}
              </div>
              <p className="text-gray-600 text-sm italic">{t('hostingGuidelines.g2.noPin')}</p>
            </div>
          </article>

          {/* 3 — Communication */}
          <article ref={ref3} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={3} icon={MessageSquare} title={t('hostingGuidelines.g3.title')} />
            <div className="pl-[3.25rem] space-y-3">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('hostingGuidelines.g3.before').replace('→', '<strong>→</strong>') }} />
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('hostingGuidelines.g3.after').replace('→', '<strong>→</strong>') }} />
                </li>
              </ul>
              <div className="bg-gray-900 text-white rounded-xl px-4 py-3 text-sm space-y-1">
                <p>{t('hostingGuidelines.g3.rule1')}</p>
                <p>{t('hostingGuidelines.g3.rule2')}</p>
              </div>
            </div>
          </article>

          {/* 4 — No RSVP */}
          <article ref={ref4} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={4} icon={XCircle} title={t('hostingGuidelines.g4.title')} />
            <div className="pl-[3.25rem] space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800 text-sm font-semibold">
                {t('hostingGuidelines.g4.doNot')}
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-2">{t('hostingGuidelines.g4.why')}</p>
                <ul className="space-y-1.5 text-gray-700 text-sm">
                  {(['reason1', 'reason2', 'reason3'] as const).map(key => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                      {t(`hostingGuidelines.g4.${key}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1 text-gray-700">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('hostingGuidelines.g4.reality')}</p>
                <p>{t('hostingGuidelines.g4.ifComing')}</p>
                <p>
                  {t('hostingGuidelines.g4.job1')}<br />
                  {t('hostingGuidelines.g4.job2')}
                </p>
              </div>
            </div>
          </article>

          {/* 5 — Host Energy */}
          <article ref={ref5} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={5} icon={Users} title={t('hostingGuidelines.g5.title')} />
            <div className="pl-[3.25rem] space-y-3">
              <p className="text-gray-700 font-medium">{t('hostingGuidelines.g5.youAre')}</p>
              <ul className="space-y-2 text-gray-700">
                {(['greet', 'pull', 'introduce', 'invite'] as const).map(key => (
                  <li key={key} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-beach-600 flex-shrink-0" />
                    {t(`hostingGuidelines.g5.${key}`)}
                  </li>
                ))}
              </ul>
              <div className="bg-beach-50 border border-beach-100 rounded-xl px-4 py-3 text-beach-800 text-sm font-medium">
                {t('hostingGuidelines.g5.phrase')}
              </div>
            </div>
          </article>

          {/* 6 — Chairs */}
          <article ref={ref6} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={6} icon={Armchair} title={t('hostingGuidelines.g6.title')} />
            <div className="pl-[3.25rem] space-y-3">
              <ul className="space-y-2 text-gray-700">
                {(['chairs', 'firstCome', 'notResponsible'] as const).map(key => (
                  <li key={key} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
                    {t(`hostingGuidelines.g6.${key}`)}
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm">
                {t('hostingGuidelines.g6.ifOff')}
              </div>
            </div>
          </article>

          {/* 7 — Payments (CRITICAL) */}
          <article ref={ref7} className="bg-white rounded-2xl border border-red-200 ring-1 ring-red-100 shadow-sm p-6">
            <CardHeader number={7} icon={CreditCard} title={t('hostingGuidelines.g7.title')} critical criticalLabel={t('hostingGuidelines.critical')} />
            <div className="pl-[3.25rem] space-y-3">
              <ul className="space-y-2 text-gray-700">
                {(['ownTab', 'noGroup', 'noSplit'] as const).map(key => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                    {t(`hostingGuidelines.g7.${key}`)}
                  </li>
                ))}
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm font-medium">
                {t('hostingGuidelines.g7.order')}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800 text-sm">
                {t('hostingGuidelines.g7.warning')}
              </div>
            </div>
          </article>

          {/* 8 — Activities */}
          <article ref={ref8} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={8} icon={Music} title={t('hostingGuidelines.g8.title')} />
            <div className="pl-[3.25rem] space-y-3">
              <p className="text-gray-700 font-medium">{t('hostingGuidelines.g8.energy')}</p>
              <div className="grid grid-cols-2 gap-2">
                {(['music', 'games', 'speaker', 'icebreakers'] as const).map(key => (
                  <div key={key} className="bg-beach-50 border border-beach-100 rounded-lg px-3 py-2 text-beach-800 text-sm">
                    {t(`hostingGuidelines.g8.${key}`)}
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t('hostingGuidelines.g8.optional')}</p>
              <ul className="space-y-1 text-gray-700 text-sm">
                {(['potluck', 'themes'] as const).map(key => (
                  <li key={key} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    {t(`hostingGuidelines.g8.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* 9 — Hosting Structure */}
          <article ref={ref9} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={9} icon={Shield} title={t('hostingGuidelines.g9.title')} />
            <div className="pl-[3.25rem] space-y-3">
              <ul className="space-y-2 text-gray-700">
                {(['primary', 'secondary'] as const).map(key => (
                  <li key={key} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-beach-600 flex-shrink-0 mt-0.5" />
                    {t(`hostingGuidelines.g9.${key}`)}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm">
                  {t('hostingGuidelines.g9.mustBePhysical')}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm">
                  {t('hostingGuidelines.g9.noIndirect')}
                </div>
              </div>
            </div>
          </article>

          {/* 10 — Keep Group Clean / Partnership Manager */}
          <article ref={ref10} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <CardHeader number={10} icon={Handshake} title={t('hostingGuidelines.g10.title')} />
            <div className="pl-[3.25rem] space-y-5">
              <div className="bg-ocean-50 border border-ocean-100 rounded-xl px-4 py-4 space-y-3">
                <p className="text-gray-700">{t('hostingGuidelines.g10.assigning')}</p>
                <p className="text-gray-700 text-sm">{t('hostingGuidelines.g10.responsible')}</p>
                <ul className="space-y-1.5 text-gray-700 text-sm">
                  {(['dayToDay', 'negotiate', 'manage'] as const).map(key => (
                    <li key={key} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-ocean-600 flex-shrink-0 mt-0.5" />
                      {t(`hostingGuidelines.g10.${key}`)}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-600 text-sm">{t('hostingGuidelines.g10.ideally')}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm font-medium">
                {t('hostingGuidelines.g10.commission')}
              </div>

              <p className="text-gray-700 text-sm">{t('hostingGuidelines.g10.bigGoal')}</p>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-beach-600" />
                  <p className="font-semibold text-gray-900">{t('hostingGuidelines.g10.suggestions')}</p>
                </div>
                <div className="space-y-4">
                  {barracaPartners.map(({ areaKey, accounts }) => (
                    <div key={areaKey}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        {t(`hostingGuidelines.areas.${areaKey}`)}
                      </p>
                      <div className="space-y-2">
                        {accounts.map(({ handle, url }) => (
                          <button
                            key={handle}
                            onClick={() => handleInstagramClick(handle, url, t(`hostingGuidelines.areas.${areaKey}`))}
                            className="flex items-center gap-2 text-sm text-beach-700 hover:text-beach-800 font-medium"
                          >
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
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

              <p className="text-gray-600 text-sm">{t('hostingGuidelines.g10.onePerBarraca')}</p>
            </div>
          </article>

        </div>
      </section>
    </div>
  );
};

// ─── Shared card header ───────────────────────────────────────────────────────

interface CardHeaderProps {
  number: number;
  icon: React.FC<{ className?: string }>;
  title: string;
  critical?: boolean;
  criticalLabel?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ number, icon: Icon, title, critical, criticalLabel }) => (
  <div className="flex items-start gap-4 mb-4">
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        critical ? 'bg-red-600 text-white' : 'bg-beach-600 text-white'
      }`}
    >
      {number}
    </div>
    <div className="flex items-center gap-2 flex-wrap pt-1.5">
      <Icon className={`h-5 w-5 flex-shrink-0 ${critical ? 'text-red-600' : 'text-beach-600'}`} />
      <h2 className="text-lg font-bold text-gray-900">
        {title}
        {critical && criticalLabel && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
            <AlertTriangle className="h-3 w-3" />
            {criticalLabel}
          </span>
        )}
      </h2>
    </div>
  </div>
);

export default HostingGuidelines;
