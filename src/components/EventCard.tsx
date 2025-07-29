import React from 'react';
import { Calendar, Camera, Play } from 'lucide-react';
import { BarracaEvent } from '../types';

interface EventCardProps {
  event: BarracaEvent;
  onStoryClick: (event: BarracaEvent) => void;
  showStoryCircle?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onStoryClick, 
  showStoryCircle = true 
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with story circle and event info */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Story Circle for Mobile */}
          {showStoryCircle && event.highlightPhotos.length > 0 && (
            <button
              onClick={() => onStoryClick(event)}
              className="relative w-12 h-12 rounded-full overflow-hidden hover:scale-105 transition-transform duration-200 md:hidden"
              aria-label={`View ${event.title} photos`}
            >
              {/* Gradient Ring */}
              <div className="absolute inset-0 rounded-full p-0.5 bg-gradient-to-r from-beach-400 via-beach-500 to-ocean-600">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={event.highlightPhotos[0]?.url || '/api/placeholder/100/100'}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              
              {/* Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full">
                <div className="bg-white/90 rounded-full p-1">
                  <Play className="h-2 w-2 text-beach-500 fill-current" />
                </div>
              </div>

              {/* Photo Count Badge */}
              {event.photos.length > 1 && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-beach-500 to-ocean-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium shadow-lg">
                  {event.photos.length}
                </div>
              )}
            </button>
          )}

          {/* Event Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base">
              {event.title}
            </h3>
            <div className="flex items-center text-gray-500 text-xs md:text-sm mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(event.date)}</span>
              <span className="mx-2">•</span>
              <span>{formatTimeAgo(event.date)}</span>
            </div>
          </div>
        </div>

        {/* Desktop Story Button */}
        {showStoryCircle && event.highlightPhotos.length > 0 && (
          <button
            onClick={() => onStoryClick(event)}
            className="hidden md:flex items-center space-x-2 px-3 py-2 bg-beach-50 text-beach-700 rounded-lg hover:bg-beach-100 transition-colors"
          >
            <Camera className="h-4 w-4" />
            <span className="text-sm font-medium">{event.photos.length} photos</span>
          </button>
        )}
      </div>

      {/* Highlight Photos Grid (Desktop) */}
      {event.highlightPhotos.length > 0 && (
        <div className="hidden md:block px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {event.highlightPhotos.slice(0, 6).map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onStoryClick(event)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `${event.title} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Show "+" overlay on last photo if there are more */}
                {index === 5 && event.photos.length > 6 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{event.photos.length - 6}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Description */}
      {event.description && (
        <div className="px-4 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {event.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventCard;