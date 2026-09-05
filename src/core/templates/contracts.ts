/**
 * Single Source of Truth (SSOT) for SuperAds Template Contracts & Element Specifications.
 * Designed for consumption by external services (SYNPHONYS, automated AI agents, REST clients).
 */

export type ElementType = 'image' | 'text' | 'badge' | 'color' | 'layers';

export interface SpatialPlacement {
  position: 'absolute' | 'centered' | 'relative';
  left?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  width?: number | string;
  height?: number | string;
  alignment?: 'left' | 'center' | 'right';
  borderRadius?: number | string;
  zIndex?: number;
}

export interface CompositionRules {
  aspectRatio?: string;
  format?: 'transparent-png' | 'full-bleed-photo' | 'portrait-photo' | 'avatar-circle' | 'any';
  subjectPlacement?: string; // e.g., "Subject face and torso MUST be centered in frame"
  minResolution?: { width: number; height: number };
  notes?: string;
}

export interface TextRules {
  forcedCase?: 'UPPERCASE' | 'NONE';
  minWords?: number;
  maxWords?: number;
  maxCharacters?: number;
  fontSize?: number;
  fontWeight?: 'bold' | 'normal' | '500';
  highlightSyntax?: string; // e.g. "[bracketed] text will be highlighted"
  guidance?: string;
}

export interface TemplateElementContract {
  key: string;
  label: string;
  type: ElementType;
  mandatory: boolean;
  defaultValue: any;
  spatial: SpatialPlacement;
  compositionRules?: CompositionRules;
  textRules?: TextRules;
  purpose: string;
}

export interface TemplateContract {
  id: string;
  name: string;
  category: 'direct-response' | 'publisher' | 'social' | 'recruitment' | 'typographic' | 'custom';
  categoryLabel: string;
  description: string;
  bestUseCase: string;
  recommendedNiches: string[];
  funnelStage: 'Unaware' | 'Problem-Aware' | 'Solution-Aware' | 'Most-Aware' | 'All-Stages';
  conversionRationale: string;
  dimensions: { width: number; height: number };
  elements: TemplateElementContract[];
}

