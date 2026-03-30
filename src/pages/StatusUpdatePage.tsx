import React from 'react';
import { TrendingUp, TrendingDown, BarChart2, CalendarDays, Tag, Minus } from 'lucide-react';
import { statusUpdates, StatusUpdate, PostMetric } from '../data/statusUpdateData';
import SEOHead from '../components/SEOHead';

// ─── Single metric pill ───────────────────────────────────────────────────────

const MetricCard: React.FC<{ metric: PostMetric }> = ({ metric }) => {
  const DeltaIcon =
    metric.delta === undefined
      ? Minus
      : metric.positive
      ? TrendingUp
      : TrendingDown;

  const deltaColor =
    metric.delta === undefined
      ? 'text-gray-500'
      : metric.positive
      ? 'text-emerald-400'
      : 'text-red-400';

  return (
    <div className="flex flex-col gap-1 bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 min-w-[130px]">
      <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
        {metric.label}
      </span>
      <span className="text-2xl font-bold text-white font-display">{metric.value}</span>
      {metric.delta && (
        <span className={`flex items-center gap-1 text-xs font-semibold ${deltaColor}`}>
          <DeltaIcon className="w-3 h-3" />
          {metric.delta}
        </span>
      )}
    </div>
  );
};

// ─── Single update section ────────────────────────────────────────────────────

const UpdateSection: React.FC<{ update: StatusUpdate; index: number }> = ({ update, index }) => {
  const isEven = index % 2 === 0;
  const hasMetrics = update.metrics && update.metrics.length > 0;
  const hasHighlights = update.highlights && update.highlights.length > 0;
  const hasTags = update.tags && update.tags.length > 0;

  return (
    <section
      id={update.id}
      className="py-16 md:py-24 border-b border-gray-800 last:border-b-0"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row — alternates alignment on desktop */}
        <div
          className={`flex flex-col gap-6 mb-10 ${
            isEven ? 'md:flex-row' : 'md:flex-row-reverse'
          } items-start`}
        >
          {/* Icon block */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-beach-600 to-ocean-700 border-4 border-beach-500 shadow-xl shadow-beach-900/30 flex items-center justify-center">
              <BarChart2 className="w-9 h-9 md:w-12 md:h-12 text-white/80" />
            </div>
          </div>

          {/* Title + meta */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-beach-900/60 text-beach-300 text-xs font-semibold tracking-wide uppercase mb-3 border border-beach-700/40">
              <CalendarDays className="w-3 h-3" />
              {update.weekLabel}
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
              {update.headline}
            </h2>

            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl whitespace-pre-line">
              {update.body}
            </p>
          </div>
        </div>

        {/* Highlights */}
        {hasHighlights && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Highlights
            </h3>
            <ul className="space-y-3">
              {update.highlights!.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-base">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-beach-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metrics grid */}
        {hasMetrics && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Post Metrics
            </h3>
            <div className="flex flex-wrap gap-3">
              {update.metrics!.map((m, i) => (
                <MetricCard key={i} metric={m} />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {hasTags && (
          <div className="flex flex-wrap gap-2 mt-8">
            {update.tags!.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs font-medium border border-gray-700"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const StatusUpdatePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SEOHead
        title="Status Updates – Carioca Coastal Club"
        description="Weekly status updates and post metrics from Carioca Coastal Club."
        image="/logo-sq.jpeg"
        type="website"
      />

      {/* ── Hero ── */}
      <div className="relative pt-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-32 -left-32 w-96 h-96 bg-beach-600/20 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-0 right-0 w-80 h-80 bg-ocean-600/15 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-beach-500/60" />
            <span className="text-beach-400 text-xs font-bold uppercase tracking-widest">
              Carioca Coastal Club
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-beach-500/60" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white text-center font-display leading-tight mb-4">
            Status{' '}
            <span className="bg-gradient-to-r from-beach-400 to-beach-300 bg-clip-text text-transparent">
              Updates
            </span>
          </h1>

          <p className="text-center text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Weekly recaps and metrics — what's happening, what's working, and where we're headed.
          </p>

          {/* Quick-nav chips */}
          {statusUpdates.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {statusUpdates.map((u) => (
                <a
                  key={u.id}
                  href={`#${u.id}`}
                  className="px-4 py-2 rounded-full border border-gray-700 text-gray-300 text-sm font-medium hover:border-beach-500 hover:text-beach-300 transition-colors duration-200"
                >
                  {u.weekLabel}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Update sections ── */}
      <div className="border-t border-gray-800">
        {statusUpdates.map((update, index) => (
          <UpdateSection key={update.id} update={update} index={index} />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-gray-800 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <BarChart2 className="w-10 h-10 text-beach-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3 font-display">
            Stay in the loop
          </h2>
          <p className="text-gray-400">
            Updates drop here weekly. Share the link or bookmark it to follow along.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdatePage;
