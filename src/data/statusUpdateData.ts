export interface PostMetric {
  label: string;
  value: string;
  delta?: string; // e.g. "+12%" or "-5%"
  positive?: boolean;
}

export interface UpdateSection {
  category: string;
  items: string[];
}

export interface StatusUpdate {
  id: string;
  weekLabel: string;
  date: string;
  headline: string;
  sections: UpdateSection[];
  metrics?: PostMetric[];
}

export const statusUpdates: StatusUpdate[] = [
  {
    id: 'march-30-2026',
    weekLabel: 'March 30 (Monday)',
    date: '2026-03-30',
    headline: '🌴 Carioca Coastal Club — Update',
    sections: [
      {
        category: 'Badges',
        items: [
          '50+ loyalty badges claimed — great to see people actually using them and getting value.',
        ],
      },
      {
        category: 'Meetups',
        items: [
          "First meetup run by a new host went really well. This is something we'll keep building on.",
        ],
      },
      {
        category: 'Hosts',
        items: [
          '10+ new hosts currently being onboarded. Goal is to have more consistent meetups across different days.',
        ],
      },
      {
        category: 'Community Talent',
        items: [
          'Launched photography and videography support from within the community. If you need content, we now have people in-house you can work with.',
        ],
      },
      {
        category: 'Coming Up',
        items: ["Ryan's going-away party — planned for early May. More details soon."],
      },
    ],
    metrics: [
      { label: 'Badges Claimed', value: '50+', positive: true },
      { label: 'New Hosts', value: '10+', positive: true },
    ],
  },
];