export const TEMPLATE_CONTRACTS: Record<string, TemplateContract> = {
  '1-a': {
    id: '1-a',
    name: '1-A: Niche Product (Default Dual Banner)',
    category: 'direct-response',
    categoryLabel: 'Direct-Response Product',
    description: 'Dual-banner header with left subject portrait, right 3D product mockup, high-contrast yellow price badge, and dual-tone bottom reassurance banners.',
    bestUseCase: 'Physical e-commerce products with visceral pain-points: sexual wellness (Volcano Tea), dietary supplements, physical gadgets, skincare remedies where cash-on-delivery is standard.',
    recommendedNiches: ['Sexual Wellness & Libido', 'Pain Relief & Supplements', 'Physical Gadgets', 'Beauty & Hair Regrowth'],
    funnelStage: 'Problem-Aware',
    conversionRationale: 'The top black banner qualifies the audience -> the red banner asks a painful visceral question stopping the thumb -> the left subject photo creates instant emotional empathy -> the 3D cutout mockup tangibilizes the solution -> the bright yellow pill anchors the low price -> the footer banners eliminate risk with Payment on Delivery.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'headerLine1',
        label: 'Top Qualification Banner',
        type: 'text',
        mandatory: false,
        defaultValue: 'INFUSION VOLCANIQUE 100% NATURELLE',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 100, alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', minWords: 2, maxWords: 6, maxCharacters: 40, fontSize: 44, fontWeight: 'bold', guidance: 'Names the category or qualifies the audience in solid black banner.' },
        purpose: 'Audience qualification and category positioning.',
      },
      {
        key: 'headerLine2',
        label: 'Visceral Problem Hook',
        type: 'text',
        mandatory: true,
        defaultValue: 'SOUFFREZ-VOUS D\'ÉJACULATION PRÉCOCE ?',
        spatial: { position: 'absolute', left: 0, top: 100, width: 1080, height: 110, alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', minWords: 3, maxWords: 8, maxCharacters: 45, fontSize: 52, fontWeight: 'bold', guidance: 'The primary scroll-stopping question on high-contrast red banner.' },
        purpose: 'Direct-response hook that hits the core symptom or pain point.',
      },
      {
        key: 'subjectImage',
        label: 'Left Subject / Symptom Portrait',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/MRESISTORFLYER1.png',
        spatial: { position: 'absolute', left: 80, top: 240, width: 520, height: 620, borderRadius: 30 },
        compositionRules: {
          aspectRatio: '5:6',
          format: 'portrait-photo',
          subjectPlacement: 'CRITICAL: The person or symptom sufferer MUST BE CENTERED horizontally and vertically in the photo frame. Because objectFit is "cover", off-center subjects will have their head or face cut off by the rounded container.',
          minResolution: { width: 600, height: 720 },
          notes: 'Shows the human target avatar experiencing pain, frustration, or muscular vitality.',
        },
        purpose: 'Human identification and visceral empathy anchor.',
      },
      {
        key: 'productImage',
        label: 'Right 3D Product Mockup',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/PATSIMMSCFLYER1.png',
        spatial: { position: 'absolute', left: 660, top: 300, width: 330, height: 460 },
        compositionRules: {
          aspectRatio: '3:4',
          format: 'transparent-png',
          subjectPlacement: 'CRITICAL: Must be a clean 3D product mockup (box, bottle, bag, packaging) with a TRANSPARENT BACKGROUND (PNG). Product should be centered vertically with packaging label clearly readable.',
          minResolution: { width: 400, height: 550 },
          notes: 'Transparent background prevents ugly rectangular blocks from clashing with the white backdrop.',
        },
        purpose: 'Tangible proof of the product vessel and perceived commercial value.',
      },
      {
        key: 'priceBadgeText',
        label: 'Offer / Price Pill',
        type: 'badge',
        mandatory: true,
        defaultValue: 'PRIX : 5.000 FCFA',
        spatial: { position: 'absolute', left: 650, top: 780, width: 350, height: 70, borderRadius: 15, alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', maxCharacters: 24, fontSize: 32, fontWeight: 'bold', guidance: 'Yellow text (#FFE600) on black pill. Always include clear currency (e.g. FCFA, CFA, $, €).' },
        purpose: 'Eliminates price shock and anchors high-perceived-value deal.',
      },
      {
        key: 'footerLine1',
        label: 'Call to Action Banner',
        type: 'text',
        mandatory: false,
        defaultValue: 'COMMANDEZ AUJOURD\'HUI & PAYEZ À LA LIVRAISON',
        spatial: { position: 'absolute', left: 0, top: 880, width: 1080, height: 90, alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', minWords: 3, maxWords: 8, maxCharacters: 48, fontSize: 40, fontWeight: 'bold', guidance: 'White bold copy on red background.' },
        purpose: 'Immediate direct action prompt emphasizing Cash on Delivery.',
      },
      {
        key: 'footerLine2',
        label: 'Trust & Reassurance Banner',
        type: 'text',
        mandatory: false,
        defaultValue: 'LIVRAISON RAPIDE ET DISCRÈTE PARTOUT EN CÔTE D\'IVOIRE',
        spatial: { position: 'absolute', left: 0, top: 970, width: 1080, height: 110, alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', minWords: 4, maxWords: 9, maxCharacters: 52, fontSize: 44, fontWeight: 'bold', guidance: 'Red bold copy on clean white footer.' },
        purpose: 'Overcomes final friction (delivery speed, discretion, geographic availability).',
      },
    ],
  },

  '1-b': {
    id: '1-b',
    name: '1-B: Niche Product (Split Copy)',
    category: 'direct-response',
    categoryLabel: 'Direct-Response Editorial',
    description: 'Hero photo top background with split sales copy on vibrant yellow backdrop, right-aligned product mockup, and green offer capsule.',
    bestUseCase: 'Educational digital guides, e-books, specialized courses, boxed kits where the buyer needs a 2-sentence rationale before deciding.',
    recommendedNiches: ['Info-Products & E-books', 'Training Courses', 'Complex Health Formulations', 'Premium High-Ticket Kits'],
    funnelStage: 'Solution-Aware',
    conversionRationale: 'Top hero photograph sets the visual scene -> Yellow high-energy lower half creates a natural reading column -> Split headline + paragraph copy builds rational desire -> Floating 3D mockup proves tangible existence.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'topBackgroundImage',
        label: 'Top Hero Background Photo',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/MRESISTORFLYER2.png',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 500 },
        compositionRules: {
          aspectRatio: '2.16:1 (1080x500)',
          format: 'full-bleed-photo',
          subjectPlacement: 'CRITICAL: Subject matter must be centered vertically within the top 500px. Avoid placing text in this image.',
          minResolution: { width: 1080, height: 500 },
          notes: 'High-contrast lifestyle or symptom photo occupying the entire upper half.',
        },
        purpose: 'Establishes high visual interest and context in the top half.',
      },
      {
        key: 'productImage',
        label: 'Floating Right Mockup',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/PATSIMMSCFLYER5.png',
        spatial: { position: 'absolute', left: 780, top: 380, width: 230, height: 330 },
        compositionRules: {
          aspectRatio: '2:3',
          format: 'transparent-png',
          subjectPlacement: 'CRITICAL: 3D book or package cutout with transparent background. Positioned bridging the top photo and lower yellow backdrop.',
          minResolution: { width: 300, height: 450 },
        },
        purpose: 'Provides tangible representation of the guide or product.',
      },
      {
        key: 'priceBadgeText',
        label: 'Green Price Capsule',
        type: 'badge',
        mandatory: true,
        defaultValue: 'OFFRE LIMITÉE : 5.000 F',
        spatial: { position: 'absolute', left: 740, top: 740, width: 310, height: 64, borderRadius: 32, alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', maxCharacters: 26, fontSize: 26, fontWeight: 'bold' },
        purpose: 'Urgency price anchor on green background (#00875A).',
      },
      {
        key: 'title',
        label: 'Primary Black Headline',
        type: 'text',
        mandatory: true,
        defaultValue: 'SECRET VOLCANIQUE',
        spatial: { position: 'absolute', left: 50, top: 530, width: 660, height: 'auto', alignment: 'left' },
        textRules: { forcedCase: 'UPPERCASE', maxWords: 5, maxCharacters: 28, fontSize: 56, fontWeight: 'bold' },
        purpose: 'Main curiosity hook on yellow backdrop.',
      },
      {
        key: 'subtitle',
        label: 'Secondary Red Subtitle',
        type: 'text',
        mandatory: true,
        defaultValue: 'RETROUVEZ VOTRE VIGUEUR MASCULINE',
        spatial: { position: 'absolute', left: 50, top: 600, width: 660, height: 'auto', alignment: 'left' },
        textRules: { forcedCase: 'UPPERCASE', maxWords: 6, maxCharacters: 35, fontSize: 56, fontWeight: 'bold' },
        purpose: 'Direct benefit promise highlighted in bold red.',
      },
      {
        key: 'bodyParagraph',
        label: 'Body Explanation Copy',
        type: 'text',
        mandatory: true,
        defaultValue: 'Une formule ancestrale aux herbes rares pour une endurance naturelle et durable.',
        spatial: { position: 'absolute', left: 50, top: 680, width: 660, height: 'auto', alignment: 'left' },
        textRules: { forcedCase: 'NONE', minWords: 10, maxWords: 30, maxCharacters: 160, fontSize: 26, fontWeight: 'normal' },
        purpose: 'Concise explanation addressing how and why it works.',
      },
      {
        key: 'footerText',
        label: 'Bottom Red Footer Banner',
        type: 'text',
        mandatory: false,
        defaultValue: 'LIVRAISON GRATUITE + PAIEMENT À LA LIVRAISON',
        spatial: { position: 'absolute', left: 0, top: 960, width: 1080, height: 120, alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', maxCharacters: 45, fontSize: 48, fontWeight: 'bold' },
        purpose: 'Final risk-reversal guarantee.',
      },
    ],
  },

  '2-a': {
    id: '2-a',
    name: '2-A: Publisher Content Card (Advertorial Newsfeed)',
    category: 'publisher',
    categoryLabel: 'Publisher / News Card',
    description: 'Editorial-style ad looking like a breaking news or investigative journalism report with full-bleed photo, dark gradient, author avatar circle, and bracket-highlighted headline.',
    bestUseCase: 'Cold traffic advertorial pre-sells, investigative angle stories, myth-busting campaigns, newsfeed pattern interrupts.',
    recommendedNiches: ['Health Discoveries & Herbal Medicine', 'Financial Secrets & Wealth', 'Controversial Exposés', 'Founder Backstory'],
    funnelStage: 'Unaware',
    conversionRationale: 'Does not look like an ad; mimics high-engagement editorial newsfeed posts. Bypasses ad blindness by triggering curiosity and investigative authority.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'backgroundImage',
        label: 'Full-Bleed Editorial Background Photo',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/MRESISTORFLYER4.png',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 1080 },
        compositionRules: {
          aspectRatio: '1:1 (1080x1080)',
          format: 'full-bleed-photo',
          subjectPlacement: 'CRITICAL: The main subject, face, or focal action MUST BE IN THE UPPER 60% of the image (top 0 to 650px). The bottom 40% will be obscured by a dark gradient overlay designed to ensure headline readability.',
          minResolution: { width: 1080, height: 1080 },
          notes: 'Authentic documentary, investigative, or documentary-style photography.',
        },
        purpose: 'Creates authentic editorial atmosphere and journalistic realism.',
      },
      {
        key: 'headline',
        label: 'Highlighted Editorial Headline',
        type: 'text',
        mandatory: true,
        defaultValue: 'Comment cette [plante africaine] a sauvé plus de 10.000 couples',
        spatial: { position: 'absolute', left: 80, bottom: 80, width: 920, height: 'auto', alignment: 'center' },
        textRules: {
          forcedCase: 'UPPERCASE',
          minWords: 6,
          maxWords: 14,
          maxCharacters: 75,
          fontSize: 48,
          fontWeight: 'bold',
          highlightSyntax: 'CRITICAL: Enclose the primary keyword in square brackets like [keyword] to automatically render a colored highlight box behind it.',
          guidance: 'Write like a headline from Le Figaro or New York Times: curious, objective, sensational yet credible.',
        },
        purpose: 'High-curiosity hook that demands reading the advertorial.',
      },
      {
        key: 'highlightColor',
        label: 'Highlight Box Color',
        type: 'color',
        mandatory: false,
        defaultValue: '#E50914',
        spatial: { position: 'relative' },
        purpose: 'Accent color for bracketed keywords (e.g. #E50914 red, #00875A green, #FFE600 yellow).',
      },
      {
        key: 'logoUrl',
        label: 'Brand / News Logo',
        type: 'image',
        mandatory: false,
        defaultValue: '/templates/assets/PATSIMMSCFLYER7.png',
        spatial: { position: 'absolute', top: 50, left: 50, height: 50 },
        compositionRules: { format: 'transparent-png', notes: 'If omitted, displays clean "NEWS" pill badge.' },
        purpose: 'Media authority badge in top header.',
      },
      {
        key: 'hasAvatar',
        label: 'Enable Circular Author Inset',
        type: 'badge',
        mandatory: false,
        defaultValue: true,
        spatial: { position: 'relative' },
        purpose: 'Toggles circular reporter/expert inset on bottom right.',
      },
      {
        key: 'avatarUrl',
        label: 'Author / Reporter Avatar Circle',
        type: 'image',
        mandatory: false,
        defaultValue: '/templates/assets/images.jpeg',
        spatial: { position: 'absolute', right: 80, bottom: 380, width: 160, height: 160, borderRadius: 80 },
        compositionRules: {
          aspectRatio: '1:1',
          format: 'avatar-circle',
          subjectPlacement: 'CRITICAL: Face MUST be centered in square/circle crop so it is not skewed or cut off by the circular border.',
          minResolution: { width: 200, height: 200 },
        },
        purpose: 'Author or doctor authority proof.',
      },
    ],
  },

  '3-a': {
    id: '3-a',
    name: '3-A: Native Social Ad (Promo Card)',
    category: 'social',
    categoryLabel: 'Social Native Promo',
    description: 'Dark-mode promo card with circular product badge, exclusive offer capsule, and glowing headline inside a translucent glass card.',
    bestUseCase: 'Flash sales, limited-stock drops, impulse-buy products, and TikTok/Instagram dark-mode feed ads.',
    recommendedNiches: ['Flash E-commerce Offers', 'Fitness & Slimming', 'Consumer Tech Accessories', 'Impulse Cosmetics'],
    funnelStage: 'Most-Aware',
    conversionRationale: 'Dark aesthetics match social media dark modes -> Circular inset instantly highlights the product -> Rotated badge creates visual urgency -> Bottom translucent card delivers a punchy guarantee.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'backgroundImage',
        label: 'Dark Atmospheric Background',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/MRESISTORFLYER5.png',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 1080 },
        compositionRules: {
          aspectRatio: '1:1 (1080x1080)',
          format: 'full-bleed-photo',
          subjectPlacement: 'Dark-themed background with moody lighting. Avoid busy text.',
        },
        purpose: 'Creates dramatic contrast for product and text elements.',
      },
      {
        key: 'productImage',
        label: 'Top-Left Circular Product Inset',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/PATSIMMSCFLYER8.png',
        spatial: { position: 'absolute', left: 80, top: 80, width: 240, height: 240, borderRadius: 120 },
        compositionRules: {
          aspectRatio: '1:1',
          format: 'any',
          subjectPlacement: 'CRITICAL: Product MUST BE CENTERED inside the 240x240 circle. Border is bright yellow (#FFE600).',
          minResolution: { width: 300, height: 300 },
        },
        purpose: 'High-visibility focal anchor showing product.',
      },
      {
        key: 'badgeText',
        label: 'Tilted Offer Badge',
        type: 'badge',
        mandatory: true,
        defaultValue: '-50% AUJOURD\'HUI',
        spatial: { position: 'absolute', top: 50, right: 50 },
        textRules: { forcedCase: 'UPPERCASE', maxCharacters: 20, fontSize: 24, fontWeight: 'bold' },
        purpose: 'Discount / promo urgency badge with 5-degree tilt.',
      },
      {
        key: 'headline',
        label: 'Bottom Glassmorphic Headline',
        type: 'text',
        mandatory: true,
        defaultValue: 'FINI LES DÉCEPTIONS AU LIT ! RÉSULTAT DÈS LE PREMIER JOUR',
        spatial: { position: 'absolute', left: 50, bottom: 80, width: 980, height: 'auto', alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', minWords: 4, maxWords: 12, maxCharacters: 65, fontSize: 42, fontWeight: 'bold' },
        purpose: 'Decisive benefit statement inside dark translucent card.',
      },
    ],
  },

  '3-b': {
    id: '3-b',
    name: '3-B: Native Social (Post / Tweet Proof Card)',
    category: 'social',
    categoryLabel: 'Social Proof / Tweet',
    description: 'Social post card layout with author profile avatar, verified badge, quoted customer testimonial text, and social proof metrics (likes, retweets).',
    bestUseCase: 'Customer testimonials, influencer endorsements, viral tweets, founder thoughts, and handling severe skepticism.',
    recommendedNiches: ['Supplements & Wellness', 'Coaching & Consulting', 'SaaS & Digital Tools', 'High-Trust Services'],
    funnelStage: 'Solution-Aware',
    conversionRationale: 'Tweets and social post screenshots have among the highest CTRs because users perceive them as objective third-party testimonials rather than ads.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'backgroundImage',
        label: 'Atmospheric Underlying Photo',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/The_dur_roi_lion_2.png',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 1080 },
        compositionRules: { aspectRatio: '1:1', format: 'full-bleed-photo' },
        purpose: 'Background behind the floating social proof card.',
      },
      {
        key: 'postAuthor',
        label: 'Author Display Name',
        type: 'text',
        mandatory: true,
        defaultValue: 'Dr. Jean-Marc Koffi',
        spatial: { position: 'relative', alignment: 'left' },
        textRules: { forcedCase: 'NONE', maxCharacters: 30, fontSize: 28, fontWeight: 'bold' },
        purpose: 'Name of the authority figure or customer giving the testimonial.',
      },
      {
        key: 'postHandle',
        label: 'Author @Handle',
        type: 'text',
        mandatory: true,
        defaultValue: '@dr_koffi_sante',
        spatial: { position: 'relative', alignment: 'left' },
        textRules: { forcedCase: 'NONE', maxCharacters: 25, fontSize: 22 },
        purpose: 'Twitter / social media handle giving platform credibility.',
      },
      {
        key: 'postAvatar',
        label: 'Author Profile Avatar',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/images_1.jpeg',
        spatial: { position: 'relative', width: 80, height: 80, borderRadius: 40 },
        compositionRules: {
          aspectRatio: '1:1',
          format: 'avatar-circle',
          subjectPlacement: 'CRITICAL: Face must be centered in square/circle crop.',
          minResolution: { width: 150, height: 150 },
        },
        purpose: 'Face photo of the testimonial provider.',
      },
      {
        key: 'postContent',
        label: 'Post / Testimonial Copy',
        type: 'text',
        mandatory: true,
        defaultValue: 'Après 3 semaines de test avec le thé volcanique, les résultats de mes patients sont stupéfiants. Aucune récidive constatée.',
        spatial: { position: 'relative', alignment: 'left' },
        textRules: { forcedCase: 'NONE', minWords: 12, maxWords: 40, maxCharacters: 220, fontSize: 32 },
        purpose: 'The authentic, unvarnished testimonial text.',
      },
      {
        key: 'postStats',
        label: 'Engagement Stats Line',
        type: 'text',
        mandatory: false,
        defaultValue: '1.4K Reposts · 8.9K Likes',
        spatial: { position: 'relative', alignment: 'left' },
        textRules: { forcedCase: 'NONE', maxCharacters: 40, fontSize: 20, fontWeight: 'bold' },
        purpose: 'Social proof numbers simulating viral engagement.',
      },
    ],
  },

  '4-a': {
    id: '4-a',
    name: '4-A: Recruitment & Opportunity Flyer',
    category: 'recruitment',
    categoryLabel: 'Recruitment & Hiring',
    description: 'Opportunity poster with top white/red header bar, large centered workplace photography, urgent badge, and dual-tier compensation banners.',
    bestUseCase: 'Recruiting tele-sales agents, hiring closing reps, distributor recruitment, affiliate onboarding.',
    recommendedNiches: ['Call Center & Telesales Hiring', 'Distributor Programs', 'Affiliate Network Expansion', 'Corporate Vacancies'],
    funnelStage: 'All-Stages',
    conversionRationale: 'Clear bold job title -> Real workplace photo building trust -> Immediate transparent salary figures answering the candidate\'s #1 question immediately.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'headerTitle',
        label: 'Job Position Header',
        type: 'text',
        mandatory: true,
        defaultValue: 'RECRUTEMENT COMMERCIAL URGENT',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 140, alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', minWords: 2, maxWords: 5, maxCharacters: 32, fontSize: 56, fontWeight: 'bold' },
        purpose: 'Large red headline naming the job or opportunity.',
      },
      {
        key: 'bodyImage',
        label: 'Centered Workplace / Office Photo',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/Copie_de_AFFICHE_RECRUTEMENT_CALL_CENTER_.png',
        spatial: { position: 'absolute', left: 80, top: 180, width: 920, height: 600, borderRadius: 16 },
        compositionRules: {
          aspectRatio: '23:15 (920x600)',
          format: 'full-bleed-photo',
          subjectPlacement: 'CRITICAL: The workplace environment, office team, or workers MUST BE CENTERED in the photo frame. The photo is 920px wide by 600px tall.',
          minResolution: { width: 920, height: 600 },
          notes: 'Authentic workplace photo showing agents with headsets, computers, or professional desks.',
        },
        purpose: 'Proves the legitimacy and professional atmosphere of the company.',
      },
      {
        key: 'flagBadgeUrl',
        label: 'Country Flag or Urgency Sticker',
        type: 'image',
        mandatory: false,
        defaultValue: '/templates/assets/PATSIMMSCFLYER7.png',
        spatial: { position: 'absolute', top: 30, left: 30, width: 120, height: 80 },
        compositionRules: { format: 'any' },
        purpose: 'Geographic targeting flag (e.g. Cameroon, Ivory Coast, Senegal) or urgent hiring sticker.',
      },
      {
        key: 'footerSalary',
        label: 'Primary Base Salary Text',
        type: 'text',
        mandatory: true,
        defaultValue: 'SALAIRE : 250.000 FCFA / MOIS',
        spatial: { position: 'absolute', left: 80, bottom: 90, width: 920, height: 'auto', alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', maxCharacters: 38, fontSize: 44, fontWeight: 'bold' },
        purpose: 'Bold black text displaying guaranteed base compensation.',
      },
      {
        key: 'footerCommissions',
        label: 'Secondary Commissions / Bonus Text',
        type: 'text',
        mandatory: false,
        defaultValue: '+ COMMISSIONS NON PLAFONNÉES',
        spatial: { position: 'absolute', left: 80, bottom: 40, width: 920, height: 'auto', alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', maxCharacters: 38, fontSize: 38, fontWeight: 'bold' },
        purpose: 'Red bold text highlighting uncapped performance upside.',
      },
    ],
  },

  '5-a': {
    id: '5-a',
    name: '5-A: Bold Typographic Flyer',
    category: 'typographic',
    categoryLabel: 'High-Impact Typographic',
    description: 'High-contrast text flyer on vibrant green background with giant bold headline, subtitle reassurance, and pointing hand emoji.',
    bestUseCase: 'Direct WhatsApp click-to-chat ad campaigns, urgent announcements, simple black-and-white propositions where image distractions lower conversion.',
    recommendedNiches: ['Direct WhatsApp Orders', 'Flash Announcements', 'High-Friction Problem Solutions', 'Viral Questions'],
    funnelStage: 'Problem-Aware',
    conversionRationale: 'Eliminates all image processing friction. On WhatsApp campaigns, users react faster to a massive direct question on a green background that matches WhatsApp branding.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'backgroundColor',
        label: 'Canvas Background Color',
        type: 'color',
        mandatory: false,
        defaultValue: '#55B23B',
        spatial: { position: 'relative' },
        purpose: 'Background color hex. Defaults to #55B23B (WhatsApp green).',
      },
      {
        key: 'title',
        label: 'Giant Centered Headline',
        type: 'text',
        mandatory: true,
        defaultValue: 'VOULEZ-VOUS DURER PLUS DE 45 MINUTES NATURELLEMENT ?',
        spatial: { position: 'relative', alignment: 'center' },
        textRules: { forcedCase: 'UPPERCASE', minWords: 3, maxWords: 10, maxCharacters: 55, fontSize: 72, fontWeight: 'bold', guidance: 'Massive white bold text.' },
        purpose: 'The singular, unavoidable question or value proposition.',
      },
      {
        key: 'subtitle',
        label: 'Subtitle / Action Reassurance',
        type: 'text',
        mandatory: false,
        defaultValue: 'CLIQUEZ CI-DESSOUS POUR COMMANDER SUR WHATSAPP',
        spatial: { position: 'relative', alignment: 'center' },
        textRules: { forcedCase: 'NONE', minWords: 3, maxWords: 12, maxCharacters: 65, fontSize: 44, fontWeight: '500' },
        purpose: 'Clear directional instruction driving the click.',
      },
      {
        key: 'emoji',
        label: 'Corner Pointer Emoji',
        type: 'text',
        mandatory: false,
        defaultValue: '👇',
        spatial: { position: 'absolute', bottom: 80 },
        purpose: 'Dual bottom corner emojis (default 👇) directing attention to the ad CTA button.',
      },
    ],
  },

  'custom': {
    id: 'custom',
    name: 'Custom Visual Canvas (Freeform Layers)',
    category: 'custom',
    categoryLabel: 'Studio Canvas',
    description: 'Freeform visual canvas with multi-layer stacking for custom text, shape, and image compositions constructed by external graphic tools or canvas builders.',
    bestUseCase: 'Bespoke multi-layer designs generated by external AI agents or graphic layout algorithms.',
    recommendedNiches: ['Custom Branded Ads', 'Multi-Layer Graphic Compositions'],
    funnelStage: 'All-Stages',
    conversionRationale: 'Provides full flexibility for arbitrary layout configurations.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'canvasBgColor',
        label: 'Canvas Background Color',
        type: 'color',
        mandatory: false,
        defaultValue: '#0f172a',
        spatial: { position: 'relative' },
        purpose: 'Base background color for the canvas.',
      },
      {
        key: 'layers',
        label: 'Layer Stack Hierarchy',
        type: 'layers',
        mandatory: false,
        defaultValue: [],
        spatial: { position: 'relative' },
        purpose: 'Array of layer objects { id, type: "text"|"image"|"shape", left, top, width, height, zIndex, ... }',
      },
    ],
  },
  'hd-red-circle': {
    id: 'hd-red-circle',
    name: 'HD-1: Sabri Suby Red Circle & Jitter Arrow',
    category: 'direct-response',
    categoryLabel: 'High-Dopamine Direct Response',
    description: 'Pattern-interrupt Sabri Suby archetype featuring an imperfect hand-drawn red markup circle, quadratic Bezier curved jitter arrow pointing to mystery detail, and bottom tabloid breaking news banner with white/yellow chromatic font split.',
    bestUseCase: 'Cold traffic pattern interrupts for supplements, physical gadgets, info-products, and controversial mechanisms where high CTR and curiosity gaps are critical.',
    recommendedNiches: ['Dietary Supplements & Wellness', 'E-commerce Physical Inventions', 'Agency & SaaS Acquisition', 'Info-Products & Secret Protocols'],
    funnelStage: 'Problem-Aware',
    conversionRationale: 'Forces the viewer brain into a visual intrigue gap: "Why is that detail circled in red and what is the arrow pointing at?" The bottom tabloid breaking news banner delivers high authority news framing.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'subjectImage',
        label: 'Subject Portrait / Candid Scene',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/subject_speaker.png',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 1080 },
        compositionRules: {
          format: 'full-bleed-photo',
          aspectRatio: '1:1',
          subjectPlacement: 'Authentic iPhone candid style or portrait with subject looking at camera or laptop, leaving negative space for mystery circle.',
          minResolution: { width: 1080, height: 1080 },
        },
        purpose: 'Establishes primary contextual scene and human subject.',
      },
      {
        key: 'mysteryImage',
        label: 'Mystery Detail (Inside Red Circle)',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/33.png',
        spatial: { position: 'absolute', left: 650, top: 230, width: 260, height: 260, borderRadius: 130 },
        compositionRules: {
          format: 'any',
          aspectRatio: '1:1',
          subjectPlacement: 'Close-up zoom of the secret mechanism, physical object, check, or controversial element.',
          minResolution: { width: 300, height: 300 },
        },
        purpose: 'The focal point of curiosity that creates the intrigue gap.',
      },
      {
        key: 'headlineWhite',
        label: 'Banner Lead Hook (White Bold)',
        type: 'text',
        mandatory: true,
        defaultValue: 'DATA LEAK:',
        spatial: { position: 'absolute', left: 36, bottom: 60, alignment: 'left' },
        textRules: {
          forcedCase: 'UPPERCASE',
          minWords: 1,
          maxWords: 4,
          maxCharacters: 25,
          fontSize: 44,
          fontWeight: 'bold',
          guidance: 'Crisp white qualification or news hook prefix (e.g. DATA LEAK, WHISTLEBLOWER, CAUGHT ON CAMERA).',
        },
        purpose: 'Catches the eye and primes the news angle.',
      },
      {
        key: 'headlineYellow',
        label: 'Banner Accent Hook (Tabloid Yellow)',
        type: 'text',
        mandatory: true,
        defaultValue: 'WHY TOP AGENCIES ARE HIDING THIS PROTOCOL',
        spatial: { position: 'absolute', left: 36, bottom: 30, alignment: 'left' },
        textRules: {
          forcedCase: 'UPPERCASE',
          minWords: 3,
          maxWords: 10,
          maxCharacters: 65,
          fontSize: 44,
          fontWeight: 'bold',
          guidance: 'Vibrant tabloid yellow (#FFE500) curiosity statement explaining the intrigue.',
        },
        purpose: 'Delivers the emotional punch that compels clicking.',
      },
      {
        key: 'footerReassurance',
        label: 'Banner Investigation / Source Tag',
        type: 'text',
        mandatory: false,
        defaultValue: 'CONFIDENTIAL REPORT · SOURCE: INTERNAL AUDIT',
        spatial: { position: 'absolute', left: 36, bottom: 170, alignment: 'left' },
        textRules: {
          forcedCase: 'UPPERCASE',
          minWords: 2,
          maxWords: 8,
          maxCharacters: 50,
          fontSize: 18,
          fontWeight: 'bold',
          guidance: 'Credibility source or investigation disclaimer.',
        },
        purpose: 'Adds investigative journalistic credibility.',
      },
    ],
  },
  'hd-breaking-news': {
    id: 'hd-breaking-news',
    name: 'HD-2: Tabloid Breaking News Card',
    category: 'publisher',
    categoryLabel: 'Tabloid News Broadcast',
    description: 'Broadcast-grade news card with pulsing red alert pill badge, full-bleed candid photo, high-contrast bottom gradient vignette, and lower-third news ticker with bracketed highlight support.',
    bestUseCase: 'Disruptive industry news, PR announcements, exposé hooks, market updates, and authority controversies.',
    recommendedNiches: ['Tech & SaaS', 'Crypto & Wealth', 'Health Controversies', 'B2B Consulting & Marketing', 'Consumer Advocacy'],
    funnelStage: 'Unaware',
    conversionRationale: 'Bypasses standard ad blindness by presenting the offer under an authentic breaking news aesthetic (LADbible/TMZ/CNN lower-third).',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'backgroundImage',
        label: 'Atmospheric News Background',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/zuck_news_bg.jpg',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 1080 },
        compositionRules: {
          format: 'full-bleed-photo',
          aspectRatio: '1:1',
          subjectPlacement: 'High-emotion face, public figure, or dramatic situational photograph.',
          minResolution: { width: 1080, height: 1080 },
        },
        purpose: 'Sets dramatic editorial scene.',
      },
      {
        key: 'alertBadgeText',
        label: 'Alert Pill Badge Text',
        type: 'text',
        mandatory: true,
        defaultValue: 'BREAKING NEWS',
        spatial: { position: 'absolute', left: 50, top: 50, height: 48, alignment: 'left' },
        textRules: {
          forcedCase: 'UPPERCASE',
          minWords: 1,
          maxWords: 3,
          maxCharacters: 20,
          fontSize: 22,
          fontWeight: 'bold',
          guidance: 'High-urgency pill text: BREAKING NEWS, REVEALED, EXCLUSIVE, or URGENT UPDATE.',
        },
        purpose: 'Scroll-stopping badge creating immediate news urgency.',
      },
      {
        key: 'sourceText',
        label: 'Source / Metadata Header',
        type: 'text',
        mandatory: true,
        defaultValue: 'CONSUMER REPORT · INVESTIGATION',
        spatial: { position: 'absolute', left: 50, bottom: 250, alignment: 'left' },
        textRules: {
          forcedCase: 'UPPERCASE',
          minWords: 2,
          maxWords: 6,
          maxCharacters: 40,
          fontSize: 18,
          fontWeight: 'bold',
          guidance: 'Journalistic source citation for the red strip.',
        },
        purpose: 'Institutional credibility layer.',
      },
      {
        key: 'headline',
        label: 'Massive Broadcast Headline',
        type: 'text',
        mandatory: true,
        defaultValue: 'LEAKED MEMO EXPOSES [42M ALGORITHM SHIFT] FORCING IMMEDIATE ACTION',
        spatial: { position: 'absolute', left: 78, bottom: 120, width: 924, alignment: 'left' },
        textRules: {
          forcedCase: 'UPPERCASE',
          minWords: 4,
          maxWords: 12,
          maxCharacters: 90,
          fontSize: 48,
          fontWeight: 'bold',
          highlightSyntax: '[Bracketed text] will be rendered in vibrant tabloid yellow.',
          guidance: 'Massive bold sans-serif headline. Use [brackets] to highlight keywords in yellow.',
        },
        purpose: 'Main editorial news hook stopping the feed scroll.',
      },
      {
        key: 'subtitle',
        label: 'Investigation Subtitle / Details',
        type: 'text',
        mandatory: false,
        defaultValue: 'Independent audits confirm 3 out of 4 established accounts lost tracking visibility overnight.',
        spatial: { position: 'absolute', left: 78, bottom: 70, width: 924, alignment: 'left' },
        textRules: {
          minWords: 6,
          maxWords: 18,
          maxCharacters: 120,
          fontSize: 26,
          fontWeight: 'normal',
          guidance: 'Expands on the headline with concrete details or statistics.',
        },
        purpose: 'Deepens curiosity and drives reader into the primary ad copy.',
      },
    ],
  },
  'hd-native-alert': {
    id: 'hd-native-alert',
    name: 'HD-3: Native SMS / Notification Overlay',
    category: 'social',
    categoryLabel: 'Social Native Proof',
    description: 'Ultra-candid lifestyle photo overlay with floating iOS translucent chat notification card, verified sender badge, and odd-number conversational proof.',
    bestUseCase: 'Social proof, testimonial leaks, peer-to-peer conversations, transformation receipts, and high-trust offers.',
    recommendedNiches: ['Coaching & Education', 'Fitness & Diet Transformations', 'Agency/Freelance Results', 'Affiliate Marketing', 'Local Services'],
    funnelStage: 'Solution-Aware',
    conversionRationale: 'Triggers smartphone notification-checking reflexes; appears as an authentic leaked text message between trusted peers instead of an advertisement.',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        key: 'backgroundImage',
        label: 'Candid iPhone Lifestyle Photo',
        type: 'image',
        mandatory: true,
        defaultValue: '/templates/assets/subject_couple.png',
        spatial: { position: 'absolute', left: 0, top: 0, width: 1080, height: 1080 },
        compositionRules: {
          format: 'full-bleed-photo',
          aspectRatio: '1:1',
          subjectPlacement: 'Authentic raw photo, non-studio lighting (car, dinner, kitchen, desk selfie).',
          minResolution: { width: 1080, height: 1080 },
        },
        purpose: 'Provides believable, unpolished social context.',
      },
      {
        key: 'senderName',
        label: 'Message Sender Name',
        type: 'text',
        mandatory: true,
        defaultValue: 'Dr. Koffi',
        spatial: { position: 'absolute', left: 140, top: 130, alignment: 'left' },
        textRules: {
          minWords: 1,
          maxWords: 3,
          maxCharacters: 25,
          fontSize: 26,
          fontWeight: 'bold',
          guidance: 'Realistic contact name: Mom, Dr. Koffi, CFO, Head of Operations, Coach Marcus.',
        },
        purpose: 'Identifies the conversational authority or peer.',
      },
      {
        key: 'timestamp',
        label: 'Notification Timestamp',
        type: 'text',
        mandatory: false,
        defaultValue: 'Today 2:45 PM',
        spatial: { position: 'absolute', right: 90, top: 96, alignment: 'right' },
        textRules: {
          maxCharacters: 20,
          fontSize: 18,
          fontWeight: '500',
          guidance: 'Time indicator e.g. "now", "2m ago", "Today 2:45 PM".',
        },
        purpose: 'Simulates active real-time notification.',
      },
      {
        key: 'messageText',
        label: 'Message Bubble Text',
        type: 'text',
        mandatory: true,
        defaultValue: "The new batch cleared the test group in 48 hours. We recorded a 94.2% success rate with zero side effects. Do not leak this yet!",
        spatial: { position: 'absolute', left: 92, top: 180, width: 896, alignment: 'left' },
        textRules: {
          minWords: 6,
          maxWords: 30,
          maxCharacters: 180,
          fontSize: 30,
          fontWeight: '500',
          guidance: 'Casual message hook using odd numbers, surprise, or urgent whisper copy.',
        },
        purpose: 'The core conversational proof hook.',
      },
      {
        key: 'calloutBadge',
        label: 'App Category / Proof Badge',
        type: 'text',
        mandatory: false,
        defaultValue: 'VERIFIED SMS ALERT',
        spatial: { position: 'absolute', left: 210, top: 96, alignment: 'left' },
        textRules: {
          forcedCase: 'UPPERCASE',
          maxCharacters: 25,
          fontSize: 16,
          fontWeight: 'bold',
          guidance: 'Sub-badge next to MESSAGES e.g. VERIFIED SMS ALERT or PRIVATE THREAD.',
        },
        purpose: 'Clarifies authentication and credibility.',
      },
      {
        key: 'bottomNotice',
        label: 'Bottom Pill Action Prompt',
        type: 'text',
        mandatory: false,
        defaultValue: 'Tap to view full message thread • 100% Confidential',
        spatial: { position: 'absolute', left: 0, bottom: 50, width: 1080, alignment: 'center' },
        textRules: {
          maxCharacters: 70,
          fontSize: 22,
          fontWeight: 'bold',
          guidance: 'Curiosity CTA pill at bottom of ad.',
        },
        purpose: 'Directs viewer to take action or click.',
      },
    ],
  },
};

