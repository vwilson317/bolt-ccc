# Analytics & Performance Dashboard Setup Guide

> Generated after the page-load performance optimization (route-level code splitting,
> carousel lazy-loading, Font Awesome CDN removal).
> Use this document to configure PostHog, Google Analytics 4, and Sentry dashboards
> so you can measure the impact of those changes and monitor ongoing health.

---

## Table of Contents

1. [Environment Variables Checklist](#1-environment-variables-checklist)
2. [PostHog Dashboards](#2-posthog-dashboards)
3. [Google Analytics 4 Dashboards](#3-google-analytics-4-dashboards)
4. [Sentry Dashboards](#4-sentry-dashboards)
5. [Web Vitals — Gap & Fix](#5-web-vitals--gap--fix)
6. [Full Event Inventory](#6-full-event-inventory)
7. [Feature Flags Reference](#7-feature-flags-reference)
8. [Notes & Known Issues](#8-notes--known-issues)

---

## 1. Environment Variables Checklist

Before any dashboard receives data, confirm all secrets are set in Netlify
(Site → Environment variables).

| Variable | Used by | Required |
|---|---|---|
| `VITE_POSTHOG_API_KEY` | PostHog | ✅ |
| `VITE_POSTHOG_API_HOST` | PostHog | optional (defaults to `https://app.posthog.com`) |
| `VITE_GA_MEASUREMENT_ID` | GA4 event tracking | ✅ |
| `VITE_GA_PROPERTY_ID` | GA4 Data API | ✅ |
| `VITE_GA_ACCESS_TOKEN` | GA4 Data API (Netlify function) | ✅ |
| `VITE_GA_CLIENT_ID` | GA4 OAuth alternative | optional |
| `VITE_SENTRY_DSN` | Sentry | ✅ |
| `SENTRY_AUTH_TOKEN` | Sentry source-map uploads | ✅ for prod |
| `SENTRY_ORG` | Sentry vite plugin | optional (defaults to `carioca-coastal-club`) |
| `SENTRY_PROJECT` | Sentry vite plugin | optional (defaults to `javascript-react`) |

---

## 2. PostHog Dashboards

**PostHog URL**: https://app.posthog.com
**Persistence**: `localStorage` | **DNT respected**: yes | **Autocapture**: on

### 2a. Create a "Page Load Performance" Dashboard

> **Purpose**: measure the before/after of the optimizations shipped in this PR.

1. Go to **Dashboards → New dashboard** → name it `Page Load Performance`.
2. Add the following **Insights** (each is a separate tile):

---

#### Tile 1 — Performance metric: JS bundle parse time
- **Insight type**: Trend
- **Event filter**: `performance_metric`
- **Filter**: `metric = js_bundle_parse_time` (or whatever key your `trackPerformance` call uses)
- **Breakdown**: none
- **Display**: Line chart, rolling 7-day average
- **Goal**: line should drop after deploy

> **Note**: if you add the Web Vitals integration (see §5) these tiles become
> much more meaningful. Until then, `performance_metric` events are the proxy.

---

#### Tile 2 — Barraca page views per session
- **Insight type**: Trend
- **Event**: `barraca_viewed`
- **Formula**: event count / unique sessions
- **Display**: Line chart

---

#### Tile 3 — Unique visitor count (total)
- **Insight type**: Trend
- **Event**: `unique_visitor`
- **Breakdown**: none
- **Display**: Number (big number tile)

---

#### Tile 4 — Page views per route
- **Insight type**: Trend
- **Event**: `$pageview`
- **Breakdown by**: `$pathname`
- **Display**: Bar chart

---

#### Tile 5 — Session recording rate (to confirm replays are flowing)
- **Insight type**: Trend
- **Event**: `$session_recording_start` (built-in PostHog event)
- **Display**: Number

---

### 2b. Create a "Funnel — Barraca Discovery → Contact" Dashboard

1. **Dashboards → New dashboard** → `Conversion Funnel`.
2. Add one **Funnel** insight:

| Step | Event |
|---|---|
| 1 | `$pageview` where `$pathname = /discover` |
| 2 | `barraca_viewed` |
| 3 | `barraca_filter_applied` |
| 4 | `cta_clicked` |
| 5 | `email_subscription` |

- **Conversion window**: 1 day
- **Display**: Funnel steps

---

### 2c. Create a "Engagement" Dashboard

Add these insights to a new `Engagement` dashboard:

| Tile | Event | Aggregation |
|---|---|---|
| Story views | `story_viewed` | total per day |
| Story shares | `story_shared` | breakdown by `platform` |
| Photo gallery views | `photo_gallery_viewed` | total |
| Photo lightbox opens | `photo_lightbox_opened` | total |
| Photo downloads | `photo_downloaded` | total |
| Language switches | `language_changed` | breakdown by `to_language` |
| CTA clicks | `cta_clicked` | breakdown by `cta_type` |

---

### 2d. PostHog Feature Flags Setup

Go to **Feature Flags → New flag** and create the following (these mirror the
hard-coded flags in `StoryContext.tsx` — moving them to PostHog lets you toggle
without a deploy):

| Flag key | Default | Notes |
|---|---|---|
| `enable-story-banner` | `false` | Currently disabled in code |
| `enable-push-notifications` | `false` | Currently disabled in code |
| `enable-chair-reservation` | `true` | Currently enabled |
| `custom-cta-buttons` | `true` | Currently enabled |

> **⚠️ Note**: until the code reads these flags from PostHog (via
> `posthog.isFeatureEnabled()`), toggling them here has no effect. See
> §8 for the recommended migration path.

---

### 2e. PostHog Alerts

Set up **Alerts** (Notifications → Alerts) for:

| Alert | Condition |
|---|---|
| Error spike | `error_occurred` > 10 in 1 hour |
| Zero page views | `$pageview` = 0 over 2 hours (site down indicator) |
| Admin login failures | `admin_login` where `success = false` > 3 in 1 hour |
| Photo load errors spike | `photo_load_error` > 20 in 1 hour |

---

## 3. Google Analytics 4 Dashboards

**Property**: set via `VITE_GA_MEASUREMENT_ID`
**Site speed sample rate**: 100%

### 3a. GA4 Explorations — Page Load Performance

1. Go to **Explore → Blank exploration** → name it `Performance`.
2. **Dimensions**: `Page path`, `Device category`, `Country`
3. **Metrics**: `Engagement rate`, `Average engagement time`, `Event count`
4. **Segment**: Users who triggered `performance_metric` event

---

### 3b. GA4 Custom Reports — Barraca Engagement

In **Reports → Library → Create new report**:

| Report | Dimensions | Metrics |
|---|---|---|
| Barraca views | Event label (barracaName) | Event count |
| Search terms | Event label (searchTerm) | Event count |
| Filter usage | Event label (filterType) | Event count |

---

### 3c. GA4 Conversion Events

Mark the following as **Conversions** (Admin → Events → Mark as conversion):

| Event name | Why |
|---|---|
| `email_subscription` | Primary goal — loyalty sign-ups |
| `barraca_registration_submitted` | Vendor acquisition |
| `story_shared` | Virality signal |

---

### 3d. GA4 Audiences

Create the following **Audiences** (Admin → Audiences → New):

| Audience | Condition |
|---|---|
| Engaged visitors | `barraca_viewed` ≥ 3 in a session |
| High-intent visitors | `cta_clicked` and then `email_subscription` in same session |
| Mobile users | `device_category = mobile` |
| Repeat visitors | session_number ≥ 2 |

---

### 3e. GA4 — Unique Visitor Counter Note

> **⚠️ Important**: The app uses a **browser fingerprint + localStorage** counter
> stored in `ccc_visitor_data` / `ccc_visited_ids`. It seeds with `5247` as an
> initial offset. This counter is **not** tied to real GA4 user counts and will
> diverge. The GA4 `newUsers` metric (queried via the Data API at
> `/netlify/functions/ga4-api`) is the authoritative source.
> Consider removing the localStorage seed offset and binding `UniqueVisitorCounter`
> directly to the GA4 API response instead.

---

## 4. Sentry Dashboards

**Sentry URL**: https://sentry.io
**Session sample rate**: 10% prod / 100% dev
**Error sample rate**: 100%
**Replay rate**: 10% all sessions, 100% sessions with errors

### 4a. Sentry Performance Dashboard

1. Go to **Performance** tab.
2. Set **Transaction** filter to your project.
3. Key transactions to watch after the optimization deploy:

| Transaction | Metric to watch | Expected direction |
|---|---|---|
| Page load (`/`) | P75 LCP | ↓ (should drop with code splitting) |
| Page load (`/discover`) | P75 TTI | ↓ |
| `/register` route chunk load | Duration | confirm it's deferred |
| Carousel image fetch | Duration | ↓ (only 1 image fetched at load) |

---

### 4b. Sentry Issues — Triage Tags

The codebase tags every Sentry error with a `context` label. Use **Saved Searches** for:

| Search | Saved name |
|---|---|
| `tags[context]:barraca` | Barraca errors |
| `tags[context]:weather` | Weather errors |
| `tags[context]:story` | Story errors |
| `tags[context]:analytics` | Analytics init errors |
| `tags[context]:supabase` | DB errors |
| `tags[level]:warning` | Warnings only |

---

### 4c. Sentry Alerts

Create **Alert rules** (Alerts → Create alert):

| Alert | Condition | Action |
|---|---|---|
| High error rate | Error events > 20/min | Email + Slack |
| New issue | Any new issue in prod | Email |
| P95 page load > 5s | Performance threshold breached | Email |
| Replay rate drop | Sessions < 5 in 1h | Email (possible outage) |

---

## 5. Web Vitals — Gap & Fix

> **Current state**: Core Web Vitals (LCP, FID/INP, CLS, TTFB, FCP) are **not
> explicitly captured** by the app. Sentry's browser tracing gives approximate
> page-load timing but not the standardized CWV scores that Lighthouse and
> Google Search Console use.

### Recommended fix — add `web-vitals` library

```bash
npm install web-vitals
```

Create `/src/utils/webVitals.ts`:

```typescript
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { trackPerformance } from '../services/analyticsService';
import { trackPerformanceMetric } from '../services/posthogAnalyticsService';

type Metric = { name: string; value: number; rating: 'good' | 'needs-improvement' | 'poor' };

function send(metric: Metric) {
  // Send to GA4
  trackPerformance(metric.name, Math.round(metric.value));
  // Send to PostHog
  trackPerformanceMetric(metric.name, Math.round(metric.value));
}

export function initWebVitals() {
  onCLS(send);
  onFCP(send);
  onINP(send);
  onLCP(send);
  onTTFB(send);
}
```

Then call `initWebVitals()` from `src/main.tsx` after `initSentry()`.

Once live, add a PostHog insight per metric:

| Metric | Good threshold | Needs improvement | Poor |
|---|---|---|---|
| LCP | ≤ 2500 ms | 2500–4000 ms | > 4000 ms |
| CLS | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| INP | ≤ 200 ms | 200–500 ms | > 500 ms |
| FCP | ≤ 1800 ms | 1800–3000 ms | > 3000 ms |
| TTFB | ≤ 800 ms | 800–1800 ms | > 1800 ms |

---

## 6. Full Event Inventory

### 6a. PostHog Events (34 total)

| Event name | Category | Key properties |
|---|---|---|
| `$pageview` | Navigation | `$current_url`, `$pathname`, `$title`, `$referrer` |
| `barraca_viewed` | Barraca | `barraca_id`, `barraca_name`, `partnered` |
| `barraca_filter_applied` | Barraca | `filter_type`, `filter_value` |
| `barraca_search` | Barraca | `search_term` |
| `barraca_status_changed` | Barraca | `barraca_id`, `old_status`, `new_status`, `reason` |
| `weather_viewed` | Weather | `location` |
| `weather_refreshed` | Weather | `location` |
| `weather_override_toggled` | Weather | `active`, `expires_at` |
| `story_viewed` | Story | `story_id`, `story_title` |
| `story_shared` | Story | `story_id`, `story_title`, `platform` |
| `email_subscription` | User | `email`, `preferences` |
| `language_changed` | User | `from_language`, `to_language` |
| `admin_login` | Admin | `success`, `admin_type` |
| `admin_action` | Admin | `action`, `details` |
| `notification_permission` | Notification | `granted` |
| `notification_token_saved` | Notification | `success` |
| `performance_metric` | Performance | `metric`, `value` |
| `error_occurred` | Error | `error`, `context` |
| `cta_clicked` | CTA | `cta_type`, `cta_text`, `page` |
| `photo_gallery_viewed` | Photo Gallery | `gallery_id`, `gallery_title`, `photo_count` |
| `photo_viewed` | Photo Gallery | `photo_id`, `photo_title`, `gallery_id`, `view_mode` |
| `photo_lightbox_opened` | Photo Gallery | `photo_id`, `photo_title`, `gallery_id` |
| `photo_lightbox_closed` | Photo Gallery | `photo_id`, `photo_title`, `gallery_id` |
| `photo_navigation` | Photo Gallery | `direction`, `photo_id`, `gallery_id` |
| `photo_downloaded` | Photo Gallery | `photo_id`, `photo_title`, `gallery_id` |
| `photo_shared` | Photo Gallery | `photo_id`, `photo_title`, `gallery_id`, `share_method` |
| `photo_archive_clicked` | Photo Gallery | `archive_url`, `gallery_id` |
| `photo_load_error` | Photo Gallery | `photo_url`, `gallery_id` |
| `photo_load_success` | Photo Gallery | `photo_url`, `gallery_id` |
| `barraca_registration_viewed` | Registration | — |
| `barraca_registration_submitted` | Registration | `success`, `amenities_count`, `partnerships_count` |
| `community_home_viewed` | Community | `page`, `project_count` |
| `community_project_action_clicked` | Community | `action_type`, `project_id`, `project_name`, `target_type` |
| `unique_visitor` | User | `visitor_id`, `total_count` |

---

### 6b. Google Analytics 4 Event Categories (32 total)

| Category | Key actions tracked |
|---|---|
| Barraca | View, Filter, Search, Status change, Manual status, Special override |
| Weather | View, Refresh, Override, Dependent barracas updated |
| Story | View, Share |
| User | Email subscription, Language change, Session, Unique visitor |
| Admin | Login, Action, Barraca management, Weather override |
| Notification | Permission, Token saved, Received, Clicked |
| Weekend Hours | View, Toggle |
| Performance | Generic metric value |
| Error | Error string + context |
| User Journey | Step tracking |
| Device | Type (mobile/desktop), Screen size |
| Engagement | Time on page, Scroll depth |
| CTA | Click (type + text + page) |
| External Link | Click (URL + source page) |
| Social | Share (platform + content) |
| Form | Submission (name + outcome) |
| PWA | Install prompt outcome |
| Firestore | Connection, Sync |
| Supabase | Query (table + operation + outcome) |
| Realtime | Subscription status |
| Feature | Usage |
| Business | Custom metrics |
| Photo Gallery | View, Photo view, Lightbox, Navigation, Download, Share, Archive click, Load errors |
| Barraca Registration | Form view, Start, Field interaction, Validation, Partnership selection, Contact preference, Photo upload, Submit, Abandonment |
| Registration Marquee | View, Instagram click, Barraca click |
| Cloudflare | Image load (time), Image error, Service status |
| Language | Per-language action |
| Translation | Key usage |
| Partnered Barraca | Various |
| Non-Partnered Barraca | Various |
| External API | Endpoint calls, Status updates |
| Feature Adoption | Feature name + adopted/skipped + user type |
| Feature Discovery | Feature name + discovery method |

---

## 7. Feature Flags Reference

These flags live in `src/contexts/StoryContext.tsx` as hard-coded booleans.

| Flag | Current value | Controls |
|---|---|---|
| `enableStoryBanner` | `false` ❌ | StoryCarousel, StoryBanner, StoryViewer renders |
| `enableChairReservation` | `true` ✅ | Chair reservation CTA in BarracaGrid / Detail |
| `enablePushNotifications` | `false` ❌ | Push notification permission prompt |
| `customCtaButtons` | `true` ✅ | CTAButtonGroup alternate layout |

> **Recommended**: migrate these to PostHog Feature Flags so they can be toggled
> without a redeployment and can be rolled out to percentage audiences.

---

## 8. Notes & Known Issues

### 8a. Dual analytics system (GA4 + PostHog duplication)

Every user action fires **both** a GA4 event and an equivalent PostHog event.
This means you are paying for two analytics platforms to store identical data.
Consider:
- Keeping **PostHog** for product analytics / funnels / session replay
- Keeping **GA4** only for SEO / Search Console integration and aggregated audiences
- Deprecating the 1,133-line `analyticsService.ts` in favour of PostHog where
  GA4 specific data isn't needed

---

### 8b. Unique visitor counter seeded with fake offset

`UniqueVisitorCounter.tsx` starts the counter at **5,247** (hard-coded offset in
localStorage). This inflates reported visitor counts. The GA4 Data API
(`/netlify/functions/ga4-api`) returns real `newUsers` counts — consider using
that as the sole source of truth and removing the localStorage fingerprint system.

---

### 8c. PostHog sanitize_properties strips URLs

The PostHog config removes `$current_url` and `$pathname` from all events via
`sanitize_properties`. This prevents you from filtering PostHog insights by page
URL. Either remove the sanitizer or explicitly pass the path as a custom property
on every event where page context matters.

---

### 8d. Sentry session sample rate is 10% in production

Only 1 in 10 sessions generates a Sentry replay. If you notice a bug that's hard
to reproduce, temporarily bump `sessionSampleRate` in `src/utils/sentry.ts` to
`1.0`, reproduce it, then lower it back.

---

### 8e. GA4 Access Token rotation

`VITE_GA_ACCESS_TOKEN` used by the Netlify function is a static token. Google
OAuth2 access tokens expire after **1 hour**. If the token is a short-lived
access token (not a service account key), the GA4 Data API calls will silently
fail after expiry. Use a **service account JSON key** (environment variable
`GA_SERVICE_ACCOUNT_KEY`) and exchange it server-side for a token on each
Netlify function invocation.

---

### 8f. No Web Vitals instrumentation

Core Web Vitals (LCP, CLS, INP, FCP, TTFB) are not captured. See §5 for the
two-file fix. This is the highest-value gap to close because CWV directly
affects Google Search ranking and gives you objective before/after data for
the performance optimizations in this PR.

---

### 8g. Font Awesome removal (from this PR)

The Font Awesome 6.4 CDN stylesheet (`~30 KB CSS + blocking CDN round-trip`) was
removed and replaced with the `<MapPin>` icon from `lucide-react` in
`WeatherMarquee.tsx`. If any future component re-introduces an `<i class="fa-...">`,
it will render as invisible text. Grep for `fa-` before assuming FA is available.

---

### 8h. PostHog `property_blacklist` vs. `sanitize_properties` conflict

The config sets both `property_blacklist: ['$initial_referrer', ...]` and a
custom `sanitize_properties` function. The function takes precedence and drops
`$current_url`/`$pathname` from **all** events. The `property_blacklist` array
only applies to identify calls. Audit the sanitizer before adding new events that
need URL context.

---

*Last updated: 2026-02-25 — post page-load performance optimizations*
