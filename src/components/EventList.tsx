import React, { useState } from 'react';
import { BarracaEvent } from '../types';
import EventCard from './EventCard';
import EventStoryViewer from './EventStoryViewer';

interface EventListProps {
  events: BarracaEvent[];
  title?: string;
  maxEvents?: number;
  showViewAll?: boolean;
}

const EventList: React.FC<EventListProps> = ({ 
  events, 
  title = "Previous Events",
  maxEvents,
  showViewAll = true
}) => {
  const [selectedEvent, setSelectedEvent] = useState<BarracaEvent | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Filter active events and sort by date (most recent first)
  const activeEvents = events
    .filter(event => event.isActive)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (activeEvents.length === 0) {
    return null;
  }

  // Determine which events to show
  const displayEvents = maxEvents && !showAll 
    ? activeEvents.slice(0, maxEvents)
    : activeEvents;

  const hasMoreEvents = maxEvents && activeEvents.length > maxEvents && !showAll;

  const handleStoryClick = (event: BarracaEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseStoryViewer = () => {
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          {hasMoreEvents && showViewAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-beach-600 hover:text-beach-700 text-sm font-medium"
            >
              View All ({activeEvents.length})
            </button>
          )}
        </div>

        {/* Events Grid */}
        <div className="space-y-3">
          {displayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onStoryClick={handleStoryClick}
            />
          ))}
        </div>

        {/* Show Less Button */}
        {showAll && maxEvents && showViewAll && (
          <div className="text-center pt-2">
            <button
              onClick={() => setShowAll(false)}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Show Less
            </button>
          </div>
        )}

        {/* No Events Message */}
        {displayEvents.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No events to display</p>
          </div>
        )}
      </div>

      {/* Event Story Viewer */}
      {selectedEvent && (
        <EventStoryViewer
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={handleCloseStoryViewer}
        />
      )}
    </>
  );
};

export default EventList;