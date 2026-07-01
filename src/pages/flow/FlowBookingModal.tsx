import React, { useEffect } from 'react';
import FlowIcon from './FlowIcon';
import { openFlowBookingWhatsApp, type FlowBookingMessageDetails } from './flowUtils';

export interface FlowBookingDetails extends FlowBookingMessageDetails {
  image: string;
  /** Short supporting copy shown under the title, e.g. the experience description */
  note?: string;
}

interface FlowBookingModalProps {
  booking: FlowBookingDetails | null;
  onClose: () => void;
}

/**
 * Booking confirmation modal used across the FLOW. community Events page.
 * There's no booking backend — confirming just hands the visitor off to
 * WhatsApp with a pre-filled message to Juan, the community host.
 */
const FlowBookingModal: React.FC<FlowBookingModalProps> = ({ booking, onClose }) => {
  useEffect(() => {
    if (!booking) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [booking, onClose]);

  if (!booking) return null;

  const handleConfirm = () => {
    openFlowBookingWhatsApp(booking);
    onClose();
  };

  return (
    <div
      className="font-flow-body fixed inset-0 z-[999] flex items-end md:items-center justify-center bg-black/50 md:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${booking.title}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="relative h-40 flex-none">
          <img src={booking.image} alt={booking.title} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <FlowIcon name="close" className="text-lg" />
          </button>
          <div className="absolute top-3 left-3 bg-flow-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {booking.category}
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-flow-on-surface leading-tight">{booking.title}</h2>
            {booking.note && <p className="text-flow-secondary text-sm mt-1 line-clamp-3">{booking.note}</p>}
          </div>

          <div className="space-y-2 text-sm text-flow-on-surface-variant">
            <div className="flex items-center gap-2">
              <FlowIcon name="calendar_today" className="text-flow-primary text-base" />
              {booking.dateLabel}
            </div>
            {booking.timeLabel && (
              <div className="flex items-center gap-2">
                <FlowIcon name="schedule" className="text-flow-primary text-base" />
                {booking.timeLabel}
              </div>
            )}
            {booking.location && (
              <div className="flex items-center gap-2">
                <FlowIcon name="location_on" className="text-flow-primary text-base" />
                {booking.location}
              </div>
            )}
          </div>

          <p className="text-xs text-flow-secondary">
            Booking requests are handled directly by our community host, Juan, over WhatsApp — confirming
            below opens a chat with these details already filled in.
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 bg-flow-whatsapp text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <FlowIcon name="chat" filled />
              Message Juan on WhatsApp
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-flow-secondary font-bold rounded-xl hover:bg-flow-surface-container-low transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowBookingModal;
