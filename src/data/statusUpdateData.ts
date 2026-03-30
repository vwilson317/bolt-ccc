export interface PostMetric {
  label: string;
  value: string;
  delta?: string; // e.g. "+12%" or "-5%"
  positive?: boolean;
}

export interface StatusUpdate {
  id: string;
  weekLabel: string; // e.g. "Week of March 24"
  date: string; // ISO date string
  headline: string;
  body: string;
  highlights?: string[]; // bullet point highlights
  metrics?: PostMetric[];
  tags?: string[];
}

export const statusUpdates: StatusUpdate[] = [
  {
    id: 'week-march-24-2026',
    weekLabel: 'Week of March 24',
    date: '2026-03-30',
    headline: 'Status Update – March 24',
    body: 'Update text coming soon. Check back here for the latest on what\'s happening with Carioca Coastal Club.',
    highlights: [],
    metrics: [],
    tags: [],
  },
];
