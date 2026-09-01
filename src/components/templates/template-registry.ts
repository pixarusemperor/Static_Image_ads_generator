import { TemplateId } from './index';

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  category: 'direct-response' | 'publisher' | 'social' | 'recruitment' | 'typographic' | 'custom';
  categoryLabel: string;
  description: string;
  thumbnailUrl: string;
  badge: string;
  dimensions: { width: number; height: number };
  tags: string[];
  elementCount: number;
}

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'direct-response', label: 'Product' },
  { id: 'publisher', label: 'News Card' },
  { id: 'social', label: 'Social' },
  { id: 'recruitment', label: 'Hiring' },
  { id: 'typographic', label: 'Typo' },
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]['id'];

export const TEMPLATES_REGISTRY: TemplateMetadata[] = [
  {
    id: '1-a',
    name: '1-A: Niche Product (Default)',
    category: 'direct-response',
    categoryLabel: 'Direct-Response',
    description: 'Dual-banner header with subject photo, product mockup, yellow price badge, and dual-tone bottom banners.',
    thumbnailUrl: '/templates/thumbnails/1-a.png',
    badge: 'High CTR',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Dual Banner', 'Mockup', 'Price Badge'],
    elementCount: 11,
  },
  {
    id: '1-b',
    name: '1-B: Niche Product (Split)',
    category: 'direct-response',
    categoryLabel: 'Direct-Response',
    description: 'Hero photo header with split sales copy, right-aligned product mockup, and bold yellow backdrop.',
    thumbnailUrl: '/templates/thumbnails/1-b.png',
    badge: 'Split Copy',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Split Copy', 'Book Cover', 'Green Badge'],
    elementCount: 9,
  },
  {
    id: '2-a',
    name: '2-A: Publisher Content Card',
    category: 'publisher',
    categoryLabel: 'Publisher',
    description: 'Editorial-style ad with full-bleed background, dark bottom gradient, author avatar circle, and highlighted headline.',
    thumbnailUrl: '/templates/thumbnails/2-a.png',
    badge: 'Newsfeed',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Full Bleed', 'Gradient', 'Avatar'],
    elementCount: 4,
  },
  {
    id: '3-a',
    name: '3-A: Native Social Ad (Promo)',
    category: 'social',
    categoryLabel: 'Social Native',
    description: 'Dark-mode promo card with circular product badge, exclusive offer capsule, and glowing headline.',
    thumbnailUrl: '/templates/thumbnails/3-a.png',
    badge: 'Offer',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Product Circle', 'Capsule', 'Dark Mode'],
    elementCount: 5,
  },
  {
    id: '3-b',
    name: '3-B: Native Social (Post Card)',
    category: 'social',
    categoryLabel: 'Social Native',
    description: 'Social post card layout with author profile avatar, verified handle, quote text, and engagement metrics.',
    thumbnailUrl: '/templates/thumbnails/3-b.png',
    badge: 'Social Proof',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Post Card', 'Author', 'Stats'],
    elementCount: 7,
  },
  {
    id: '4-a',
    name: '4-A: Recruitment Flyer',
    category: 'recruitment',
    categoryLabel: 'Recruitment',
    description: 'Hiring poster with black header, office photography, urgent badge, and dual-tier salary banners.',
    thumbnailUrl: '/templates/thumbnails/4-a.png',
    badge: 'Hiring',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Office Photo', 'Salary', 'Urgent Badge'],
    elementCount: 7,
  },
  {
    id: '5-a',
    name: '5-A: Typographic Flyer',
    category: 'typographic',
    categoryLabel: 'Typographic',
    description: 'High-contrast text flyer on green background with large headline, black subtitle, and pointer arrows.',
    thumbnailUrl: '/templates/thumbnails/5-a.png',
    badge: 'Text Only',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Bold Text', 'Green BG', 'Arrows'],
    elementCount: 5,
  },
  {
    id: 'custom',
    name: 'Blank Visual Canvas',
    category: 'custom',
    categoryLabel: 'Studio Canvas',
    description: 'Freeform visual canvas with dark indigo background and layer stack for custom multi-layer compositions.',
    thumbnailUrl: '/templates/thumbnails/custom.png',
    badge: 'Blank',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Custom Layers', 'Freeform', 'Fabric.js'],
    elementCount: 4,
  },
];

export function getTemplateMetadata(id: TemplateId): TemplateMetadata | undefined {
  return TEMPLATES_REGISTRY.find(t => t.id === id);
}