import { getDynamicTemplate, listDynamicTemplates } from './storage';

/**
 * Helper to fetch a complete contract
 */
export function getTemplateContract(templateId: string): TemplateContract | undefined {
  return TEMPLATE_CONTRACTS[templateId];
}

/**
 * Resolves a contract across built-in static templates AND dynamically stored templates.
 */
export async function resolveTemplateContract(templateId: string): Promise<TemplateContract | undefined> {
  if (TEMPLATE_CONTRACTS[templateId]) {
    return TEMPLATE_CONTRACTS[templateId];
  }
  const dynamicTpl = await getDynamicTemplate(templateId);
  return dynamicTpl?.contract;
}

/**
 * Lists all template contracts combining built-in presets and dynamic stored templates.
 */
export async function listAllTemplateContracts(): Promise<TemplateContract[]> {
  const staticList = Object.values(TEMPLATE_CONTRACTS);
  const dynamicList = await listDynamicTemplates();
  const dynamicContracts = dynamicList.map(d => d.contract).filter(Boolean);
  return [...staticList, ...dynamicContracts];
}

/**
 * Diagnostic validation for external callers.
 * Validates an incoming variables payload against the template's contract.
 */
export interface ValidationDiagnostic {
  isValid: boolean;
  templateId: string;
  missingMandatory: string[];
  warnings: string[];
  compositionAdvice: string[];
  resolvedVariables: Record<string, any>;
}

