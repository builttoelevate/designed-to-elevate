export interface FoundingPackage {
  name: string;
  forWho: string;
  foundingPrice: string;
  foundingMeta: string;
  futurePrice: string;
  paymentPlan?: string;
  delivery: string;
  includes: string[];
  popular: boolean;
}

export const foundingPackages: FoundingPackage[] = [
  {
    name: 'Foundation',
    forWho: "A business that has something online but it isn't bringing in calls or quote requests.",
    foundingPrice: '$1,495',
    foundingMeta: 'one-time',
    futurePrice: '$2,500',
    delivery: '7–14 days',
    includes: [
      'Conversion-focused homepage or landing page improvement',
      'Mobile-first layout with clear service sections',
      'Call, text, and quote CTAs throughout',
      'Basic local SEO structure',
      'Google Business Profile review',
      'Lead form improvement',
    ],
    popular: false,
  },
  {
    name: 'Lead Engine',
    forWho:
      'A service business that wants the whole path improved — Google search to website visitor to quote request to booked job.',
    foundingPrice: '$2,495',
    foundingMeta: 'one-time + $245/mo',
    futurePrice: '$4,500 + $500/mo',
    paymentPlan: '$832/month for 3 months, then $245/month',
    delivery: '14–21 days',
    includes: [
      'Everything in Foundation',
      'Conversion-focused service pages',
      'Custom quote/contact flow',
      'Google Ads landing page',
      'Local SEO content direction',
      'Review and trust strategy',
      'Monthly improvement support + performance check-ins',
    ],
    popular: true,
  },
  {
    name: 'Custom Lead System',
    forWho: 'A higher-ticket service business that wants a real custom system — not just a website.',
    foundingPrice: '$4,495',
    foundingMeta: 'one-time + $545/mo',
    futurePrice: '$8,500 + $1,200/mo',
    paymentPlan: '$1,498/month for 3 months, then $545/month',
    delivery: '21–30 days',
    includes: [
      'Everything in Lead Engine',
      'Custom quote wizard with tiered package logic',
      'Upsell and add-on flow',
      'Advanced lead capture',
      'Multi-service quote paths',
      'Booking and request strategy',
      'Performance reviews',
    ],
    popular: false,
  },
];
