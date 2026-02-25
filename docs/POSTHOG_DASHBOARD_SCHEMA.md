# PostHog Dashboard Schema (Community + Projects)

This schema is for the new build-in-public landing model, where `/` is the community page and projects drive engagement.

## 1) Event Dictionary

### Core events

- `community_home_viewed`
  - Trigger: when `CommunityHome` loads.
  - Properties:
    - `page` (`community_home`)
    - `project_count` (number)
    - `category` (`Community Home`)

- `community_project_action_clicked`
  - Trigger: any project card action click.
  - Properties:
    - `action_type` (`project_open` | `whatsapp_join`)
    - `page` (`community_home`)
    - `project_id` (string)
    - `project_name` (string)
    - `project_status` (`live` | `building` | `idea`)
    - `target_type` (`internal` | `external` | `whatsapp`)
    - `target_url` (string)
    - `category` (`Community Home`)

### Existing events still relevant

- `$pageview` (already captured manually in app hook)
- `cta_clicked` (legacy CTAs across older pages)

## 2) Recommended Dashboard (8 Insights)

Create a dashboard named: **Community / Projects Funnel**.

1. **Landing Traffic**
   - Type: Trend
   - Event: `community_home_viewed`
   - Breakdown: none
   - Interval: daily

2. **Project Action Clicks (All)**
   - Type: Trend
   - Event: `community_project_action_clicked`
   - Breakdown: `action_type`

3. **WhatsApp Joins by Project**
   - Type: Trend
   - Event: `community_project_action_clicked`
   - Filter: `action_type = whatsapp_join`
   - Breakdown: `project_name`

4. **Project Opens by Project**
   - Type: Trend
   - Event: `community_project_action_clicked`
   - Filter: `action_type = project_open`
   - Breakdown: `project_name`

5. **CTR: Home View -> Any Project Action**
   - Type: Funnel
   - Steps:
     1. `community_home_viewed`
     2. `community_project_action_clicked`
   - Conversion window: 1 day

6. **CTR: Home View -> WhatsApp Join**
   - Type: Funnel
   - Steps:
     1. `community_home_viewed`
     2. `community_project_action_clicked` with `action_type = whatsapp_join`
   - Conversion window: 1 day

7. **Action Mix by Project Status**
   - Type: Pie (or Bar)
   - Event: `community_project_action_clicked`
   - Breakdown: `project_status`
   - Optional second breakdown: `action_type`

8. **Destination Type Split**
   - Type: Pie
   - Event: `community_project_action_clicked`
   - Breakdown: `target_type`

## 3) Useful Filters and Breakdowns

- Global filters:
  - `page = community_home`
  - `category = Community Home`
- Breakdown priority:
  1. `project_name`
  2. `action_type`
  3. `project_status`
  4. `target_type`

## 4) KPI Targets (Starter)

- Home -> Any action conversion: **>= 15%**
- Home -> WhatsApp join conversion: **>= 5%**
- `live` projects should outperform `idea` projects on `project_open` rate.

## 5) Naming/Tracking Rules Going Forward

- Keep event names snake_case and stable.
- Add new project cards without renaming existing `project_id`s.
- Reuse `community_project_action_clicked` for any future project CTA.
- Add new `action_type` values only when needed (example: `waitlist_join`).

## 6) Next Iteration (Optional)

If you want deeper attribution, add these properties to both community events:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `referrer_domain`

Then add dashboard panels for source-level conversion and WhatsApp join efficiency by campaign.

## 7) Thais Promo Metrics (Instagram Follow -> Badge Unlock)

Use this for the promo URL:

- `/projects/carioca-coastal-club?promo=thais-follow`

### Event dictionary

- `promo_landing_viewed`
  - Trigger: promo visitor lands on home with `promo=thais-follow`.
  - Properties:
    - `promo_id` (`thais-follow`)
    - `promo_source` (`home_instagram_section`)
    - `instagram_handle` (`thai.82ipanema`)
    - `page_path` (string)
    - `full_path` (string)
    - `badge_previously_unlocked` (boolean)
    - `validation_model` (`honor_based`)

- `thais_instagram_clicked`
  - Trigger: visitor clicks "Follow Thais on Instagram".
  - Properties:
    - `promo_id`, `promo_source`, `instagram_handle`, `page_path`, `full_path`
    - `badge_already_unlocked` (boolean)

- `thais_badge_unlocked`
  - Trigger: visitor clicks "I followed, unlock badge" after follow click.
  - Properties:
    - `promo_id`, `promo_source`, `instagram_handle`, `page_path`, `full_path`
    - `unlock_status` (`new_unlock` | `already_unlocked`)

- `thais_badge_unlock_blocked`
  - Trigger: visitor tries to unlock before clicking follow.
  - Properties:
    - `promo_id`, `promo_source`, `instagram_handle`, `page_path`, `full_path`
    - `block_reason` (`follow_step_not_completed`)
    - `badge_already_unlocked` (boolean)

### Dashboard configuration (7 insights)

Create a dashboard named: **Thais Promo Funnel**.

1. **Promo Traffic**
   - Type: Trend
   - Event: `promo_landing_viewed`
   - Breakdown: none
   - Interval: daily
   - Filter: `promo_id = thais-follow`

2. **Instagram Follow Clicks**
   - Type: Trend
   - Event: `thais_instagram_clicked`
   - Breakdown: `badge_already_unlocked`
   - Interval: daily
   - Filter: `promo_id = thais-follow`

3. **Badge Unlocks**
   - Type: Trend
   - Event: `thais_badge_unlocked`
   - Breakdown: `unlock_status`
   - Interval: daily
   - Filter: `promo_id = thais-follow`

4. **Unlock Block Rate**
   - Type: Trend
   - Event: `thais_badge_unlock_blocked`
   - Breakdown: `block_reason`
   - Interval: daily
   - Filter: `promo_id = thais-follow`

5. **Funnel: Landing -> Follow Click**
   - Type: Funnel
   - Steps:
     1. `promo_landing_viewed` where `promo_id = thais-follow`
     2. `thais_instagram_clicked` where `promo_id = thais-follow`
   - Conversion window: 1 day

6. **Funnel: Landing -> Badge Unlock**
   - Type: Funnel
   - Steps:
     1. `promo_landing_viewed` where `promo_id = thais-follow`
     2. `thais_badge_unlocked` where `promo_id = thais-follow` and `unlock_status = new_unlock`
   - Conversion window: 7 days

7. **Funnel: Landing -> Follow Click -> Badge Unlock**
   - Type: Funnel (3 steps)
   - Steps:
     1. `promo_landing_viewed` where `promo_id = thais-follow`
     2. `thais_instagram_clicked` where `promo_id = thais-follow`
     3. `thais_badge_unlocked` where `promo_id = thais-follow` and `unlock_status = new_unlock`
   - Conversion window: 7 days

### Recommended global dashboard filters

- `promo_id = thais-follow`
- Date range: last 30 days

### Starter KPI targets

- Landing -> Follow click conversion: **>= 45%**
- Landing -> New badge unlock conversion: **>= 25%**
- Unlock blocked events / promo landings: **<= 10%**
