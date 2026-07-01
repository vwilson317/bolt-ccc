import React, { useMemo, useState } from 'react';
import SEOHead from '../../components/SEOHead';
import FlowShell from './FlowShell';
import FlowIcon from './FlowIcon';
import FlowBookingModal, { type FlowBookingDetails } from './FlowBookingModal';
import { openFlowCommunityWhatsApp } from './flowUtils';
import { communityEvents, experiences, type FlowCommunityEvent } from './flowData';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATEGORY_FILTERS = ['All Events', 'Tours', 'Meetups', 'Parties'] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const CATEGORY_TO_SINGULAR: Partial<Record<CategoryFilter, FlowCommunityEvent['category']>> = {
  Tours: 'Tour',
  Meetups: 'Meetup',
  Parties: 'Party',
};

const CATEGORY_COLOR: Record<FlowCommunityEvent['category'], string> = {
  Tour: 'bg-flow-primary-container text-flow-on-primary-container',
  Meetup: 'bg-flow-primary text-white',
  Party: 'bg-flow-secondary text-white',
};

function buildMonthCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first grid
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const FEATURED_EXPERIENCE = experiences.find((exp) => exp.id === 'helicopter-tour') ?? experiences[0];

const FlowEventsCalendar: React.FC = () => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All Events');
  const [booking, setBooking] = useState<FlowBookingDetails | null>(null);

  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('en-US', { month: 'long' });
  const monthShort = viewDate.toLocaleString('en-US', { month: 'short' });

  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, FlowCommunityEvent>();
    communityEvents.forEach((ev) => map.set(ev.day, ev));
    return map;
  }, []);

  const filteredEvents = communityEvents.filter((ev) => {
    const wanted = CATEGORY_TO_SINGULAR[activeFilter];
    return !wanted || ev.category === wanted;
  });

  const openEventBooking = (ev: FlowCommunityEvent) => {
    const eventDate = new Date(year, month, ev.day);
    setBooking({
      title: ev.title,
      category: ev.category,
      dateLabel: eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      timeLabel: ev.time,
      location: ev.location,
      image: ev.image,
    });
  };

  const openFeaturedTourBooking = () => {
    if (!FEATURED_EXPERIENCE) return;
    setBooking({
      title: FEATURED_EXPERIENCE.title,
      category: FEATURED_EXPERIENCE.category,
      dateLabel: `${monthName} 5, ${year}`,
      timeLabel: '3:00 PM',
      image: FEATURED_EXPERIENCE.image,
      note: FEATURED_EXPERIENCE.description,
    });
  };

  return (
    <FlowShell active="events">
      <SEOHead
        title="Events | FLOW. community"
        description="Discover tours, meetups, and parties happening this month in Rio de Janeiro."
      />
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[32px] leading-[40px] font-bold tracking-[-0.01em] mb-2">Community Calendar</h1>
            <p className="text-flow-secondary">Discover tours, meetups, and parties happening this month.</p>
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto flow-hide-scrollbar">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-flow-primary text-white shadow-sm'
                    : 'bg-flow-secondary-container text-flow-on-secondary-container hover:opacity-80'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-8 bg-white border border-flow-outline-variant rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <div className="p-6 border-b border-flow-outline-variant flex items-center justify-between">
              <h2 className="text-2xl leading-8 font-bold">
                <span className="text-flow-primary">{monthName}</span> {year}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setMonthOffset((o) => o - 1)}
                  aria-label="Previous month"
                  className="p-2 rounded-lg hover:bg-flow-surface-container transition-colors border border-flow-outline-variant"
                >
                  <FlowIcon name="chevron_left" className="text-flow-primary" />
                </button>
                <button
                  onClick={() => setMonthOffset((o) => o + 1)}
                  aria-label="Next month"
                  className="p-2 rounded-lg hover:bg-flow-surface-container transition-colors border border-flow-outline-variant"
                >
                  <FlowIcon name="chevron_right" className="text-flow-primary" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center border-b border-flow-outline-variant bg-flow-surface-container-low">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-3 font-bold text-xs text-flow-secondary uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                const ev = day ? eventsByDay.get(day) : undefined;
                return (
                  <div
                    key={i}
                    className={`border-r border-b border-flow-outline-variant p-2 md:p-3 min-h-[90px] md:min-h-[110px] flex flex-col items-start ${
                      day ? 'hover:bg-flow-surface-container-low transition-colors' : 'opacity-30'
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`font-bold text-sm ${ev ? 'text-flow-primary' : 'text-flow-secondary'}`}>
                          {day}
                        </span>
                        {ev && (
                          <button
                            onClick={() => openEventBooking(ev)}
                            title={`Book ${ev.title}`}
                            className={`mt-2 p-1.5 rounded-lg text-[10px] md:text-xs font-bold truncate w-full text-left ${CATEGORY_COLOR[ev.category]}`}
                          >
                            {ev.title}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-flow-primary p-8 rounded-xl text-white shadow-lg relative overflow-hidden">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-6">
                <FlowIcon name="chat" className="text-white" filled />
              </div>
              <h3 className="text-2xl leading-8 font-bold mb-3">Join our WhatsApp</h3>
              <p className="opacity-90 mb-6">
                Get instant updates on new gatherings, last-minute spots, and community news.
              </p>
              <button
                onClick={openFlowCommunityWhatsApp}
                className="inline-flex items-center gap-2 bg-white text-flow-primary px-6 py-3 rounded-full font-bold active:scale-95 transition-all"
              >
                Join Community
                <FlowIcon name="arrow_forward" className="text-sm" />
              </button>
            </div>

            {FEATURED_EXPERIENCE && (
              <div className="bg-white border border-flow-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="h-48 relative">
                  <img
                    src={FEATURED_EXPERIENCE.image}
                    alt={FEATURED_EXPERIENCE.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-flow-primary text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                    Featured Tour
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-flow-primary mb-2">
                    <FlowIcon name="calendar_today" className="text-base" />
                    <span className="text-xs font-bold uppercase tracking-wider">{monthShort} 05 • 3:00 PM</span>
                  </div>
                  <h4 className="text-2xl leading-8 font-bold mb-3">{FEATURED_EXPERIENCE.title}</h4>
                  <p className="text-flow-secondary mb-6 line-clamp-2">{FEATURED_EXPERIENCE.description}</p>
                  <button
                    onClick={openFeaturedTourBooking}
                    className="w-full py-4 bg-flow-primary text-white font-bold rounded-lg hover:opacity-90 transition-all"
                  >
                    Book Your Seat
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-flow-surface-container p-6 rounded-xl border border-flow-outline-variant text-center">
                <div className="text-2xl leading-8 font-bold text-flow-primary">{communityEvents.length}+</div>
                <div className="text-xs text-flow-secondary uppercase mt-1">Events this month</div>
              </div>
              <div className="bg-flow-surface-container p-6 rounded-xl border border-flow-outline-variant text-center">
                <div className="text-2xl leading-8 font-bold text-flow-primary">450+</div>
                <div className="text-xs text-flow-secondary uppercase mt-1">Active members</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming list */}
        <section className="mt-16">
          <h3 className="text-2xl leading-8 font-bold mb-8 flex items-center gap-3">
            Upcoming Premium Experiences
            <span className="h-px flex-1 bg-flow-outline-variant" />
          </h3>
          {filteredEvents.length === 0 ? (
            <p className="text-flow-secondary">No events in this category yet — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="group bg-white border border-flow-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 w-12 h-12 bg-white/90 backdrop-blur rounded-lg flex flex-col items-center justify-center text-flow-primary shadow-sm">
                      <span className="font-bold text-base leading-none">{ev.day}</span>
                      <span className="text-[8px] uppercase">{monthShort}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-bold text-flow-primary mb-1 uppercase">{ev.category}</div>
                    <h5 className="font-bold leading-tight group-hover:text-flow-primary transition-colors">
                      {ev.title}
                    </h5>
                    <p className="text-flow-secondary text-sm mt-1">
                      {ev.location} • {ev.time}
                    </p>
                    <button
                      onClick={() => openEventBooking(ev)}
                      className="mt-3 w-full py-2.5 bg-flow-primary text-white font-bold text-sm rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                    >
                      Book
                      <FlowIcon name="arrow_forward" className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <FlowBookingModal booking={booking} onClose={() => setBooking(null)} />
    </FlowShell>
  );
};

export default FlowEventsCalendar;
