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
