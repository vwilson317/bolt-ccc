// Static content for the FLOW. community project (/projects/flow).
// Intentionally hard-coded — there is no backend/database wiring for this
// project yet, so every page reads from these arrays instead.

export interface FlowExperience {
  id: string;
  title: string;
  category: string;
  price: string;
  image: string;
  badge?: string;
  description: string;
  cta: string;
  /** The one "hero" experience shown as a large card on the dashboard */
  featured?: boolean;
}

export const experiences: FlowExperience[] = [
  {
    id: 'maracana-derby',
    title: 'Flamengo vs Vasco @ Maracanã',
    category: 'Sports',
    price: 'R$ 850',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLuvxrch5zL_2QVrcFH8A0OBd7arKX_cvmFxylezeJEiGKmSzDAxLo1qhYKJtonP89WiQJF6FtwecH7Jndmnbq9ZB8XI8RuQOx4hXCIB2IzXwUSCmn8vbxf8wVLdolAAnOBqP4bZ2KXnloEg6vqJ-Y4ZCLAPXOTSSF5sSHOnvIS9ahGGs0KUG1JSycU1k-kMEMV00zKSo4GuczCwkdmGDrbtWnkUFDOzoRzjCL2WPUBpu-nBOv_gGsMJFTo',
    badge: 'VIP Access',
    description: "Premium box seats for the city's biggest derby. Includes private transport and hospitality.",
    cta: 'Book Now',
  },
  {
    id: 'helicopter-tour',
    title: 'Doors-Off Helicopter Tour',
    category: 'Aerial',
    price: 'R$ 1.2k',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLs7Uihl7geeRdHtzqwSGG_DMnL8VSpeFLd3234pQzAbNmdXO2BdrII1TMKsXiN1Ywi98MwZ0vrady9Rfc5Tw5Zo5TS-kGXlRjf6XAOt-l2K3a-KXfJB7r53485hZ8bNL8-19Bk8JWhyLL0XfSd0yqUiwDQ0OpBphajgpJDf1wrihxtp8roPVU9Vog8-bfK3ft-iHV0hlD3CfXm6xJ6CkLaXLcMp9fEewphpVThcO0ranKzEA2UNIRdRajk',
    badge: 'Bucket List',
    description: 'The ultimate perspective of Rio. Professional photographer included for the perfect shots.',
    cta: 'Book Now',
  },
  {
    id: 'sunset-dj',
    title: 'Sunset DJ @ Pão de Açúcar',
    category: 'Nightlife',
    price: 'R$ 450',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLtfTYHcwmuqzQmAB3mYojxouU0zacvQy_Yqs4vbsqTkdcPcUwPiK06EsFOCDW4ipVi_aDvtSV8Nszbsgap8hY9TvK3KXNuHOLX-fWtVoi4Gk31ah9riWszc0Hu9Une_BqddWRRiQt5mnQUXSwVKbewNhDHtOhmamZDKM3TKqePxdyrXU3-15TTBWzk20GYVhx3-E6K6fo9vnmoar2QAfL2-2YsdFfj1CdTMdy81pzdNmAOztfXF7mq4jqM',
    badge: 'Exclusive Event',
    description:
      "An intimate evening of deep house at one of the world's most iconic locations. Limited to 50 members.",
    cta: 'Reserve Spot',
    featured: true,
  },
  {
    id: 'dois-irmaos-hike',
    title: 'Morro Dois Irmãos Hike',
    category: 'Adventure',
    price: 'R$ 480',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1W9sYrjPP-hth3IJg-XJP-u4LZ8PItPSn9GYD3toUjKs93yEjKKkHYmjy52415G4qc9eEfBh3REo4j7UTWU__O0jaaCYJvsDG96KaI2tNtRVl2r6dKUJVVSDBTUr3PLXDDt0OQuUDEMyQdCZGNbAVGvxeLkLXfNpWl-XF0aGLDiWtrL9PYJjnX2baEGIjpRCaIq29Wp8EgFexV3MN4tF5L7pBnfExPbMtEVkSXOWlby_0MmeCf2ADd0saw1bj53SxrI-8nMiYpCE',
    description: 'Professional guided hike with the best view of the South Zone.',
    cta: 'Book Now',
  },
  {
    id: 'favela-tour',
    title: 'Favela Cultural Tour',
    category: 'Culture',
    price: 'R$ 380',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkG9lBb3Wpu46Grq09lt3GKUkm21xh7BZn2zc1jeiKJsm_sHhchA6X0VqboedpaGGnfYMbCSII1tZ1AGirzDFltMOBPwOKlTO3IYka3Mwz20VM1GHHW3YhM89r88mY9y8Pgus0vj2DKlNyDGrYCuAElFxwGgNQuyqvtN_N40pRARIeFbwlYHzVg7nBWQqtqXhsLvzJSWxgQxnk4X8BclgNv5OzOGvfLCYhuRENQS-bLojmLoxeKahhvzd1zCAHPZo8X42IQxO1ROo',
    description: 'Premium guided art & culture walks through Vidigal with a local artist.',
    cta: 'Book Now',
  },
  {
    id: 'yacht-sailing',
    title: 'Guanabara Yacht Sailing',
    category: 'Sailing',
    price: 'R$ 2.4k',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGU_3UeCB9aFt91dZpylxC0aClWWecX9Xm-8H9NgrrkxUmJLNxv3x_MHQtu-_CPVBMeBjJHTY1p4RxU2RXdjDp7jM3mWx3TAy4OdYHEhrsMnSYjAT1DI2AkNZicjOIbGAZma9z0T3inpHnomb0iWUwel-yiZc_XmHXk6-5mR7-6Uwy8XMmv3fGlfmGnrbEUVkMkrzZlg4MkOcViTK5Ityoe_0akCjwcP9t6UpkgF_bjUvlxUJxtDN1db7gcuk3pqtvhsS7Olpsmrw',
    description: 'Private full-day ocean excursion through Guanabara Bay with refreshments.',
    cta: 'Book Now',
  },
];

export interface FlowCommunityEvent {
  id: string;
  /** Day of month this event appears on, applied to whichever month the calendar shows */
  day: number;
  title: string;
  category: 'Tour' | 'Meetup' | 'Party';
  time: string;
  location: string;
  image: string;
}

export const communityEvents: FlowCommunityEvent[] = [
  {
    id: 'helicopter-tour-event',
    day: 5,
    title: 'Elite Helicopter Tour: Rio from Above',
    category: 'Tour',
    time: '3:00 PM',
    location: 'Lagoa Helipad',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLs7Uihl7geeRdHtzqwSGG_DMnL8VSpeFLd3234pQzAbNmdXO2BdrII1TMKsXiN1Ywi98MwZ0vrady9Rfc5Tw5Zo5TS-kGXlRjf6XAOt-l2K3a-KXfJB7r53485hZ8bNL8-19Bk8JWhyLL0XfSd0yqUiwDQ0OpBphajgpJDf1wrihxtp8roPVU9Vog8-bfK3ft-iHV0hlD3CfXm6xJ6CkLaXLcMp9fEewphpVThcO0ranKzEA2UNIRdRajk',
  },
  {
    id: 'sunset-meetup',
    day: 12,
    title: 'Sunset Networking Meetup',
    category: 'Meetup',
    time: '5:00 PM',
    location: 'Ipanema Beach',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLtfTYHcwmuqzQmAB3mYojxouU0zacvQy_Yqs4vbsqTkdcPcUwPiK06EsFOCDW4ipVi_aDvtSV8Nszbsgap8hY9TvK3KXNuHOLX-fWtVoi4Gk31ah9riWszc0Hu9Une_BqddWRRiQt5mnQUXSwVKbewNhDHtOhmamZDKM3TKqePxdyrXU3-15TTBWzk20GYVhx3-E6K6fo9vnmoar2QAfL2-2YsdFfj1CdTMdy81pzdNmAOztfXF7mq4jqM',
  },
  {
    id: 'founders-coffee',
    day: 18,
    title: 'Founders Coffee & Mixer',
    category: 'Party',
    time: '5:00 PM',
    location: 'Ipanema Rooftop',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGU_3UeCB9aFt91dZpylxC0aClWWecX9Xm-8H9NgrrkxUmJLNxv3x_MHQtu-_CPVBMeBjJHTY1p4RxU2RXdjDp7jM3mWx3TAy4OdYHEhrsMnSYjAT1DI2AkNZicjOIbGAZma9z0T3inpHnomb0iWUwel-yiZc_XmHXk6-5mR7-6Uwy8XMmv3fGlfmGnrbEUVkMkrzZlg4MkOcViTK5Ityoe_0akCjwcP9t6UpkgF_bjUvlxUJxtDN1db7gcuk3pqtvhsS7Olpsmrw',
  },
  {
    id: 'favela-tour-event',
    day: 24,
    title: 'Favela Tour & Hiking',
    category: 'Tour',
    time: '9:00 AM',
    location: 'Vidigal Entrance',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkG9lBb3Wpu46Grq09lt3GKUkm21xh7BZn2zc1jeiKJsm_sHhchA6X0VqboedpaGGnfYMbCSII1tZ1AGirzDFltMOBPwOKlTO3IYka3Mwz20VM1GHHW3YhM89r88mY9y8Pgus0vj2DKlNyDGrYCuAElFxwGgNQuyqvtN_N40pRARIeFbwlYHzVg7nBWQqtqXhsLvzJSWxgQxnk4X8BclgNv5OzOGvfLCYhuRENQS-bLojmLoxeKahhvzd1zCAHPZo8X42IQxO1ROo',
  },
  {
    id: 'maracana-derby-event',
    day: 28,
    title: 'Flamengo @ Maracanã',
    category: 'Meetup',
    time: '7:00 PM',
    location: 'Maracanã Stadium',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLuvxrch5zL_2QVrcFH8A0OBd7arKX_cvmFxylezeJEiGKmSzDAxLo1qhYKJtonP89WiQJF6FtwecH7Jndmnbq9ZB8XI8RuQOx4hXCIB2IzXwUSCmn8vbxf8wVLdolAAnOBqP4bZ2KXnloEg6vqJ-Y4ZCLAPXOTSSF5sSHOnvIS9ahGGs0KUG1JSycU1k-kMEMV00zKSo4GuczCwkdmGDrbtWnkUFDOzoRzjCL2WPUBpu-nBOv_gGsMJFTo',
  },
];
