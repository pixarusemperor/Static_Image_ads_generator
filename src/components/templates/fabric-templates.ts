// Fabric.js canvas JSON definitions for the 7 existing templates
// These are compatible with fabric.Canvas.loadFromJSON()

export interface FabricTemplate {
  id: string;
  name: string;
  category: string;
  canvas_json: Record<string, any>;
  width: number;
  height: number;
}

export const FABRIC_TEMPLATES: FabricTemplate[] = [
  // ── Template 1-A: Direct-Response Niche Product Ad ──────────────────
  {
    id: '1-a',
    name: 'Direct-Response Product Ad',
    category: 'direct-response',
    width: 1080,
    height: 1080,
    canvas_json: {
      version: '6.0.0',
      objects: [
        // Black header banner
        { type: 'rect', left: 0, top: 0, width: 1080, height: 100, fill: '#000000', selectable: false },
        // Header line 1
        { type: 'textbox', left: 0, top: 0, width: 1080, height: 100, text: 'TU VERSES LE LIQUIDE VITE', fontSize: 44, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', editable: true },
        // Red header banner
        { type: 'rect', left: 0, top: 100, width: 1080, height: 110, fill: '#E50914', selectable: false },
        // Header line 2
        { type: 'textbox', left: 0, top: 100, width: 1080, height: 110, text: '2 MINUTES? TU ES FAIBLE?', fontSize: 52, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', editable: true },
        // Subject image placeholder
        { type: 'rect', left: 80, top: 240, width: 520, height: 620, fill: '#374151', rx: 30, ry: 30, selectable: false },
        // Product image placeholder
        { type: 'rect', left: 660, top: 300, width: 330, height: 460, fill: '#4B5563', selectable: false },
        // Price badge bg
        { type: 'rect', left: 650, top: 780, width: 350, height: 70, fill: '#000000', rx: 15, ry: 15, selectable: false },
        // Price badge text
        { type: 'textbox', left: 650, top: 780, width: 350, height: 70, text: 'PRIX 5.000F(10$)', fontSize: 32, fontFamily: 'Inter', fontWeight: 'bold', fill: '#FFE600', textAlign: 'center', editable: true },
        // Red footer banner
        { type: 'rect', left: 0, top: 880, width: 1080, height: 90, fill: '#E50914', selectable: false },
        // Footer line 1
        { type: 'textbox', left: 0, top: 880, width: 1080, height: 90, text: 'LIS LA METHODE ET APPLIQUES', fontSize: 40, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', editable: true },
        // Footer line 2
        { type: 'textbox', left: 0, top: 970, width: 1080, height: 110, text: 'PAS BESOIN DE FAIRE LE SPORT', fontSize: 44, fontFamily: 'Inter', fontWeight: 'bold', fill: '#E50914', textAlign: 'center', editable: true },
      ],
    },
  },

  // ── Template 1-B: Product Showcase ──────────────────────────────────
  {
    id: '1-b',
    name: 'Product Showcase',
    category: 'direct-response',
    width: 1080,
    height: 1080,
    canvas_json: {
      version: '6.0.0',
      objects: [
        // Background image placeholder
        { type: 'rect', left: 0, top: 0, width: 1080, height: 500, fill: '#1E3A5F', selectable: false },
        // Product image placeholder
        { type: 'rect', left: 780, top: 380, width: 230, height: 330, fill: '#4B5563', selectable: false },
        // Price badge bg
        { type: 'rect', left: 740, top: 740, width: 310, height: 64, fill: '#000000', rx: 32, ry: 32, selectable: false },
        // Price badge text
        { type: 'textbox', left: 740, top: 740, width: 310, height: 64, text: 'PRIX 5.000F(10$)', fontSize: 28, fontFamily: 'Inter', fontWeight: 'bold', fill: '#FFE600', textAlign: 'center', editable: true },
        // Main title
        { type: 'textbox', left: 60, top: 520, width: 680, height: 80, text: '2 MINUTES AU LIT', fontSize: 64, fontFamily: 'Inter', fontWeight: 'bold', fill: '#E50914', editable: true },
        // Subtitle
        { type: 'textbox', left: 60, top: 600, width: 680, height: 60, text: "C'EST RIDICULE", fontSize: 48, fontFamily: 'Inter', fontWeight: 'bold', fill: '#000000', editable: true },
        // Body paragraph
        { type: 'textbox', left: 60, top: 680, width: 680, height: 180, text: 'Découvrez la méthode naturelle pour durer plus longtemps au lit sans aucun effet secondaire ni produit chimique.', fontSize: 28, fontFamily: 'Inter', fill: '#4B5563', editable: true },
        // Footer bg
        { type: 'rect', left: 0, top: 880, width: 1080, height: 200, fill: '#E50914', selectable: false },
        // Footer text
        { type: 'textbox', left: 0, top: 880, width: 1080, height: 200, text: 'CA MARCHE SANS PRODUIT', fontSize: 48, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', editable: true },
      ],
    },
  },

  // ── Template 2-A: Publisher Content Card ────────────────────────────
  {
    id: '2-a',
    name: 'Publisher Content Card',
    category: 'publisher',
    width: 1080,
    height: 1080,
    canvas_json: {
      version: '6.0.0',
      objects: [
        // Background image placeholder
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#1a1a2e', selectable: false },
        // Bottom gradient overlay
        { type: 'rect', left: 0, top: 540, width: 1080, height: 540, fill: 'rgba(0,0,0,0.7)', selectable: false },
        // Avatar circle placeholder
        { type: 'circle', left: 840, top: 540, radius: 80, fill: '#374151', selectable: false },
        // Headline text
        { type: 'textbox', left: 80, top: 740, width: 920, height: 240, text: 'CETTE HABITUDE [TUE] APPRIVOISEE PAR LA SCIENCE', fontSize: 48, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', editable: true },
      ],
    },
  },

  // ── Template 3-A: Book/Testimonial Ad ───────────────────────────────
  {
    id: '3-a',
    name: 'Book Testimonial Ad',
    category: 'testimonial',
    width: 1080,
    height: 1080,
    canvas_json: {
      version: '6.0.0',
      objects: [
        // Background image placeholder
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#1a1a2e', selectable: false },
        // Product circle
        { type: 'circle', left: 80, top: 80, radius: 120, fill: '#374151', selectable: false },
        // Promo badge bg
        { type: 'rect', left: 740, top: 80, width: 260, height: 60, fill: '#E50914', rx: 30, ry: 30, selectable: false },
        // Promo badge text
        { type: 'textbox', left: 740, top: 80, width: 260, height: 60, text: 'OFFRE EXCLUSIVE', fontSize: 24, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', editable: true },
        // Headline
        { type: 'textbox', left: 100, top: 760, width: 880, height: 200, text: 'CE LIVRE A CHANGE MA VIE EN 30 JOURS', fontSize: 56, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', editable: true },
      ],
    },
  },

  // ── Template 3-B: Social Media Post ─────────────────────────────────
  {
    id: '3-b',
    name: 'Social Media Post',
    category: 'social',
    width: 1080,
    height: 1080,
    canvas_json: {
      version: '6.0.0',
      objects: [
        // Background image placeholder
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#1a1a2e', selectable: false },
        // Card background
        { type: 'rect', left: 90, top: 290, width: 900, height: 500, fill: '#ffffff', rx: 24, ry: 24, selectable: false },
        // Author avatar
        { type: 'circle', left: 140, top: 340, radius: 50, fill: '#374151', selectable: false },
        // Author name
        { type: 'textbox', left: 260, top: 340, width: 680, height: 50, text: 'Alex Hormozi', fontSize: 32, fontFamily: 'Inter', fontWeight: 'bold', fill: '#000000', editable: true },
        // Author handle
        { type: 'textbox', left: 260, top: 390, width: 680, height: 40, text: '@AlexHormozi', fontSize: 24, fontFamily: 'Inter', fill: '#6B7280', editable: true },
        // Post content
        { type: 'textbox', left: 140, top: 460, width: 800, height: 220, text: "The biggest mistake people make in their 20s is thinking they have time. You don't. Work like someone is trying to take it all away from you.", fontSize: 28, fontFamily: 'Inter', fill: '#1F2937', editable: true },
        // Stats footer
        { type: 'textbox', left: 140, top: 700, width: 800, height: 50, text: '12.4k Likes • 2.1k Retweets', fontSize: 22, fontFamily: 'Inter', fontWeight: 'bold', fill: '#6B7280', editable: true },
      ],
    },
  },

  // ── Template 4-A: Recruitment Flyer ─────────────────────────────────
  {
    id: '4-a',
    name: 'Recruitment Flyer',
    category: 'recruitment',
    width: 1080,
    height: 1080,
    canvas_json: {
      version: '6.0.0',
      objects: [
        // Black header banner
        { type: 'rect', left: 0, top: 0, width: 1080, height: 140, fill: '#000000', selectable: false },
        // Header title
        { type: 'textbox', left: 0, top: 0, width: 1080, height: 140, text: 'RECRUTEMENT TELEVENTE', fontSize: 48, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', editable: true },
        // Body image placeholder
        { type: 'rect', left: 80, top: 180, width: 920, height: 600, fill: '#374151', rx: 16, ry: 16, selectable: false },
        // Flag badge
        { type: 'circle', left: 880, top: 150, radius: 40, fill: '#4B5563', selectable: false },
        // Footer bg
        { type: 'rect', left: 0, top: 820, width: 1080, height: 260, fill: '#E50914', selectable: false },
        // Salary text
        { type: 'textbox', left: 0, top: 850, width: 1080, height: 80, text: 'SALAIRE DE BASE: 150.000 F CFA', fontSize: 40, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', editable: true },
        // Commissions text
        { type: 'textbox', left: 0, top: 930, width: 1080, height: 80, text: '+ COMMISSIONS DEPLAFONNEES', fontSize: 36, fontFamily: 'Inter', fontWeight: 'bold', fill: '#FFE600', textAlign: 'center', editable: true },
      ],
    },
  },

  // ── Template 5-A: Typographic Flyer ─────────────────────────────────
  {
    id: '5-a',
    name: 'Typographic Flyer',
    category: 'typographic',
    width: 1080,
    height: 1080,
    canvas_json: {
      version: '6.0.0',
      objects: [
        // Green background
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#55B23B', selectable: false },
        // Main title
        { type: 'textbox', left: 80, top: 300, width: 920, height: 200, text: 'DOUBLER VOS VENTES EN 90 JOURS', fontSize: 56, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', editable: true },
        // Subtitle
        { type: 'textbox', left: 80, top: 520, width: 920, height: 100, text: '(SANS PAYER PLUS DE PUBLICITÉ)', fontSize: 40, fontFamily: 'Inter', fontWeight: 'bold', fill: '#000000', textAlign: 'center', editable: true },
        // Emoji 1
        { type: 'textbox', left: 80, top: 850, width: 150, height: 150, text: '👇', fontSize: 96, fontFamily: 'Inter', textAlign: 'center', editable: true },
        // Emoji 2
        { type: 'textbox', left: 850, top: 850, width: 150, height: 150, text: '👇', fontSize: 96, fontFamily: 'Inter', textAlign: 'center', editable: true },
      ],
    },
  },
];

export function getFabricTemplate(id: string): FabricTemplate | undefined {
  return FABRIC_TEMPLATES.find(t => t.id === id);
}
