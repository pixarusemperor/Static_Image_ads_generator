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
  AlertCircle
} from 'lucide-react';

// Default templates data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultTemplatesData: Record<TemplateId, Record<string, any>> = {
  '1-a': {
    headerLine1: "TU VERSES LE LIQUIDE VITE",
    headerLine2: "2 MINUTES? TU ES FAIBLE?",
    subjectImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500",
    productImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    priceBadgeText: "PRIX 5.000F(10$)",
    footerLine1: "LIS LA METHODE ET APPLIQUES",
    footerLine2: "PAS BESOIN DE FAIRE LE SPORT",
  },
  '1-b': {
    topBackgroundImage: "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800",
    productImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    priceBadgeText: "PRIX 5.000F(10$)",
    title: "2 MINUTES AU LIT",
    subtitle: "C'EST RIDICULE",
    bodyParagraph: "Découvrez la méthode naturelle pour durer plus longtemps au lit sans aucun effet secondaire ni produit chimique.",
    footerText: "CA MARCHE SANS PRODUIT",
  },
  '2-a': {
    backgroundImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000",
    logoUrl: "",
    logoPosition: "left",
    hasAvatar: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    headline: "CETTE HABITUDE [TUE] APPRIVOISEE PAR LA SCIENCE",
    highlightColor: "#E50914",
  },
  '3-a': {
    backgroundImage: "https://images.unsplash.com/photo-1531256456869-ce942a665e80?w=1000",
    productImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    headline: "CE LIVRE A CHANGE MA VIE EN 30 JOURS",
    badgeText: "OFFRE EXCLUSIVE",
  },
  '3-b': {
    backgroundImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000",
    postAuthor: "Alex Hormozi",
    postHandle: "@AlexHormozi",
    postAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
    postContent: "The biggest mistake people make in their 20s is thinking they have time. You don't. Work like someone is trying to take it all away from you.",
    postStats: "12.4k Likes • 2.1k Retweets",
  },
  '4-a': {
    headerTitle: "RECRUTEMENT TELEVENTE",
    bodyImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000",
    flagBadgeUrl: "",
    footerSalary: "SALAIRE DE BASE: 150.000 F CFA",
    footerCommissions: "+ COMMISSIONS DEPLAFONNEES",
  },
  '5-a': {
    backgroundColor: "#55B23B",
    title: "DOUBLER VOS VENTES EN 90 JOURS",
    subtitle: "(SANS PAYER PLUS DE PUBLICITÉ)",
  }
};

// Logical layer definitions for each template (used in the Left Panel Layer Tree)
const templateLayers: Record<TemplateId, { key: string; name: string; type: 'text' | 'image' | 'color' }[]> = {
  '1-a': [
    { key: 'headerLine1', name: 'Header Banner 1', type: 'text' },
    { key: 'headerLine2', name: 'Header Banner 2', type: 'text' },
    { key: 'subjectImage', name: 'Subject Image', type: 'image' },
    { key: 'productImage', name: 'Product Mockup', type: 'image' },
    { key: 'priceBadgeText', name: 'Price Badge', type: 'text' },
    { key: 'footerLine1', name: 'Footer Banner 1', type: 'text' },
    { key: 'footerLine2', name: 'Footer Line 2', type: 'text' },
  ],
  '1-b': [
    { key: 'topBackgroundImage', name: 'Top Background', type: 'image' },
    { key: 'productImage', name: 'Product Image', type: 'image' },
    { key: 'title', name: 'Main Title', type: 'text' },
    { key: 'subtitle', name: 'Subtitle', type: 'text' },
    { key: 'bodyParagraph', name: 'Body Text', type: 'text' },
    { key: 'priceBadgeText', name: 'Price Badge', type: 'text' },
    { key: 'footerText', name: 'Footer Text', type: 'text' },
  ],
  '2-a': [
    { key: 'backgroundImage', name: 'Background Image', type: 'image' },
    { key: 'logoUrl', name: 'Brand Logo', type: 'image' },
    { key: 'avatarUrl', name: 'Avatar Inset', type: 'image' },
    { key: 'headline', name: 'Headline Text', type: 'text' },
    { key: 'highlightColor', name: 'Highlight Color', type: 'color' },
  ],
  '3-a': [
    { key: 'backgroundImage', name: 'Background Image', type: 'image' },
    { key: 'productImage', name: 'Product Image', type: 'image' },
    { key: 'headline', name: 'Headline Text', type: 'text' },
    { key: 'badgeText', name: 'Promo Badge', type: 'text' },
  ],
  '3-b': [
    { key: 'backgroundImage', name: 'Background Image', type: 'image' },
    { key: 'postAuthor', name: 'Author Name', type: 'text' },
    { key: 'postHandle', name: 'Author Handle', type: 'text' },
    { key: 'postAvatar', name: 'Author Avatar', type: 'image' },
    { key: 'postContent', name: 'Post Body', type: 'text' },
    { key: 'postStats', name: 'Stats Footer', type: 'text' },
  ],
  '4-a': [
    { key: 'headerTitle', name: 'Header Title', type: 'text' },
    { key: 'bodyImage', name: 'Main Body Image', type: 'image' },
    { key: 'flagBadgeUrl', name: 'Flag Badge', type: 'image' },
    { key: 'footerSalary', name: 'Salary Breakdown', type: 'text' },
    { key: 'footerCommissions', name: 'Commissions', type: 'text' },
  ],
  '5-a': [
    { key: 'backgroundColor', name: 'Background Color', type: 'color' },
    { key: 'title', name: 'Main Title', type: 'text' },
    { key: 'subtitle', name: 'Subtitle', type: 'text' },
  ],
};

