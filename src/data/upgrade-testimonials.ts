// Testimonial quotes for the /upgrade landing page.
//
// Empty `quote` = section is omitted at render time (no empty quote box
// shown). Drop the quote string in here when it's received and the
// styled blockquote will appear automatically.
//
// Keys correspond to project slugs used by UpgradeCaseStudy.astro and
// UpgradeOtherProof.astro.

export interface UpgradeTestimonial {
  quote: string;
  author: string;
  role?: string;
}

export const upgradeTestimonials: Record<string, UpgradeTestimonial> = {
  'modern-classic': {
    quote: '', // TESTIMONIAL_MICHAEL: replace with quote once received
    author: 'Michael',
    role: 'Owner, Modern Classic Barbershop',
  },
  fitchin: {
    quote: '', // TESTIMONIAL_FITCHIN: replace with quote once received
    author: 'Steve',
    role: 'Owner, Fitchin Auto Detail & Tint',
  },
  'all-transport': {
    quote: '', // TESTIMONIAL_ALL_TRANSPORT: replace with quote once received
    author: '',
    role: 'All Transport Bus Co.',
  },
};
