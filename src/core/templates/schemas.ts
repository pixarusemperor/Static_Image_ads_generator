import { z } from 'zod';

export const Template1ASchema = z.object({
  headerLine1: z.string().optional().describe('Top black banner uppercase copy'),
  headerLine2: z.string().optional().describe('Top red banner question copy'),
  subjectImage: z.string().optional().describe('Left portrait/subject image URL or local path'),
  productImage: z.string().optional().describe('Right product mockup image URL or local path'),
  priceBadgeText: z.string().optional().describe('Yellow pill price text (e.g. PRIX 5.000F)'),
  footerLine1: z.string().optional().describe('Bottom red banner direct action copy'),
  footerLine2: z.string().optional().describe('Bottom white banner qualification/reassurance copy'),
  width: z.number().optional().default(1080),
  height: z.number().optional().default(1080),
});

export const Template1BSchema = z.object({
  topBackgroundImage: z.string().optional().describe('Top hero photograph background'),
  productImage: z.string().optional().describe('Right floating 3D product mockup'),
  priceBadgeText: z.string().optional().describe('Green pill price badge text'),
  title: z.string().optional().describe('Primary headline on yellow backdrop'),
  subtitle: z.string().optional().describe('Secondary red highlighted subtitle'),
  bodyParagraph: z.string().optional().describe('Middle body explanation copy'),
  footerText: z.string().optional().describe('Bottom red banner text'),
  width: z.number().optional().default(1080),
  height: z.number().optional().default(1080),
});

export const Template2ASchema = z.object({
  backgroundImage: z.string().optional().describe('Full-bleed editorial background photo'),
  logoUrl: z.string().optional().describe('Brand or publication logo URL'),
  logoPosition: z.enum(['left', 'right']).optional().default('left'),
  hasAvatar: z.boolean().optional().default(false),
  avatarUrl: z.string().optional().describe('Author or reporter circular avatar image'),
  headline: z.string().optional().describe('Editorial headline with [bracketed] highlights'),
  highlightColor: z.string().optional().default('#E50914'),
  width: z.number().optional().default(1080),
  height: z.number().optional().default(1080),
});

export const Template3ASchema = z.object({
  backgroundImage: z.string().optional().describe('Dark native social background image'),
  productImage: z.string().optional().describe('Circular product inset image'),
  headline: z.string().optional().describe('Bottom headline text in translucent card'),
  badgeText: z.string().optional().describe('Top-right floating offer badge'),
  width: z.number().optional().default(1080),
  height: z.number().optional().default(1080),
});

export const Template3BSchema = z.object({
  backgroundImage: z.string().optional().describe('Background image underneath tweet card'),
  postAuthor: z.string().optional().describe('Twitter/X post author display name'),
  postHandle: z.string().optional().describe('Twitter/X @handle'),
  postAvatar: z.string().optional().describe('Author profile circular avatar'),
  postContent: z.string().optional().describe('The primary post/tweet text body'),
  postStats: z.string().optional().describe('Likes and reposts social proof string'),
  width: z.number().optional().default(1080),
  height: z.number().optional().default(1080),
});

export const Template4ASchema = z.object({
  headerTitle: z.string().optional().describe('Top black recruitment header title'),
  bodyImage: z.string().optional().describe('Center workplace/office photo'),
  flagBadgeUrl: z.string().optional().describe('Country or urgency flag badge'),
  footerSalary: z.string().optional().describe('Primary salary tier text'),
  footerCommissions: z.string().optional().describe('Secondary bonus/commissions text'),
  width: z.number().optional().default(1080),
  height: z.number().optional().default(1080),
});

export const Template5ASchema = z.object({
  backgroundColor: z.string().optional().default('#55B23B'),
  title: z.string().optional().describe('Large bold typography headline'),
  subtitle: z.string().optional().describe('Black subtitle reassurance'),
  emoji: z.string().optional().default('👇'),
  width: z.number().optional().default(1080),
  height: z.number().optional().default(1080),
});

export const CustomTemplateSchema = z.object({
  canvasBgColor: z.string().optional().default('#0f172a'),
  layers: z.array(z.record(z.any())).optional().default([]),
  width: z.number().optional().default(1080),
  height: z.number().optional().default(1080),
});

export const TEMPLATE_SCHEMAS: Record<string, z.ZodObject<any>> = {
  '1-a': Template1ASchema,
  '1-b': Template1BSchema,
  '2-a': Template2ASchema,
  '3-a': Template3ASchema,
  '3-b': Template3BSchema,
  '4-a': Template4ASchema,
  '5-a': Template5ASchema,
  'custom': CustomTemplateSchema,
};

export function getTemplateSchema(templateId: string): z.ZodObject<any> | undefined {
  return TEMPLATE_SCHEMAS[templateId];
}