// Draggable boundaries configuration (in 1080x1080 coordinate system)
interface DraggableLayer {
  key: string;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

const draggableConfigs: Record<TemplateId, DraggableLayer[]> = {
  '1-a': [
    { key: 'subjectImage', name: 'Subject Image', left: 80, top: 240, width: 520, height: 620 },
    { key: 'productImage', name: 'Product Mockup', left: 660, top: 300, width: 330, height: 460 },
    { key: 'priceBadgeText', name: 'Price Badge', left: 650, top: 780, width: 350, height: 70 },
  ],
  '1-b': [
    { key: 'productImage', name: 'Product Mockup', left: 780, top: 380, width: 230, height: 330 },
    { key: 'priceBadgeText', name: 'Price Badge', left: 740, top: 740, width: 310, height: 64 },
  ],
  '2-a': [
    { key: 'avatarUrl', name: 'Avatar Circle', left: 840, top: 540, width: 160, height: 160 },
  ],
  '3-a': [
    { key: 'productImage', name: 'Product Circle', left: 80, top: 80, width: 240, height: 240 },
  ],
  '3-b': [],
  '4-a': [
    { key: 'bodyImage', name: 'Body Image', left: 80, top: 180, width: 920, height: 600 },
  ],
  '5-a': [],
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isWarning?: boolean;
}

export default function HTMLCSSEditorDashboard() {
  // --- Active Editor State ---
  const [templateId, setTemplateId] = useState<TemplateId>('1-a');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [variables, setVariables] = useState<Record<string, any>>(defaultTemplatesData['1-a']);
  const [selectedLayerKey, setSelectedLayerKey] = useState<string | null>(null);

  // --- Dynamic Layout Offsets for client drag-and-drop preview ---
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({
    subjectImage: { x: 0, y: 0 },
    productImage: { x: 0, y: 0 },
    priceBadgeText: { x: 0, y: 0 },
    avatarUrl: { x: 0, y: 0 },
    bodyImage: { x: 0, y: 0 },
  });

  // --- Reference Image Analyzer States ---
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisWarning, setAnalysisWarning] = useState<string | null>(null);

  // --- AI Live Chat States ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your AI Design Assistant. You can ask me to update the layout, change copywriting, modify colors, or adjust specific layers.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // --- Image Background Removal States ---
  const [isRemovingBg, setIsRemovingBg] = useState<Record<string, boolean>>({});

  // --- Programmatic Assembler States ---
  const [isAssembling, setIsAssembling] = useState(false);

  // --- HTML Elements & Drag states ---
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(0.4);
  const [draggedLayerKey, setDraggedLayerKey] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOffsetStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update variables when changing templates manually
  const handleTemplateChange = (id: TemplateId) => {
    setTemplateId(id);
    setVariables(defaultTemplatesData[id]);
    setSelectedLayerKey(null);
    setOffsets({
      subjectImage: { x: 0, y: 0 },
      productImage: { x: 0, y: 0 },
      priceBadgeText: { x: 0, y: 0 },
      avatarUrl: { x: 0, y: 0 },
      bodyImage: { x: 0, y: 0 },
    });
  };

