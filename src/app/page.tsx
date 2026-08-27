'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  getTemplateComponent, 
  TemplateId 
} from '@/components/templates';
import { 
  Upload, 
  Download, 
  Send, 
  Sparkles, 
  Layers, 
  Settings, 
  RefreshCw, 
  Sliders, 
  Wand2, 
  Image as ImageIcon,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Type,
  Square,
  Circle,
  Maximize2,
  Layers2,
  Undo
} from 'lucide-react';
import { CanvasLayer } from '@/components/templates/CustomTemplate';
import { FabricCanvas } from '@/components/FabricCanvas';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import { FABRIC_TEMPLATES, getFabricTemplate } from '@/components/templates/fabric-templates';
import { RightSidebar } from '@/components/RightSidebar';
import { TemplateSelector } from '@/components/TemplateSelector';
import { getTemplateMetadata } from '@/components/templates/template-registry';

// Fabric.js template JSON for the 7 templates + blank canvas
import type * as fabric from 'fabric';

// Define initial layers list for ALL 7 templates + custom canvas (kept for backward compat)
const initialTemplateLayers: Record<TemplateId, CanvasLayer[]> = {
  '1-a': [
    // Header Banner 1
    {
      id: 'headerBanner1',
      type: 'shape',
      name: 'Header Banner 1',
      left: 0,
      top: 0,
      width: 1080,
      height: 100,
      zIndex: 1,
      shapeType: 'rect',
      backgroundColor: '#000000',
    },
    // Header Line 1 Text
    {
      id: 'headerLine1',
      type: 'text',
      name: 'Header Line 1',
      left: 0,
      top: 0,
      width: 1080,
      height: 100,
      zIndex: 2,
      text: 'TU VERSES LE LIQUIDE VITE',
      color: '#FFFFFF',
      fontSize: 44,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Header Banner 2
    {
      id: 'headerBanner2',
      type: 'shape',
      name: 'Header Banner 2',
      left: 0,
      top: 100,
      width: 1080,
      height: 110,
      zIndex: 3,
      shapeType: 'rect',
      backgroundColor: '#E50914',
    },
    // Header Line 2 Text
    {
      id: 'headerLine2',
      type: 'text',
      name: 'Header Line 2',
      left: 0,
      top: 100,
      width: 1080,
      height: 110,
      zIndex: 4,
      text: '2 MINUTES? TU ES FAIBLE?',
      color: '#FFFFFF',
      fontSize: 52,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Subject Image
    {
      id: 'subjectImage',
      type: 'image',
      name: 'Subject Image',
      left: 80,
      top: 240,
      width: 520,
      height: 620,
      zIndex: 5,
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      borderRadius: 30,
    },
    // Product Image
    {
      id: 'productImage',
      type: 'image',
      name: 'Product Mockup',
      left: 660,
      top: 300,
      width: 330,
      height: 460,
      zIndex: 6,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    },
    // Price Badge Background
    {
      id: 'priceBadgeBg',
      type: 'shape',
      name: 'Price Badge Bg',
      left: 650,
      top: 780,
      width: 350,
      height: 70,
      zIndex: 7,
      shapeType: 'rect',
      backgroundColor: '#000000',
      borderRadius: 15,
    },
    // Price Badge Text
    {
      id: 'priceBadgeText',
      type: 'text',
      name: 'Price Badge Text',
      left: 650,
      top: 780,
      width: 350,
      height: 70,
      zIndex: 8,
      text: 'PRIX 5.000F(10$)',
      color: '#FFE600',
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Footer Banner 1
    {
      id: 'footerBanner1',
      type: 'shape',
      name: 'Footer Banner 1',
      left: 0,
      top: 880,
      width: 1080,
      height: 90,
      zIndex: 9,
      shapeType: 'rect',
      backgroundColor: '#E50914',
    },
    // Footer Line 1 Text
    {
      id: 'footerLine1',
      type: 'text',
      name: 'Footer Line 1',
      left: 0,
      top: 880,
      width: 1080,
      height: 90,
      zIndex: 10,
      text: 'LIS LA METHODE ET APPLIQUES',
      color: '#FFFFFF',
      fontSize: 40,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Footer Line 2 Text
    {
      id: 'footerLine2',
      type: 'text',
      name: 'Footer Line 2',
      left: 0,
      top: 970,
      width: 1080,
      height: 110,
      zIndex: 11,
      text: 'PAS BESOIN DE FAIRE LE SPORT',
      color: '#E50914',
      fontSize: 44,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  ],
  '1-b': [
    // Top Background Image
    {
      id: 'topBackgroundImage',
      type: 'image',
      name: 'Top Background',
      left: 0,
      top: 0,
      width: 1080,
      height: 500,
      zIndex: 1,
      imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800',
    },
    // Product Image
    {
      id: 'productImage',
      type: 'image',
      name: 'Product Mockup',
      left: 780,
      top: 380,
      width: 230,
      height: 330,
      zIndex: 2,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    },
    // Price Badge Bg
    {
      id: 'priceBadgeBg',
      type: 'shape',
      name: 'Price Badge Bg',
      left: 740,
      top: 740,
      width: 310,
      height: 64,
      zIndex: 3,
      shapeType: 'rect',
      backgroundColor: '#000000',
      borderRadius: 32,
    },
    // Price Badge Text
    {
      id: 'priceBadgeText',
      type: 'text',
      name: 'Price Badge Text',
      left: 740,
      top: 740,
      width: 310,
      height: 64,
      zIndex: 4,
      text: 'PRIX 5.000F(10$)',
      color: '#FFE600',
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Main Title
    {
      id: 'title',
      type: 'text',
      name: 'Main Title',
      left: 60,
      top: 520,
      width: 680,
      height: 80,
      zIndex: 5,
      text: '2 MINUTES AU LIT',
      color: '#E50914',
      fontSize: 64,
      fontWeight: 'bold',
    },
    // Subtitle
    {
      id: 'subtitle',
      type: 'text',
      name: 'Subtitle',
      left: 60,
      top: 600,
      width: 680,
      height: 60,
      zIndex: 6,
      text: "C'EST RIDICULE",
      color: '#000000',
      fontSize: 48,
      fontWeight: 'bold',
    },
    // Body Paragraph
    {
      id: 'bodyParagraph',
      type: 'text',
      name: 'Body Paragraph',
      left: 60,
      top: 680,
      width: 680,
      height: 180,
      zIndex: 7,
      text: 'Découvrez la méthode naturelle pour durer plus longtemps au lit sans aucun effet secondaire ni produit chimique.',
      color: '#4B5563',
      fontSize: 28,
    },
    // Footer Background
    {
      id: 'footerBg',
      type: 'shape',
      name: 'Footer Background',
      left: 0,
      top: 880,
      width: 1080,
      height: 200,
      zIndex: 8,
      shapeType: 'rect',
      backgroundColor: '#E50914',
    },
    // Footer Text
    {
      id: 'footerText',
      type: 'text',
      name: 'Footer Text',
      left: 0,
      top: 880,
      width: 1080,
      height: 200,
      zIndex: 9,
      text: 'CA MARCHE SANS PRODUIT',
      color: '#FFFFFF',
      fontSize: 48,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  ],
  '2-a': [
    // Background Image
    {
      id: 'backgroundImage',
      type: 'image',
      name: 'Background Image',
      left: 0,
      top: 0,
      width: 1080,
      height: 1080,
      zIndex: 1,
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000',
    },
    // Bottom Shadow/Gradient Shape Overlay
    {
      id: 'gradientOverlay',
      type: 'shape',
      name: 'Bottom Dark Gradient',
      left: 0,
      top: 540,
      width: 1080,
      height: 540,
      zIndex: 2,
      shapeType: 'rect',
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    // Avatar Circle
    {
      id: 'avatarUrl',
      type: 'image',
      name: 'Avatar Inset',
      left: 840,
      top: 540,
      width: 160,
      height: 160,
      zIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      borderRadius: 80,
    },
    // Headline Text
    {
      id: 'headline',
      type: 'text',
      name: 'Headline Text',
      left: 80,
      top: 740,
      width: 920,
      height: 240,
      zIndex: 4,
      text: 'CETTE HABITUDE [TUE] APPRIVOISEE PAR LA SCIENCE',
      color: '#FFFFFF',
      fontSize: 48,
      fontWeight: 'bold',
    },
  ],
  '3-a': [
    // Background Image
    {
      id: 'backgroundImage',
      type: 'image',
      name: 'Background Image',
      left: 0,
      top: 0,
      width: 1080,
      height: 1080,
      zIndex: 1,
      imageUrl: 'https://images.unsplash.com/photo-1531256456869-ce942a665e80?w=1000',
    },
    // Product Image Circle
    {
      id: 'productImage',
      type: 'image',
      name: 'Product Circle',
      left: 80,
      top: 80,
      width: 240,
      height: 240,
      zIndex: 2,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      borderRadius: 120,
    },
    // Promo Badge Bg
    {
      id: 'promoBadgeBg',
      type: 'shape',
      name: 'Promo Badge Bg',
      left: 740,
      top: 80,
      width: 260,
      height: 60,
      zIndex: 3,
      shapeType: 'rect',
      backgroundColor: '#E50914',
      borderRadius: 30,
    },
    // Promo Badge Text
    {
      id: 'badgeText',
      type: 'text',
      name: 'Promo Badge Text',
      left: 740,
      top: 80,
      width: 260,
      height: 60,
      zIndex: 4,
      text: 'OFFRE EXCLUSIVE',
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Headline Text
    {
      id: 'headline',
      type: 'text',
      name: 'Headline Text',
      left: 100,
      top: 760,
      width: 880,
      height: 200,
      zIndex: 5,
      text: 'CE LIVRE A CHANGE MA VIE EN 30 JOURS',
      color: '#FFFFFF',
      fontSize: 56,
      fontWeight: 'bold',
    },
  ],
  '3-b': [
    // Background Image
    {
      id: 'backgroundImage',
      type: 'image',
      name: 'Background Image',
      left: 0,
      top: 0,
      width: 1080,
      height: 1080,
      zIndex: 1,
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000',
    },
    // Card Background Shape
    {
      id: 'cardBg',
      type: 'shape',
      name: 'Card Background',
      left: 90,
      top: 290,
      width: 900,
      height: 500,
      zIndex: 2,
      shapeType: 'rect',
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
    },
    // Author Avatar
    {
      id: 'postAvatar',
      type: 'image',
      name: 'Author Avatar',
      left: 140,
      top: 340,
      width: 100,
      height: 100,
      zIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      borderRadius: 50,
    },
    // Author Name Text
    {
      id: 'postAuthor',
      type: 'text',
      name: 'Author Name',
      left: 260,
      top: 340,
      width: 680,
      height: 50,
      zIndex: 4,
      text: 'Alex Hormozi',
      color: '#000000',
      fontSize: 32,
      fontWeight: 'bold',
    },
    // Author Handle Text
    {
      id: 'postHandle',
      type: 'text',
      name: 'Author Handle',
      left: 260,
      top: 390,
      width: 680,
      height: 40,
      zIndex: 5,
      text: '@AlexHormozi',
      color: '#6B7280',
      fontSize: 24,
    },
    // Post Body Text
    {
      id: 'postContent',
      type: 'text',
      name: 'Post Content',
      left: 140,
      top: 460,
      width: 800,
      height: 220,
      zIndex: 6,
      text: "The biggest mistake people make in their 20s is thinking they have time. You don't. Work like someone is trying to take it all away from you.",
      color: '#1F2937',
      fontSize: 28,
    },
    // Stats Footer Text
    {
      id: 'postStats',
      type: 'text',
      name: 'Stats Footer',
      left: 140,
      top: 700,
      width: 800,
      height: 50,
      zIndex: 7,
      text: '12.4k Likes • 2.1k Retweets',
      color: '#6B7280',
      fontSize: 22,
      fontWeight: 'bold',
    },
  ],
  '4-a': [
    // Header Banner Shape
    {
      id: 'headerBanner',
      type: 'shape',
      name: 'Header Banner',
      left: 0,
      top: 0,
      width: 1080,
      height: 140,
      zIndex: 1,
      shapeType: 'rect',
      backgroundColor: '#000000',
    },
    // Header Title Text
    {
      id: 'headerTitle',
      type: 'text',
      name: 'Header Title',
      left: 0,
      top: 0,
      width: 1080,
      height: 140,
      zIndex: 2,
      text: 'RECRUTEMENT TELEVENTE',
      color: '#FFFFFF',
      fontSize: 48,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Main Body Image
    {
      id: 'bodyImage',
      type: 'image',
      name: 'Main Body Image',
      left: 80,
      top: 180,
      width: 920,
      height: 600,
      zIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000',
      borderRadius: 16,
    },
    // Flag Badge Image
    {
      id: 'flagBadgeUrl',
      type: 'image',
      name: 'Flag Badge',
      left: 880,
      top: 150,
      width: 80,
      height: 80,
      zIndex: 4,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      borderRadius: 40,
    },
    // Footer Background Shape
    {
      id: 'footerBg',
      type: 'shape',
      name: 'Footer Background',
      left: 0,
      top: 820,
      width: 1080,
      height: 260,
      zIndex: 5,
      shapeType: 'rect',
      backgroundColor: '#E50914',
    },
    // Salary Breakdown Text
    {
      id: 'footerSalary',
      type: 'text',
      name: 'Salary Breakdown',
      left: 0,
      top: 850,
      width: 1080,
      height: 80,
      zIndex: 6,
      text: 'SALAIRE DE BASE: 150.000 F CFA',
      color: '#FFFFFF',
      fontSize: 40,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Commissions Text
    {
      id: 'footerCommissions',
      type: 'text',
      name: 'Commissions',
      left: 0,
      top: 930,
      width: 1080,
      height: 80,
      zIndex: 7,
      text: '+ COMMISSIONS DEPLAFONNEES',
      color: '#FFE600',
      fontSize: 36,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  ],
  '5-a': [
    // Background Color Shape
    {
      id: 'backgroundColorShape',
      type: 'shape',
      name: 'Background Color',
      left: 0,
      top: 0,
      width: 1080,
      height: 1080,
      zIndex: 1,
      shapeType: 'rect',
      backgroundColor: '#55B23B',
    },
    // Main Title Text
    {
      id: 'title',
      type: 'text',
      name: 'Main Title',
      left: 80,
      top: 300,
      width: 920,
      height: 200,
      zIndex: 2,
      text: 'DOUBLER VOS VENTES EN 90 JOURS',
      color: '#FFFFFF',
      fontSize: 56,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Subtitle Text
    {
      id: 'subtitle',
      type: 'text',
      name: 'Subtitle',
      left: 80,
      top: 520,
      width: 920,
      height: 100,
      zIndex: 3,
      text: '(SANS PAYER PLUS DE PUBLICITÉ)',
      color: '#000000',
      fontSize: 40,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    // Corner Emoji Text 1
    {
      id: 'emoji',
      type: 'text',
      name: 'Corner Emoji 1',
      left: 80,
      top: 850,
      width: 150,
      height: 150,
      zIndex: 4,
      text: '👇',
      color: '#000000',
      fontSize: 96,
      textAlign: 'center',
    },
    // Corner Emoji Text 2
    {
      id: 'emoji2',
      type: 'text',
      name: 'Corner Emoji 2',
      left: 850,
      top: 850,
      width: 150,
      height: 150,
      zIndex: 5,
      text: '👇',
      color: '#000000',
      fontSize: 96,
      textAlign: 'center',
    },
  ],
  'custom': [
    {
      id: 'background',
      type: 'shape',
      name: 'Background',
      left: 0,
      top: 0,
      width: 1080,
      height: 1080,
      zIndex: 1,
      shapeType: 'rect',
      backgroundColor: '#1E1B4B',
    },
    {
      id: 'mainText',
      type: 'text',
      name: 'Headline',
      left: 90,
      top: 150,
      width: 900,
      height: 200,
      zIndex: 2,
      text: 'CONCEVEZ AVEC CANVA STYLE',
      color: '#FFFFFF',
      fontSize: 56,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    {
      id: 'subText',
      type: 'text',
      name: 'Subtitle',
      left: 90,
      top: 360,
      width: 900,
      height: 100,
      zIndex: 3,
      text: 'Glissez, déplacez et personnalisez tout visuellement',
      color: '#C7D2FE',
      fontSize: 32,
      textAlign: 'center',
    },
    {
      id: 'centerImage',
      type: 'image',
      name: 'Center Mockup',
      left: 340,
      top: 500,
      width: 400,
      height: 400,
      zIndex: 4,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      borderRadius: 20,
    }
  ],
};

// Maps AI variables change back to layers for zero-loss sync
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const syncVariablesToLayers = (newVariables: Record<string, any>, currentLayers: CanvasLayer[]): CanvasLayer[] => {
  return currentLayers.map(layer => {
    if (layer.id in newVariables) {
      const val = newVariables[layer.id];
      if (layer.type === 'text') return { ...layer, text: val };
      if (layer.type === 'image') return { ...layer, imageUrl: val };
      if (layer.type === 'shape') return { ...layer, backgroundColor: val };
    }
    
    // Map common templates keys
    if (layer.id.includes('headerLine1') || layer.id.includes('header1')) {
      if ('headerLine1' in newVariables) return { ...layer, text: newVariables.headerLine1 };
    }
    if (layer.id.includes('headerLine2') || layer.id.includes('header2')) {
      if ('headerLine2' in newVariables) return { ...layer, text: newVariables.headerLine2 };
    }
    if (layer.id.includes('priceBadgeText') || layer.id.includes('price')) {
      if ('priceBadgeText' in newVariables) return { ...layer, text: newVariables.priceBadgeText };
    }
    if (layer.id.includes('footerLine1') || layer.id.includes('footer1')) {
      if ('footerLine1' in newVariables) return { ...layer, text: newVariables.footerLine1 };
    }
    if (layer.id.includes('footerLine2') || layer.id.includes('footer2')) {
      if ('footerLine2' in newVariables) return { ...layer, text: newVariables.footerLine2 };
    }
    if (layer.id.includes('title')) {
      if ('title' in newVariables) return { ...layer, text: newVariables.title };
    }
    if (layer.id.includes('subtitle')) {
      if ('subtitle' in newVariables) return { ...layer, text: newVariables.subtitle };
    }
    if (layer.id.includes('bodyParagraph') || layer.id.includes('paragraph')) {
      if ('bodyParagraph' in newVariables) return { ...layer, text: newVariables.bodyParagraph };
    }
    if (layer.id.includes('footerText')) {
      if ('footerText' in newVariables) return { ...layer, text: newVariables.footerText };
    }
    if (layer.id.includes('headline')) {
      if ('headline' in newVariables) return { ...layer, text: newVariables.headline };
    }
    if (layer.id.includes('badgeText')) {
      if ('badgeText' in newVariables) return { ...layer, text: newVariables.badgeText };
    }
    if (layer.id.includes('postAuthor')) {
      if ('postAuthor' in newVariables) return { ...layer, text: newVariables.postAuthor };
    }
    if (layer.id.includes('postHandle')) {
      if ('postHandle' in newVariables) return { ...layer, text: newVariables.postHandle };
    }
    if (layer.id.includes('postContent')) {
      if ('postContent' in newVariables) return { ...layer, text: newVariables.postContent };
    }
    if (layer.id.includes('postStats')) {
      if ('postStats' in newVariables) return { ...layer, text: newVariables.postStats };
    }
    if (layer.id.includes('headerTitle')) {
      if ('headerTitle' in newVariables) return { ...layer, text: newVariables.headerTitle };
    }
    if (layer.id.includes('footerSalary')) {
      if ('footerSalary' in newVariables) return { ...layer, text: newVariables.footerSalary };
    }
    if (layer.id.includes('footerCommissions')) {
      if ('footerCommissions' in newVariables) return { ...layer, text: newVariables.footerCommissions };
    }
    if (layer.id.includes('backgroundColor')) {
      if ('backgroundColor' in newVariables) return { ...layer, backgroundColor: newVariables.backgroundColor };
    }
    if (layer.id.includes('subjectImage') || layer.id.includes('subject')) {
      if ('subjectImage' in newVariables) return { ...layer, imageUrl: newVariables.subjectImage };
    }
    if (layer.id.includes('productImage') || layer.id.includes('product')) {
      if ('productImage' in newVariables) return { ...layer, imageUrl: newVariables.productImage };
    }
    if (layer.id.includes('backgroundImage') || layer.id.includes('background')) {
      if ('backgroundImage' in newVariables) return { ...layer, imageUrl: newVariables.backgroundImage };
    }
    if (layer.id.includes('avatarUrl') || layer.id.includes('avatar')) {
      if ('avatarUrl' in newVariables) return { ...layer, imageUrl: newVariables.avatarUrl };
    }
    if (layer.id.includes('bodyImage')) {
      if ('bodyImage' in newVariables) return { ...layer, imageUrl: newVariables.bodyImage };
    }
    if (layer.id.includes('emoji')) {
      if ('emoji' in newVariables) return { ...layer, text: newVariables.emoji };
    }

    return layer;
  });
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isWarning?: boolean;
}

export default function HTMLCSSEditorDashboard() {
  // --- Active Editor State ---
  const [templateId, setTemplateId] = useState<TemplateId>('1-a');
  const [layers, setLayers] = useState<CanvasLayer[]>(initialTemplateLayers['1-a']);
  const [selectedLayerKey, setSelectedLayerKey] = useState<string | null>(null);

  // --- Canvas Settings ---
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [canvasBgColor, setCanvasBgColor] = useState('#FFFFFF');
  const [canvasBgImage, setCanvasBgImage] = useState('');

  // --- Reference Image Analyzer States ---
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisWarning, setAnalysisWarning] = useState<string | null>(null);

  // --- AI Live Chat States ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your AI Design Assistant. Drag, resize, and edit layers freely. You can also chat with me to update the layout or modify copywriting!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // --- Image Background Removal States ---
  const [isRemovingBg, setIsRemovingBg] = useState<Record<string, boolean>>({});

  // --- Programmatic Assembler States ---
  const [isAssembling, setIsAssembling] = useState(false);

  // --- Fabric.js Canvas ---
  const fabricCanvas = useFabricCanvas();
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [fabricReady, setFabricReady] = useState(false);

  // --- Canvas Scaling & Drag States ---
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(0.4);
  const [draggedLayerKey, setDraggedLayerKey] = useState<string | null>(null);
  const [dragAction, setDragAction] = useState<'move' | 'resize' | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOffsetStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragSizeStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update variables when changing templates manually
  const handleTemplateChange = (id: TemplateId) => {
    setTemplateId(id);
    setLayers(initialTemplateLayers[id]);
    setSelectedLayerKey(null);
    
    // Set custom backgrounds based on template properties
    if (id === '5-a') {
      setCanvasBgColor('#55B23B');
    } else {
      setCanvasBgColor('#FFFFFF');
    }
    setCanvasBgImage('');
    setCanvasWidth(1080);
    setCanvasHeight(1080);

    // Load Fabric.js template if available
    const fabricTmpl = getFabricTemplate(id);
    if (fabricTmpl && fabricReady) {
      fabricCanvas.loadFromObject(fabricTmpl.canvas_json);
    }
  };

  // Adjust canvas scaling to fit in container
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parentWidth = canvasRef.current.parentElement.clientWidth;
        const parentHeight = canvasRef.current.parentElement.clientHeight;
        const scaleW = Math.min((parentWidth - 60) / canvasWidth, 0.65);
        const scaleH = Math.min((parentHeight - 80) / canvasHeight, 0.65);
        setCanvasScale(Math.min(scaleW, scaleH));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasWidth, canvasHeight]);

  // Adjust scale on container change too
  useEffect(() => {
    if (canvasRef.current && canvasRef.current.parentElement) {
      const parentWidth = canvasRef.current.parentElement.clientWidth;
      const parentHeight = canvasRef.current.parentElement.clientHeight;
      const scaleW = Math.min((parentWidth - 60) / canvasWidth, 0.65);
      const scaleH = Math.min((parentHeight - 80) / canvasHeight, 0.65);
      setCanvasScale(Math.min(scaleW, scaleH));
    }
  }, [layers, canvasWidth, canvasHeight]);

  // --- Reference Image Analyzer ---
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReferenceFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferencePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeReference = async () => {
    if (!referencePreview) return;
    setIsAnalyzing(true);
    setAnalysisWarning(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: referencePreview,
          name: referenceFile?.name || 'ad.png',
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.warning) {
        setAnalysisWarning(data.warning);
      }

      const analyzedId = data.templateId as TemplateId;
      setTemplateId(analyzedId);
      
      // Initialize with analyzed template layers
      const baseLayers = initialTemplateLayers[analyzedId] || initialTemplateLayers['1-a'];
      const updatedLayers = syncVariablesToLayers(data.variables, baseLayers);
      
      setLayers(updatedLayers);
      setSelectedLayerKey(null);

      setChatMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: `Successfully analyzed the image! Classified as template "${analyzedId.toUpperCase()}" (${getTemplateCategoryName(analyzedId)}). Visual layers successfully mapped on canvas.` 
        }
      ]);
    } catch (err: unknown) {
      console.error(err);
      setAnalysisWarning(err instanceof Error ? err.message : 'Analysis failed. Used fallback layout.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTemplateCategoryName = (id: string) => {
    switch(id) {
      case '1-a': return 'Direct-Response Product Ad';
      case '1-b': return 'Direct-Response Product Ad (Variant)';
      case '2-a': return 'Publisher Content Card';
      case '3-a': return 'Native Social Ad (Promo)';
      case '3-b': return 'Native Social Ad (Post Card)';
      case '4-a': return 'Recruitment Flyer';
      case '5-a': return 'Typographic Flyer';
      case 'custom': return 'Blank Canvas Visual Layout';
      default: return 'Ad Layout';
    }
  };

  // --- Dynamic Layer Property Updates ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayerPropertyChange = (layerId: string, property: keyof CanvasLayer, value: any) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        return { ...layer, [property]: value };
      }
      return layer;
    }));
  };

  const handleImageFileChange = (layerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleLayerPropertyChange(layerId, 'imageUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCanvasBgImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- Background Removal for modular layers ---
  const handleRemoveBackground = async (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !layer.imageUrl) return;

    setIsRemovingBg(prev => ({ ...prev, [layerId]: true }));

    try {
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: layer.imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Background removal failed');
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setLayers(prev => prev.map(l => {
          if (l.id === layerId) {
            return { ...l, imageUrl: reader.result as string };
          }
          return l;
        }));
        
        const processedHeader = response.headers.get('X-Rembg-Processed');
        if (processedHeader === 'false') {
          setChatMessages(prev => [
            ...prev,
            { 
              role: 'assistant', 
              content: `AI background removal returned a client-safe layout fallback because Python/rembg is not fully configured. The layer is still fully editable.`,
              isWarning: true
            }
          ]);
        } else {
          setChatMessages(prev => [
            ...prev,
            { role: 'assistant', content: `Background successfully removed from layer "${layer.name}"!` }
          ]);
        }
      };
      reader.readAsDataURL(blob);

    } catch (error: unknown) {
      console.error(error);
      alert('Error isolating subject: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsRemovingBg(prev => ({ ...prev, [layerId]: false }));
    }
  };

  // --- Drag and Resize pointer trigger ---
  const handleLayerMouseDown = (layerId: string, action: 'move' | 'resize', handle: string | null, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedLayerKey(layerId);
    setDraggedLayerKey(layerId);
    setDragAction(action);
    setResizeHandle(handle);
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      dragOffsetStart.current = { x: layer.left, y: layer.top };
      dragSizeStart.current = { x: layer.width, y: layer.height };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedLayerKey || !dragAction) return;

      const dx = (e.clientX - dragStartPos.current.x) / canvasScale;
      const dy = (e.clientY - dragStartPos.current.y) / canvasScale;

      setLayers(prev => prev.map(layer => {
        if (layer.id !== draggedLayerKey) return layer;

        if (dragAction === 'move') {
          return {
            ...layer,
            left: Math.round(dragOffsetStart.current.x + dx),
            top: Math.round(dragOffsetStart.current.y + dy),
          };
        }

        if (dragAction === 'resize' && resizeHandle) {
          let newWidth = layer.width;
          let newHeight = layer.height;
          let newLeft = layer.left;
          let newTop = layer.top;

          if (resizeHandle === 'se') {
            newWidth = Math.max(20, dragSizeStart.current.x + dx);
            newHeight = Math.max(20, dragSizeStart.current.y + dy);
          }
          else if (resizeHandle === 's') {
            newHeight = Math.max(20, dragSizeStart.current.y + dy);
          }
          else if (resizeHandle === 'e') {
            newWidth = Math.max(20, dragSizeStart.current.x + dx);
          }
          else if (resizeHandle === 'w') {
            const possibleWidth = dragSizeStart.current.x - dx;
            if (possibleWidth >= 20) {
              newWidth = possibleWidth;
              newLeft = dragOffsetStart.current.x + dx;
            }
          }
          else if (resizeHandle === 'n') {
            const possibleHeight = dragSizeStart.current.y - dy;
            if (possibleHeight >= 20) {
              newHeight = possibleHeight;
              newTop = dragOffsetStart.current.y + dy;
            }
          }
          else if (resizeHandle === 'nw') {
            const possibleWidth = dragSizeStart.current.x - dx;
            const possibleHeight = dragSizeStart.current.y - dy;
            if (possibleWidth >= 20) {
              newWidth = possibleWidth;
              newLeft = dragOffsetStart.current.x + dx;
            }
            if (possibleHeight >= 20) {
              newHeight = possibleHeight;
              newTop = dragOffsetStart.current.y + dy;
            }
          }
          else if (resizeHandle === 'ne') {
            const possibleHeight = dragSizeStart.current.y - dy;
            newWidth = Math.max(20, dragSizeStart.current.x + dx);
            if (possibleHeight >= 20) {
              newHeight = possibleHeight;
              newTop = dragOffsetStart.current.y + dy;
            }
          }
          else if (resizeHandle === 'sw') {
            const possibleWidth = dragSizeStart.current.x - dx;
            newHeight = Math.max(20, dragSizeStart.current.y + dy);
            if (possibleWidth >= 20) {
              newWidth = possibleWidth;
              newLeft = dragOffsetStart.current.x + dx;
            }
          }

          return {
            ...layer,
            left: Math.round(newLeft),
            top: Math.round(newTop),
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          };
        }

        return layer;
      }));
    };

    const handleMouseUp = () => {
      setDraggedLayerKey(null);
      setDragAction(null);
      setResizeHandle(null);
    };

    if (draggedLayerKey) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedLayerKey, dragAction, resizeHandle, canvasScale]);

  // --- Add/Duplicate/Delete/Reorder Layers ---
  const handleAddTextLayer = () => {
    const newId = `text_${Date.now()}`;
    const newLayer: CanvasLayer = {
      id: newId,
      type: 'text',
      name: `Texte ${layers.length + 1}`,
      left: Math.round((canvasWidth - 600) / 2),
      top: Math.round((canvasHeight - 120) / 2),
      width: 600,
      height: 120,
      zIndex: layers.length + 1,
      text: 'Nouveau Texte Publicitaire',
      color: '#000000',
      fontSize: 36,
      textAlign: 'center',
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerKey(newId);
  };

  const handleAddImageLayer = () => {
    const newId = `image_${Date.now()}`;
    const newLayer: CanvasLayer = {
      id: newId,
      type: 'image',
      name: `Image ${layers.length + 1}`,
      left: Math.round((canvasWidth - 400) / 2),
      top: Math.round((canvasHeight - 400) / 2),
      width: 400,
      height: 400,
      zIndex: layers.length + 1,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerKey(newId);
  };

  const handleAddShapeLayer = (shape: 'rect' | 'circle') => {
    const newId = `shape_${Date.now()}`;
    const newLayer: CanvasLayer = {
      id: newId,
      type: 'shape',
      name: `${shape === 'circle' ? 'Cercle' : 'Rectangle'} ${layers.length + 1}`,
      left: Math.round((canvasWidth - 300) / 2),
      top: Math.round((canvasHeight - 300) / 2),
      width: 300,
      height: 300,
      zIndex: layers.length + 1,
      shapeType: shape,
      backgroundColor: '#E50914',
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerKey(newId);
  };

  const handleDeleteLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerKey === id) {
      setSelectedLayerKey(null);
    }
  };

  const handleDuplicateLayer = (layer: CanvasLayer) => {
    const newId = `${layer.type}_${Date.now()}`;
    const duplicated: CanvasLayer = {
      ...layer,
      id: newId,
      name: `${layer.name} Copie`,
      left: Math.min(canvasWidth - 50, layer.left + 50),
      top: Math.min(canvasHeight - 50, layer.top + 50),
      zIndex: layers.length + 1,
    };
    setLayers(prev => [...prev, duplicated]);
    setSelectedLayerKey(newId);
  };

  const handleMoveLayerUp = (id: string) => {
    setLayers(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(l => l.id === id);
      if (idx === -1 || idx === sorted.length - 1) return prev;
      
      const current = sorted[idx];
      const next = sorted[idx + 1];
      
      const tempZ = current.zIndex;
      current.zIndex = next.zIndex;
      next.zIndex = tempZ;
      
      return [...sorted].sort((a, b) => a.zIndex - b.zIndex);
    });
  };

  const handleMoveLayerDown = (id: string) => {
    setLayers(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(l => l.id === id);
      if (idx === -1 || idx === 0) return prev;
      
      const current = sorted[idx];
      const prevL = sorted[idx - 1];
      
      const tempZ = current.zIndex;
      current.zIndex = prevL.zIndex;
      prevL.zIndex = tempZ;
      
      return [...sorted].sort((a, b) => a.zIndex - b.zIndex);
    });
  };

  // --- AI Live Chat ---
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatSending(true);

    try {
      // Send Fabric.js canvas JSON to the AI
      const canvasJSON = fabricCanvas.getCanvasJSON();

      const response = await fetch('/api/chat-fabric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          canvas_json: canvasJSON,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Load the updated canvas JSON back into Fabric.js
      if (data.canvas_json) {
        fabricCanvas.loadFromObject(data.canvas_json);
      }
      
      let aiResponseText = `I have redesigned your ad layout properties based on your instructions: "${userMsg}". All changes applied to visual layers.`;
      if (data.warning) {
        aiResponseText += ` Note: ${data.warning}`;
      }
      
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: aiResponseText,
          isWarning: !!data.warning
        }
      ]);

    } catch (err: unknown) {
      console.error(err);
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Sorry, I had trouble parsing the AI layout changes. ${err instanceof Error ? err.message : ''}`,
          isWarning: true
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // --- Export PNG via Fabric.js ---
  const handleDownloadPNG = async () => {
    setIsAssembling(true);
    try {
      // Export directly from Fabric.js canvas (2x resolution)
      fabricCanvas.exportPNG(`ad-${templateId}-${Date.now()}.png`);
    } catch (error: unknown) {
      console.error(error);
      alert('Error exporting PNG: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsAssembling(false);
    }
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerKey);
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex); // render list descending (front first) in sidebar

  // Pre-configured dimensions sizes
  const handleDimensionPreset = (preset: '1:1' | '9:16' | '16:9') => {
    if (preset === '1:1') {
      setCanvasWidth(1080);
      setCanvasHeight(1080);
    } else if (preset === '9:16') {
      setCanvasWidth(1080);
      setCanvasHeight(1920);
    } else if (preset === '16:9') {
      setCanvasWidth(1920);
      setCanvasHeight(1080);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* --- Top Header Glass --- */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-white to-pink-200 bg-clip-text text-transparent">
            Antigravity Canvas Editor
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 font-mono">
            Fabric.js Editor v2.0
          </span>
        </div>

        {/* Top middle size presets */}
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800 text-xs">
          <span className="text-zinc-500 font-semibold px-2">Size:</span>
          <button 
            onClick={() => handleDimensionPreset('1:1')}
            className={`px-3 py-1 rounded-md transition-colors ${canvasWidth === 1080 && canvasHeight === 1080 ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            1:1 Square
          </button>
          <button 
            onClick={() => handleDimensionPreset('9:16')}
            className={`px-3 py-1 rounded-md transition-colors ${canvasWidth === 1080 && canvasHeight === 1920 ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            9:16 Reel
          </button>
          <button 
            onClick={() => handleDimensionPreset('16:9')}
            className={`px-3 py-1 rounded-md transition-colors ${canvasWidth === 1920 && canvasHeight === 1080 ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            16:9 Banner
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadPNG}
            disabled={isAssembling}
            className="flex items-center gap-2 px-4.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-50 disabled:scale-100 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white cursor-pointer"
          >
            {isAssembling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export PNG
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- Main Workspace Layout --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- LEFT SIDEBAR: Presets & Layer Stack --- */}
        <aside className="w-80 flex flex-col border-r border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-hidden">
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-6">
            
            {/* Reference Image Section */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                Reference Ad Analyzer
              </h3>
              
              <label className="flex flex-col items-center justify-center border border-dashed border-zinc-700 hover:border-indigo-500/50 rounded-lg p-3 cursor-pointer transition-all hover:bg-zinc-800/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceUpload}
                  className="hidden"
                />
                {referencePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={referencePreview}
                    alt="Reference Preview"
                    className="max-h-24 object-contain rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center text-xs text-zinc-500">
                    <ImageIcon className="w-5 h-5 text-zinc-600" />
                    <span>Upload target reference</span>
                  </div>
                )}
              </label>

              {referencePreview && (
                <button
                  onClick={handleAnalyzeReference}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      Analyze & Load Layers
                    </>
                  )}
                </button>
              )}

              {analysisWarning && (
                <div className="flex items-start gap-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{analysisWarning}</span>
                </div>
              )}
            </div>

            {/* Template Presets */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Visual Templates
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  8 Presets
                </span>
              </div>
              <TemplateSelector
                selectedTemplateId={templateId}
                onSelectTemplate={handleTemplateChange}
              />
            </div>

            {/* Active Layers Stack */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  Visual Layer Stack
                </h3>
              </div>
              <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {sortedLayers.map((layer) => {
                  const isSelected = selectedLayerKey === layer.id;
                  return (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerKey(layer.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 font-semibold'
                          : 'bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/60 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {layer.type === 'text' && <Type className="w-3.5 h-3.5 shrink-0 text-indigo-400" />}
                        {layer.type === 'image' && <ImageIcon className="w-3.5 h-3.5 shrink-0 text-pink-400" />}
                        {layer.type === 'shape' && (
                          layer.shapeType === 'circle' 
                            ? <Circle className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                            : <Square className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                        )}
                        <span className="truncate">{layer.name}</span>
                      </div>

                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          title="Raise layer"
                          onClick={() => handleMoveLayerUp(layer.id)}
                          className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 rounded transition-colors"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          title="Lower layer"
                          onClick={() => handleMoveLayerDown(layer.id)}
                          className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 rounded transition-colors"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          title="Duplicate"
                          onClick={() => handleDuplicateLayer(layer)}
                          className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDeleteLayer(layer.id)}
                          className="p-1 hover:bg-zinc-800 text-red-500/70 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Left Sidebar Footer quick add buttons */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Add Elements:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fabricCanvas.addText('heading')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors text-[10px] font-bold cursor-pointer"
              >
                <Type className="w-4 h-4 text-indigo-400" />
                <span>Text</span>
              </button>
              <button
                onClick={() => fabricCanvas.addImage('https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors text-[10px] font-bold cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>Image</span>
              </button>
              <button
                onClick={() => fabricCanvas.addShape('rect')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors text-[10px] font-bold cursor-pointer"
              >
                <Square className="w-4 h-4 text-teal-400" />
                <span>Shape</span>
              </button>
            </div>
          </div>

        </aside>

        {/* --- CENTER CANVAS: Real Interactive Workbench --- */}
        <main 
          onClick={() => setSelectedLayerKey(null)}
          className="flex-1 flex flex-col bg-zinc-900/45 overflow-hidden relative justify-center items-center p-8 select-none"
        >
          {/* Canvas bounds preset aspect-ratio container */}
          <div 
            onClick={(e) => { e.stopPropagation(); setSelectedLayerKey(null); }}
            className="relative border border-zinc-800 bg-black/60 shadow-2xl rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300"
            style={{ 
              width: `${canvasWidth * canvasScale}px`, 
              height: `${canvasHeight * canvasScale}px` 
            }}
          >
            {/* Fabric.js Canvas — replaces HTML/CSS custom template */}
            <div className="relative">
              <FabricCanvas
                width={canvasWidth}
                height={canvasHeight}
                zoom={canvasScale}
                canvasRef={fabricCanvasRef}
                onCanvasReady={(canvas) => {
                  fabricCanvasRef.current = canvas;
                  setFabricReady(true);
                  // Load initial template
                  const tmpl = getFabricTemplate(templateId);
                  if (tmpl) {
                    canvas.loadFromJSON(tmpl.canvas_json).then(() => canvas.requestRenderAll());
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-950/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg backdrop-blur">
              <button
                onClick={() => fabricCanvas.undo()}
                disabled={!fabricCanvas.canUndo}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                title="Undo (Cmd+Z)"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fabricCanvas.redo()}
                disabled={!fabricCanvas.canRedo}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                title="Redo (Cmd+Shift+Z)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-zinc-800 mx-1" />
              <button
                onClick={() => fabricCanvas.zoomOut()}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer text-xs font-bold"
                title="Zoom Out"
              >-
              </button>
              <span className="text-[10px] text-zinc-500 font-mono w-10 text-center">{Math.round(canvasScale * 100)}%</span>
              <button
                onClick={() => fabricCanvas.zoomIn()}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer text-xs font-bold"
                title="Zoom In"
              >+
              </button>
            </div>
            <span className="text-[10px] text-zinc-500 bg-zinc-950/60 border border-zinc-800/80 px-4 py-2 rounded-full backdrop-blur flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fabric.js Canvas — Click to select, drag to move, pull handles to resize.</span>
            </span>
          </div>
        </main>

        {/* --- RIGHT SIDEBAR: Fabric.js Object / Canvas Settings Panel --- */}
        <RightSidebar
          selectedObject={fabricCanvas.selectedObject}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onWidthChange={(w) => {
            setCanvasWidth(w);
            fabricCanvas.setCanvasSize(w, canvasHeight);
          }}
          onHeightChange={(h) => {
            setCanvasHeight(h);
            fabricCanvas.setCanvasSize(canvasWidth, h);
          }}
          onBgColorChange={(c) => setCanvasBgColor(c)}
          canvasBgColor={canvasBgColor}
          updateSelected={fabricCanvas.updateSelectedObject}
          deleteSelected={fabricCanvas.deleteSelected}
          addText={fabricCanvas.addText}
          addShape={fabricCanvas.addShape}
          addImage={fabricCanvas.addImage}
          setBackground={fabricCanvas.setBackground}
        />

        {/* --- RIGHTMOST PANEL: Conversational AI Chat Assistant --- */}
        <aside className="w-80 flex flex-col border-l border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
          
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                AI Live Chat
              </h2>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              Gemini 2.5
            </span>
          </div>

          {/* Chat transcript list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
            {chatMessages.map((msg, index) => {
              const isAI = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex flex-col max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs ${
                    isAI
                      ? msg.isWarning 
                        ? 'self-start bg-amber-500/10 border border-amber-500/20 text-amber-300'
                        : 'self-start bg-zinc-900 border border-zinc-800 text-zinc-300'
                      : 'self-end bg-indigo-600 text-white'
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider font-semibold opacity-60 mb-1">
                    {isAI ? 'AI Designer' : 'You'}
                  </span>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              );
            })}
            {isChatSending && (
              <div className="self-start max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>AI is designing...</span>
              </div>
            )}
          </div>

          {/* Send Input Form */}
          <form onSubmit={handleChatSend} className="p-4 border-t border-zinc-800 bg-zinc-950/60">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Change price to $20..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatSending}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isChatSending || !chatInput.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </aside>

      </div>
    </div>
  );
}
