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
    id: 'april-6-2026',
    weekLabel: 'April 6',
    date: '2026-04-06',
    headline: '🌴 Carioca Coastal Club — Update',
    sections: [
      {
        category: 'Content',
        items: [
          'A community member put together a mini varial video that went up on Twitter — exactly the kind of organic content we love to see.',
          'Two Instagram reels have crossed 5k views each, showing solid traction on the content side.',
        ],
      },
      {
        category: 'Meetups',
        items: [
          'Hosted our first meetup with Barraca 53 to celebrate them hitting 10k followers. Great energy and a good example of what community collaboration looks like in practice.',
        ],
      },
      {
        category: "Ryan's Going-Away Party",
        items: [
          'Decided on a live jazz band for the event.',
          'Tickets are now available on the website — details on the events page.',
        ],
      },
    ],
    metrics: [
      { label: 'Reel Views', value: '5k+', positive: true },
      { label: 'Barraca 53 Followers', value: '10k', positive: true },
    ],
  },
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