  // Adjust canvas scaling to fit in container
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parentWidth = canvasRef.current.parentElement.clientWidth;
        const scale = Math.min((parentWidth - 40) / 1080, 0.65);
        setCanvasScale(scale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync manual DOM transforms to the inner template preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Helper to apply translation
    const applyTransform = (selector: string, offsetKey: string) => {
      const el = canvas.querySelector(selector);
      if (el && el.parentElement) {
        const offset = offsets[offsetKey] || { x: 0, y: 0 };
        el.parentElement.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
        el.parentElement.style.transition = 'none';
      }
    };

    if (templateId === '1-a') {
      applyTransform('img[alt="Subject"]', 'subjectImage');
      applyTransform('img[alt="Product"]', 'productImage');
      
      // Target price badge by text content or border radius
      const divs = canvas.querySelectorAll<HTMLDivElement>('div');
      divs.forEach((div) => {
        if (div.textContent?.includes(variables.priceBadgeText || '') && div.style.borderRadius === '15px') {
          const offset = offsets['priceBadgeText'] || { x: 0, y: 0 };
          div.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
        }
      });
    } else if (templateId === '1-b') {
      applyTransform('img[alt="Product"]', 'productImage');
      
      const divs = canvas.querySelectorAll<HTMLDivElement>('div');
      divs.forEach((div) => {
        if (div.textContent?.includes(variables.priceBadgeText || '') && div.style.borderRadius === '32px') {
          const offset = offsets['priceBadgeText'] || { x: 0, y: 0 };
          div.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
        }
      });
    } else if (templateId === '2-a') {
      applyTransform('img[alt="Avatar"]', 'avatarUrl');
    } else if (templateId === '3-a') {
      applyTransform('img[alt="Product"]', 'productImage');
    } else if (templateId === '4-a') {
      applyTransform('img[alt="Recruitment Call Center"]', 'bodyImage');
    }
  }, [templateId, variables, offsets]);

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

      setTemplateId(data.templateId);
      setVariables(data.variables);
      setSelectedLayerKey(null);
      setOffsets({
        subjectImage: { x: 0, y: 0 },
        productImage: { x: 0, y: 0 },
        priceBadgeText: { x: 0, y: 0 },
        avatarUrl: { x: 0, y: 0 },
        bodyImage: { x: 0, y: 0 },
      });

      setChatMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: `Successfully analyzed the image! Classified as template "${data.templateId.toUpperCase()}" (${getTemplateCategoryName(data.templateId)}). Variables loaded.` 
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
      default: return 'Ad Layout';
    }
  };

  // --- Dynamic Form Controls ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleVariableChange = (key: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleVariableChange(key, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- Background Removal ---
  const handleRemoveBackground = async (key: string) => {
    const imageVal = variables[key];
    if (!imageVal) return;

    setIsRemovingBg(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageVal }),
      });

      if (!response.ok) {
        throw new Error('Background removal failed');
      }

      // Read response as blob and convert to base64 data URL
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        handleVariableChange(key, reader.result as string);
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
            { role: 'assistant', content: `Background successfully removed from layer "${key}"! Isolate subject generated.` }
          ]);
        }
      };
      reader.readAsDataURL(blob);

    } catch (error: unknown) {
      console.error(error);
      alert('Error isolating subject: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsRemovingBg(prev => ({ ...prev, [key]: false }));
    }
  };

  // --- Drag and Drop Logic for Visual Handles ---
  const handleMouseDown = (layerKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedLayerKey(layerKey);
    setDraggedLayerKey(layerKey);
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragOffsetStart.current = offsets[layerKey] || { x: 0, y: 0 };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedLayerKey) return;
      
      const dx = (e.clientX - dragStartPos.current.x) / canvasScale;
      const dy = (e.clientY - dragStartPos.current.y) / canvasScale;

      setOffsets(prev => ({
        ...prev,
        [draggedLayerKey]: {
          x: Math.round(dragOffsetStart.current.x + dx),
          y: Math.round(dragOffsetStart.current.y + dy),
        }
      }));
    };

    const handleMouseUp = () => {
      if (draggedLayerKey) {
        setDraggedLayerKey(null);
      }
    };

    if (draggedLayerKey) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedLayerKey, canvasScale]);

  // --- AI Live Chat ---
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          templateId,
          variables,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setVariables(data.variables);
      
      let aiResponseText = `I have updated the layout variables based on your request: "${userMsg}".`;
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
          content: `Sorry, I ran into an error updating the design. ${err instanceof Error ? err.message : ''}`,
          isWarning: true
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // --- Programmatic Assembler PNG Download ---
  const handleDownloadPNG = async () => {
    setIsAssembling(true);
    try {
      // In order to let the server render with the user's offsets,
      // we can pass them in the payload. Note: The assembly route
      // currently generates standard variables, but we pass them just in case.
      const response = await fetch('/api/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error('Assembly server error');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ad-variant-${templateId}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error(error);
      alert('Error downloading assembled PNG: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsAssembling(false);
    }
  };

  // Render the current JSX Template component
  const ActiveTemplateComponent = getTemplateComponent(templateId);

  return (
    <div className="flex flex-col flex-1 h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* --- Top Glassy Navigation --- */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-white to-pink-200 bg-clip-text text-transparent">
            Antigravity Ad Studio
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 font-mono">
            v1.2.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadPNG}
            disabled={isAssembling}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-50 disabled:scale-100 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white cursor-pointer"
          >
            {isAssembling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Assembling PNG...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PNG
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- Main Dashboard Area --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- LEFT PANEL: Upload reference & Layers Tree --- */}
        <aside className="w-80 flex flex-col border-r border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-y-auto custom-scrollbar p-5 gap-6">
          
          {/* Reference Image Section */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" />
              Reference Ad Analyzer
            </h3>
            
            <label className="flex flex-col items-center justify-center border border-dashed border-zinc-700 hover:border-indigo-500/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-zinc-800/30">
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
                <div className="flex flex-col items-center gap-1.5 text-center text-xs text-zinc-500">
                  <ImageIcon className="w-6 h-6 text-zinc-600" />
                  <span>Upload target reference</span>
                </div>
              )}
            </label>

            {referencePreview && (
              <button
                onClick={handleAnalyzeReference}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-200 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Layout...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    Analyze Reference
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

          {/* Template Category Select */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              Layout Category
            </h3>
            <select
              value={templateId}
              onChange={(e) => handleTemplateChange(e.target.value as TemplateId)}
              className="w-full py-2 px-3 rounded-lg text-sm bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-indigo-500 text-zinc-200"
            >
              <option value="1-a">1-A: Niche Product (Default)</option>
              <option value="1-b">1-B: Niche Product (Split)</option>
              <option value="2-a">2-A: Publisher Content Card</option>
              <option value="3-a">3-A: Native Social Ad (Promo)</option>
              <option value="3-b">3-B: Native Social Ad (Post Card)</option>
              <option value="4-a">4-A: Recruitment Flyer</option>
              <option value="5-a">5-A: Typographic Flyer</option>
            </select>
          </div>

          {/* Layers Tree */}
          <div className="flex flex-col gap-3 flex-1">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              Layer Tree Tree
            </h3>
            <div className="flex flex-col gap-1">
              {templateLayers[templateId].map((layer) => {
                const isSelected = selectedLayerKey === layer.key;
                return (
                  <button
                    key={layer.key}
                    onClick={() => setSelectedLayerKey(layer.key)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 font-semibold'
                        : 'bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/60 text-zinc-400'
                    }`}
                  >
                    <span>{layer.name}</span>
                    <span className="text-[10px] uppercase opacity-60 px-1.5 py-0.5 rounded bg-zinc-800">
                      {layer.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* --- CENTER CANVAS: Interactive preview --- */}
        <main className="flex-1 flex flex-col bg-zinc-900/40 overflow-hidden relative justify-center items-center p-8">
          
          {/* Canvas Wrapper */}
          <div className="relative border border-zinc-800 bg-black/60 shadow-2xl rounded-2xl overflow-hidden flex items-center justify-center"
               style={{ 
                 width: `${1080 * canvasScale}px`, 
                 height: `${1080 * canvasScale}px` 
               }}>
            
            {/* The scaled Next.js template rendering */}
            <div 
              ref={canvasRef}
              className="absolute top-0 left-0 origin-top-left"
              style={{
                width: '1080px',
                height: '1080px',
                transform: `scale(${canvasScale})`,
              }}
            >
              {ActiveTemplateComponent ? (
                <ActiveTemplateComponent {...variables} />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                  Select a template to render
                </div>
              )}
            </div>

            {/* Interactive Drag Handle Overlays */}
            {draggableConfigs[templateId].map((dragLayer) => {
              const offset = offsets[dragLayer.key] || { x: 0, y: 0 };
              const currentLeft = (dragLayer.left + offset.x) * canvasScale;
              const currentTop = (dragLayer.top + offset.y) * canvasScale;
              const isSelected = selectedLayerKey === dragLayer.key;

              return (
                <div
                  key={dragLayer.key}
                  onMouseDown={(e) => handleMouseDown(dragLayer.key, e)}
                  style={{
                    position: 'absolute',
                    left: `${currentLeft}px`,
                    top: `${currentTop}px`,
                    width: `${dragLayer.width * canvasScale}px`,
                    height: `${dragLayer.height * canvasScale}px`,
                  }}
                  className={`group border cursor-move transition-shadow z-20 flex items-start p-1.5 rounded-lg select-none ${
                    isSelected 
                      ? 'border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/20' 
                      : 'border-dashed border-zinc-600/60 hover:border-indigo-400/80 hover:bg-indigo-400/5'
                  }`}
                >
                  <div className={`px-1.5 py-0.5 rounded text-[8px] font-semibold text-white ${
                    isSelected ? 'bg-indigo-500' : 'bg-zinc-800 group-hover:bg-indigo-500/80'
                  }`}>
                    {dragLayer.name}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-[10px] text-zinc-500 bg-zinc-950/60 border border-zinc-800/80 px-3 py-1.5 rounded-full backdrop-blur">
            💡 Click and drag dotted-framed layers on canvas to adjust their positions visually.
          </div>
        </main>

        {/* --- RIGHT PANEL: Manual Property Controls --- */}
        <aside className="w-80 flex flex-col border-l border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-y-auto custom-scrollbar p-5 gap-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Settings className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Layer Properties
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {templateLayers[templateId].map((layer) => {
              const isSelected = selectedLayerKey === layer.key;
              const value = variables[layer.key] || '';

              return (
                <div 
                  key={layer.key} 
                  className={`flex flex-col gap-1.5 p-3 rounded-xl border transition-all ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : 'border-zinc-800/60 bg-zinc-900/40'
                  }`}
                >
                  <label className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
                    <span>{layer.name}</span>
                    {isSelected && <span className="text-[10px] text-indigo-400 font-mono">selected</span>}
                  </label>

                  {/* Render color input */}
                  {layer.type === 'color' && (
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={value.startsWith('#') ? value : '#E50914'}
                        onChange={(e) => handleVariableChange(layer.key, e.target.value)}
                        className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleVariableChange(layer.key, e.target.value)}
                        className="flex-1 py-1 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Render text input */}
                  {layer.type === 'text' && (
                    layer.key === 'bodyParagraph' || layer.key === 'postContent' ? (
                      <textarea
                        value={value}
                        rows={3}
                        onChange={(e) => handleVariableChange(layer.key, e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleVariableChange(layer.key, e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    )
                  )}

                  {/* Render image input */}
                  {layer.type === 'image' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[10px] font-semibold text-zinc-200 cursor-pointer transition-colors">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Replace Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileChange(layer.key, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Display small thumbnail */}
                      {value && (
                        <div className="relative rounded border border-zinc-800 overflow-hidden bg-black/40 p-1.5 flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={value}
                            alt="Thumb"
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1 flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                              {value.startsWith('data:') ? 'base64 asset' : 'remote URL'}
                            </span>
                            {/* Subject Extraction trigger */}
                            {(layer.key === 'subjectImage' || layer.key === 'productImage' || layer.key === 'bodyImage') && (
                              <button
                                onClick={() => handleRemoveBackground(layer.key)}
                                disabled={isRemovingBg[layer.key]}
                                className="w-fit flex items-center gap-1 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                              >
                                {isRemovingBg[layer.key] ? (
                                  <>
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                    Isolating...
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="w-2.5 h-2.5" />
                                    Remove BG
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* --- CHAT SIDEBAR: Converse with AI for live modifications --- */}
        <aside className="w-80 flex flex-col border-l border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                AI Live Chat
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              Gemini 2.5
            </span>
          </div>

          {/* Messages list */}
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
                <span>AI is redesigning...</span>
              </div>
            )}
          </div>

          {/* Input form */}
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
