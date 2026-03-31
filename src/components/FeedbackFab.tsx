/**
 * FeedbackFab — global floating action button for submitting user feedback.
 *
 * • Always visible on every page (rendered from App root via portal)
 * • No screenshot capability — text-only feedback
 * • Rate limited: MAX_PER_DAY submissions per 24-hour window (localStorage)
 * • PostHog tracking for all user interactions
 * • Submits feedback as a GitHub issue via Netlify function
 */
import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquarePlus, X, Bug, Lightbulb, MessageCircle, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { trackEvent } from '../services/posthogAnalyticsService';

// ---------------------------------------------------------------------------
// Rate-limit helpers (localStorage)
// ---------------------------------------------------------------------------
const RATE_LIMIT_KEY = 'ccc_feedback_submissions';
const MAX_PER_DAY = 3;
const DAY_MS = 86_400_000;

function getRecentSubmissions(): number[] {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return [];
    const all: number[] = JSON.parse(raw);
    return all.filter(t => Date.now() - t < DAY_MS);
  } catch {
    return [];
  }
}

function recordSubmission(): void {
  const recent = getRecentSubmissions();
  recent.push(Date.now());
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FeedbackType = 'bug' | 'feature' | 'other';

interface FeedbackTypeOption {
  id: FeedbackType;
  label: string;
  icon: React.FC<{ className?: string }>;
  placeholder: string;
}

const FEEDBACK_TYPES: FeedbackTypeOption[] = [
  {
    id: 'bug',
    label: 'Bug Report',
    icon: Bug,
    placeholder: 'e.g. "Clicking the discover button crashes the page on mobile"',
  },
  {
    id: 'feature',
    label: 'Feature Request',
    icon: Lightbulb,
    placeholder: 'e.g. "Show barraca opening hours in the map view"',
  },
  {
    id: 'other',
    label: 'Other',
    icon: MessageCircle,
    placeholder: 'Anything else you\'d like to share with us',
  },
];

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
interface FeedbackModalProps {
  onClose: () => void;
}

const FALLBACK_EMAIL = 'vincent.j.wilson317@gmail.com';

function feedbackTypeLabel(type: FeedbackType): string {
  return type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'General Feedback';
}

function openMailtoFallback(type: FeedbackType, title: string, description: string, email: string, page: string): void {
  const subject = encodeURIComponent(`[${feedbackTypeLabel(type)}] ${title}`);
  const bodyParts = [`Type: ${feedbackTypeLabel(type)}`, `Page: ${page}`, '', description];
  if (email) bodyParts.push('', `Contact: ${email}`);
  const body = encodeURIComponent(bodyParts.join('\n'));
  const mailtoUrl = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
  const isInstagram = /Instagram/.test(navigator.userAgent);
  if (isInstagram) {
    window.location.href = mailtoUrl;
  } else {
    window.open(mailtoUrl, '_self');
  }
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueUrl, setIssueUrl] = useState('');
  const [emailFallbackTriggered, setEmailFallbackTriggered] = useState(false);
  const [error, setError] = useState('');

  const recentSubmissions = getRecentSubmissions();
  const remaining = MAX_PER_DAY - recentSubmissions.length;
  const isRateLimited = remaining <= 0;

  const currentPage = typeof window !== 'undefined' ? window.location.pathname : '/';
  const selectedType = FEEDBACK_TYPES.find(t => t.id === type)!;

  const handleTypeChange = (newType: FeedbackType) => {
    setType(newType);
    setTitle('');
    setDescription('');
    setError('');
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRateLimited) {
      trackEvent('feedback_rate_limited', { type, page: currentPage });
      return;
    }

    if (!title.trim() || title.trim().length < 5) {
      setError('Please provide a title (at least 5 characters).');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Please describe the issue in more detail (at least 10 characters).');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/.netlify/functions/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          email: email.trim() || undefined,
          page: currentPage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error ${response.status}`);
      }

      recordSubmission();
      setIssueUrl(data.issueUrl || '');

      trackEvent('feedback_submitted', {
        type,
        page: currentPage,
        has_email: !!email.trim(),
        title_length: title.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      trackEvent('feedback_submit_error', { type, page: currentPage, error: message });
      openMailtoFallback(type, title.trim(), description.trim(), email.trim(), currentPage);
      setEmailFallbackTriggered(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [type, title, description, email, currentPage, isRateLimited]);

  // Email fallback state
  if (emailFallbackTriggered) {
    return (
      <div
        className="fixed inset-0 z-[200000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
          onClick={e => e.stopPropagation()}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Send className="h-9 w-9 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Email client opened</h2>
          <p className="text-gray-500 text-sm mb-6">
            Our feedback system is temporarily unavailable. Your feedback has been pre-filled in your email client — just hit send.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (issueUrl) {
    return (
      <div
        className="fixed inset-0 z-[200000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
          onClick={e => e.stopPropagation()}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-9 w-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Feedback received!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your feedback has been submitted as a GitHub issue and our team will review it shortly.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Send Feedback</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRateLimited
                ? 'Daily limit reached — try again tomorrow'
                : `${remaining} of ${MAX_PER_DAY} submissions left today`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close feedback"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {FEEDBACK_TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTypeChange(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  type === id
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="feedback-title" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="feedback-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isRateLimited || isSubmitting}
              maxLength={120}
              placeholder={selectedType.placeholder}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="feedback-description" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="feedback-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isRateLimited || isSubmitting}
              maxLength={2000}
              rows={4}
              placeholder="Describe the issue or idea in as much detail as possible. What did you expect? What happened instead?"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 resize-none disabled:opacity-50 disabled:bg-gray-50"
            />
            <p className="text-right text-xs text-gray-300 mt-1">{description.length}/2000</p>
          </div>

          {/* Email (optional) */}
          <div>
            <label htmlFor="feedback-email" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Email{' '}
              <span className="text-gray-400 font-normal">
                (optional — we'll notify you when the fix ships)
              </span>
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isRateLimited || isSubmitting}
              maxLength={200}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Page info (read-only) */}
          <p className="text-xs text-gray-400">
            Page: <code className="font-mono bg-gray-100 px-1 rounded">{currentPage}</code>
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isRateLimited || isSubmitting || !title.trim() || !description.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {isRateLimited ? 'Daily limit reached' : 'Submit Feedback'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// FAB button
// ---------------------------------------------------------------------------
const FeedbackFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    trackEvent('feedback_fab_opened', { page: typeof window !== 'undefined' ? window.location.pathname : '/' });
  };

  const handleClose = () => setIsOpen(false);

  return createPortal(
    <>
      {/* Floating button — bottom-left, stays above most UI */}
      <button
        onClick={handleOpen}
        className="fixed bottom-5 left-5 z-[100000] h-12 rounded-full bg-pink-500 text-white shadow-lg flex items-center gap-2 pl-4 pr-5 hover:bg-pink-600 hover:scale-[1.02] active:scale-95 transition-all select-none"
        aria-label="Send feedback"
        title="Send feedback"
      >
        <MessageSquarePlus className="h-5 w-5 flex-shrink-0" />
        <span className="text-xs font-semibold whitespace-nowrap">Submit Feedback</span>
      </button>

      {isOpen && <FeedbackModal onClose={handleClose} />}
    </>,
    document.body,
  );
};

export default FeedbackFab;
