import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const proposals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proposals' }),
  schema: z.object({
    client: z.string(),
    clientShort: z.string(),
    location: z.string(),
    date: z.string(),
    heroImage: z.string(),
    heroAlt: z.string().optional(),
    previewUrl: z.string().url(),
    stripeUrl: z.string().url(),
    contactEmail: z.string().default('bilsonxnc@gmail.com'),
    contactPhone: z.string().default('740-617-6488'),
    buildPrice: z.number(),
    depositAmount: z.number(),
    careMonthly: z.number(),
    headline: z.string(),
    subhead: z.string(),
    stats: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })),
    testimonials: z.array(z.object({
      business: z.string(),
      location: z.string(),
      url: z.string(),
      quote: z.string(),
      attribution: z.string(),
    })),
    included: z.array(z.object({
      title: z.string(),
      body: z.string(),
    })),
    whyCustomCode: z.object({
      title: z.string(),
      body: z.string(),
    }),
    recommendations: z.array(z.object({
      title: z.string(),
      body: z.string(),
    })),
    timeline: z.array(z.object({
      when: z.string(),
      title: z.string(),
      body: z.string(),
    })),
    ownership: z.array(z.string()),
    paymentTerms: z.array(z.string()),
    closing: z.object({
      headline: z.string(),
      body: z.string(),
    }),
  }),
});

export const collections = { proposals };
