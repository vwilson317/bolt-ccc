export interface PostMetric {
  label: string;
  value: string;
  delta?: string; // e.g. "+12%" or "-5%"
  positive?: boolean;
}

export interface SectionLink {
  label: string;
  url: string;
}

export interface UpdateSection {
  category: string;
  items: string[];
  links?: SectionLink[];
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
    id: 'april-13-2026',
    weekLabel: 'April 13 (Monday)',
    date: '2026-04-13',
    headline: '🌴 Carioca Coastal Club — Update',
    sections: [
      {
        category: 'Meetups',
        items: [
          "Two meetups this weekend, run by different hosts at different barracas. That's the model working. More consistency, more variety, more people getting to experience what this community is about.",
        ],
      },
      {
        category: 'Instagram',
        items: [
          'Followers are up to 2300+ Growth is steady and the content is connecting.',
        ],
      },
      {
        category: 'Jamie Woods Interview',
        items: [
          "Dropping this week. We'll share the link across channels as soon as it's live.",
        ],
      },
      {
        category: "Ryan's Going-Away Party",
        items: [
          "Ticket sales are kicking off this week. If you've been waiting — now's the time. We'll be pushing details out to the community soon, so keep an eye out.",
        ],
      },
      {
        category: 'Community',
        items: [
          "Over 250 members and counting. We're optimistic about where this is headed — genuinely. To everyone who's shown up, spent time, and made the weekends what they've been: thank you.",
        ],
      },
    ],
    metrics: [
      { label: 'Instagram Followers', value: '2300+', positive: true },
      { label: 'Community Members', value: '250+', positive: true },
    ],
  },
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
        links: [
          { label: 'Varial video on Twitter', url: 'https://x.com/chrislaubai/status/2040849901475779052?s=46' },
          { label: 'Instagram Reel #1', url: 'https://www.instagram.com/reel/DWhgzOLCXCQ/?igsh=MWw3ZXNqZGNweDZlZg==' },
          { label: 'Instagram Reel #2', url: 'https://www.instagram.com/reel/DWvfgi6D0pO/?igsh=MWd2cXRzMDVpaWR6dQ==' },
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