export function validateTemplatePayload(
  templateId: string,
  variables: Record<string, any> = {},
  customContract?: TemplateContract
): ValidationDiagnostic {
  const contract = customContract || TEMPLATE_CONTRACTS[templateId];
  if (!contract) {
    return {
      isValid: false,
      templateId,
      missingMandatory: [`Invalid templateId "${templateId}".`],
      warnings: [],
      compositionAdvice: [],
      resolvedVariables: variables,
    };
  }

  const missingMandatory: string[] = [];
  const warnings: string[] = [];
  const compositionAdvice: string[] = [];
  const resolvedVariables: Record<string, any> = { ...variables };

  for (const elem of contract.elements) {
    const val = variables[elem.key];
    const isProvided = val !== undefined && val !== null && val !== '';

    // Check mandatory
    if (elem.mandatory && !isProvided) {
      missingMandatory.push(`Missing mandatory element: "${elem.key}" (${elem.label})`);
      // Fill with default so rendering won't crash if forced
      resolvedVariables[elem.key] = elem.defaultValue;
    }

    // Check text rules
    if (elem.type === 'text' && isProvided && typeof val === 'string') {
      if (elem.textRules?.maxCharacters && val.length > elem.textRules.maxCharacters) {
        warnings.push(`Text for "${elem.key}" is ${val.length} chars (exceeds recommended max ${elem.textRules.maxCharacters} chars). Text may overflow or shrink on mobile.`);
      }
      if (elem.textRules?.forcedCase === 'UPPERCASE' && val.toUpperCase() !== val) {
        warnings.push(`Element "${elem.key}" works best in UPPERCASE for visual punch. Recommended: "${val.toUpperCase()}"`);
      }
    }

    // Check image composition rules
    if (elem.type === 'image') {
      if (elem.compositionRules?.subjectPlacement) {
        compositionAdvice.push(`[${elem.key}]: ${elem.compositionRules.subjectPlacement}`);
      }
      if (elem.compositionRules?.format === 'transparent-png' && typeof val === 'string' && !val.includes('.png') && !val.includes('image/png')) {
        warnings.push(`[${elem.key}] is marked as "transparent-png". Ensure your asset has a transparent background to prevent rectangular artifacts.`);
      }
    }
  }

  return {
    isValid: missingMandatory.length === 0,
    templateId,
    missingMandatory,
    warnings,
    compositionAdvice,
    resolvedVariables,
  };
}
