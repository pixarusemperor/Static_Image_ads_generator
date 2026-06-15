# Image Analysis Report: Static Image Ads Visual Templates & Layout Engine Specifications

Having explored the `/home/stevenjossu/Static_Image_ads_generator/TYPE OF ADS SAMPLE/` directory, the 40 images have been grouped into 5 logical categories. Below is a comprehensive visual analysis and technical specification detailing their visual structures, layer compositions, dynamic variables, and programmatic recreation rules.

---

## 1. Categorization Overview (40 Files)

Based on filenames, brand themes, and visual design patterns, the 40 files have been grouped as follows:

| Category | Description | Associated Files (Count: 40) |
| :--- | :--- | :--- |
| **Category 1: Direct-Response Niche Product Ads** | Urgency-driven marketing flyers in French, advertising health and supplement products (primarily the "Resistor" book by Patrick Simo or "The Dur Roi Lion" tea/coffee). Saturated red/yellow banners, bold text, product overlays, and price badges. | `MRESISTORFLYER1.png`, `MRESISTORFLYER2.png`, `MRESISTORFLYER4.png`, `MRESISTORFLYER5.png`, `PATSIMMSCFLYER1.png`, `PATSIMMSCFLYER5.png`, `PATSIMMSCFLYER7.png`, `PATSIMMSCFLYER8.png`, `30.png`, `32.png`, `33.png`, `The dur roi lion (2).png` to `The dur roi lion (8).png` (Total: 18 files) |
| **Category 2: Publisher Content Cards (Clickbait)** | Square or 4:5 vertical content cards modeled after publishers like **LAD Bible** and **Cybernews**. Features full-frame background photos, top-corner branding logo, dark bottom gradient, bold centered all-caps typography, and text highlights. | `653705123_..._n.jpg`, `683603373_..._n.jpg`, `708926461_..._n.jpg`, `images.jpeg`, `images (1).jpeg`, `images (2).jpeg`, `Screenshot_20260615-144444.jpg` to `Screenshot_20260615-144851.jpg` (Total: 16 files) |
| **Category 3: Native Social & Clickbait Ads** | Gossip or social proof style ads promoting products (like Sabri Suby's books/agency). Employs floating mockups of social media posts, criminal-style eye-censoring black bars, "EXCLUSIVE" badges, and circular insets with pointing red arrows. | `454764568_..._n.jpg`, `557628331_..._n.jpg`, `558522476_..._n.jpg`, `672675070_..._n.jpg`, `690932544_..._n.jpg` (Total: 5 files) |
| **Category 4: Recruitment & Local Corporate Flyers** | Standard clean recruitment marketing layout with clear headers, corporate workspace background image, country flag overlay badge, and high-visibility salary breakdown. | `Copie de AFFICHE RECRUTEMENT CALL CENTER .png` (Total: 1 file) |
| **Category 5: Solid Color Text-Based Graphic Flyers** | Minimalist typographic flyers featuring a solid background color, balanced hierarchy, centered text block, and symmetrical directional call-to-action indicators. | `Screenshot_20260615-142723.jpg` (Total: 1 file) |

---

## 2. Category Deep Dive & Templates

### Category 1: Direct-Response Niche Product Ads

This category is built around high-urgency health and performance products. It contains four layout templates:

#### Template 1-A: Solid Header/Footer Banners & Centered Rounded Crop
*   **Visual Structure**: 
    *   *Background*: Solid white canvas.
    *   *Header*: 1 or 2 vertical stacked banners spanning 100% width. Top banner is black with white text; second banner is bright red with white text.
    *   *Center*: A rectangular subject image (smiling woman, muscular man) centered horizontally with rounded corners (`border-radius: ~5%`).
    *   *Product Overlay*: A book cover mockup overlapping the subject image on the right.
    *   *Price Badge*: A black rounded capsule pill with yellow text positioned near the product mockup.
    *   *Footer*: A red horizontal banner (white text) and a white section below with red/black text and an upward pointing yellow arrow.
    *   *Color Palette*: Solid Red (`#E50914`), Pure Black (`#000000`), Pure White (`#FFFFFF`), Lemon Yellow (`#FFE600`).
    *   *Typography*: Symmetrical, heavy bold sans-serif all-caps (Arial-style).
*   **Layer Composition**:
    1.  Base Canvas (White background)
    2.  Header Banner 1 (Black rectangle) & Text layer
    3.  Header Banner 2 (Red rectangle) & Text layer
    4.  Subject Image (Cropped and masked with rounded corners)
    5.  Book Cover Mockup (Image overlay)
    6.  Price Badge Container (Black rounded rectangle) & Text layer
    7.  Footer Banners & Text layers
    8.  Yellow pointing arrow icon (Overlay)
*   **Dynamic Variables**:
    *   Header Line 1 & Line 2 texts
    *   Subject photo (URL/Path)
    *   Book cover image (URL/Path)
    *   Price text (e.g., `"PRIX 5.000F(10$)"`)
    *   Footer texts
*   **Programmatic JSON Representation**:
    ```json
    {
      "canvas": { "width": 1080, "height": 1080, "background": "#FFFFFF" },
      "layers": [
        { "type": "rect", "x": 0, "y": 0, "w": 1080, "h": 100, "fill": "#000000" },
        { "type": "text", "content": "Tu verses le liquide vite", "x": 540, "y": 50, "align": "center", "font": "Arial-Bold", "size": 44, "color": "#FFFFFF" },
        { "type": "rect", "x": 0, "y": 100, "w": 1080, "h": 110, "fill": "#E50914" },
        { "type": "text", "content": "2 Minutes? tu es faible?", "x": 540, "y": 155, "align": "center", "font": "Arial-Bold", "size": 52, "color": "#FFFFFF" },
        { "type": "image", "src": "$subject_img", "x": 80, "y": 240, "w": 520, "h": 620, "radius": 30 },
        { "type": "image", "src": "$book_img", "x": 660, "y": 300, "w": 330, "h": 460 },
        { "type": "rect", "x": 650, "y": 780, "w": 350, "h": 70, "radius": 15, "fill": "#000000" },
        { "type": "text", "content": "PRIX 5.000F(10$)", "x": 825, "y": 815, "align": "center", "font": "Arial-Bold", "size": 32, "color": "#FFE600" },
        { "type": "rect", "x": 0, "y": 880, "w": 1080, "h": 90, "fill": "#E50914" },
        { "type": "text", "content": "Lis la methode et appliques", "x": 540, "y": 925, "align": "center", "font": "Arial-Bold", "size": 40, "color": "#FFFFFF" },
        { "type": "text", "content": "PAS BESOIN DE FAIRE LE SPORT", "x": 540, "y": 1025, "align": "center", "font": "Arial-Bold", "size": 44, "color": "#E50914" }
      ]
    }
    ```

#### Template 1-B: Top Image Background / Bottom Yellow Text Block
*   **Visual Structure**:
    *   *Top Half*: Full-bleed image background (e.g. hand with stopwatch, Zeus, happy couple).
    *   *Bottom Half*: Large solid yellow block (`#FFE600`) containing a bold black title, red subtitle, and centered paragraph description text.
    *   *Right Side Overlay*: Book cover mockup overlapping the top and bottom boundary. Underneath it is a green capsule badge (`#00875A`) with the white price text.
    *   *Footer*: A solid red horizontal bar at the very bottom with white text.
*   **Layer Composition**:
    1.  Base Image (Top-aligned, y: 0 to 500px)
    2.  Yellow Rect (Bottom area, y: 500 to 1080px)
    3.  Red Footer Rect (y: 960 to 1080px)
    4.  Book Cover Mockup on the right (y: 380 to 860px)
    5.  Green Price Badge capsule (y: 880 to 940px) & Text layer
    6.  Yellow block text layers (Title, Subtitle, description)
    7.  Footer text layer
*   **Dynamic Variables**:
    *   Top background photo, bottom title/subtitle, body paragraph, book mockup, price text, and footer text.
*   **Programmatic JSON Representation**:
    ```json
    {
      "canvas": { "width": 1080, "height": 1080, "background": "#FFE600" },
      "layers": [
        { "type": "image", "src": "$top_bg_img", "x": 0, "y": 0, "w": 1080, "h": 500, "crop": "fill" },
        { "type": "image", "src": "$book_img", "x": 780, "y": 380, "w": 230, "h": 330 },
        { "type": "rect", "x": 740, "y": 740, "w": 310, "h": 64, "radius": 32, "fill": "#00875A" },
        { "type": "text", "content": "PRIX 5.000F(10$)", "x": 895, "y": 772, "align": "center", "font": "Arial-Bold", "size": 28, "color": "#FFFFFF" },
        { "type": "text", "content": "2 MINUTES AU LIT", "x": 360, "y": 550, "align": "center", "font": "Arial-Bold", "size": 56, "color": "#000000" },
        { "type": "text", "content": "C'EST RIDICULE", "x": 360, "y": 625, "align": "center", "font": "Arial-Bold", "size": 56, "color": "#E50914" },
        { "type": "text", "content": "$body_paragraph_text", "x": 360, "y": 700, "w": 650, "align": "center", "font": "Arial", "size": 26, "color": "#000000" },
        { "type": "rect", "x": 0, "y": 960, "w": 1080, "h": 120, "fill": "#E50914" },
        { "type": "text", "content": "CA MARCHE SANS PRODUIT", "x": 540, "y": 1020, "align": "center", "font": "Arial-Bold", "size": 48, "color": "#FFFFFF" }
      ]
    }
    ```

#### Template 1-C: Full-Screen Portrait with Rounded Pill Overlays
*   **Visual Structure**: Full-bleed portrait image background. Red and green fully-rounded pill shapes centered vertically in the lower portion of the image. Features a cursor click emoji/graphic next to the green call-to-action button.
*   **Dynamic Variables**: Background image, pill texts, product price (optional red footer banner).

#### Template 1-D: Text-Only High-Contrast Banners
*   **Visual Structure**: Plain white canvas with stacked high-contrast text and rounded red/yellow capsule badges showing state changes (e.g. "Before 2 minutes" -> "Now 20 minutes").

---

### Category 2: Publisher Content Cards (LAD Bible & Cybernews)

These templates mimic viral social media news posts to establish authenticity and native appeal:

```
+---------------------------------------------------+
|  [cybernews]  (Logo Overlay)                      |
|                                                   |
|                                                   |
|                [Circular Inset]                   |
|                   (Optional)                      |
|                                                   |
|===================================================|
| #################################                 |
| # TEXT HIGHLIGHT # UNHIGHLIGHTED TEXT             |
| ##################                                |
| # TEXT HIGHLIGHT #                                |
| ##################                                |
+---------------------------------------------------+
```

*   **Visual Structure**:
    *   *Background*: Full-frame square (`1:1`) or portrait (`4:5`) image.
    *   *Logo*: Placed at the top left (Cybernews) or top right (LAD Bible). Small, white, and clean.
    *   *Circular Inset*: Placed on the vertical edge in the lower-middle half. Contains a close-up profile shot of the narrator or "expert" with a thin white border (thickness: `4-6px`).
    *   *Bottom Text Gradient*: A black semi-transparent vertical gradient covering the bottom 30% of the card to guarantee readability.
    *   *Text & Highlight Boxes*: Bold, centered, sans-serif all-caps. In the Cybernews style, specific keyword segments are wrapped in solid red or green rectangular boxes to emphasize danger or success.
*   **Layer Composition**:
    1.  Base Canvas
    2.  Main background photo
    3.  Semi-transparent black gradient overlay (aligned to bottom)
    4.  Publisher brand logo (Top corner)
    5.  Circular avatar inset (Optional, masked circular image with white border stroke)
    6.  Background highlight shapes (Drawn strictly behind highlighted text lines)
    7.  Headline text layer (White, bold, centered)
*   **Dynamic Variables**: Background photo, publisher logo source, circular profile photo (enabled flag), headline text, and text highlighting indices.
*   **Programmatic Recreation Rules (Pillow Text Highlighting)**:
    *   To draw highlight bars: Measure the bounding box of the specific substring using `font.getbbox(text_segment)`. Draw a filled color rectangle (`#FF0000` or `#00875A`) slightly padded (`+10px` height and width) before writing the text.
    *   Bottom Gradient: Programmatically generate a vertical gradient mask where alpha is 0 at y: 650px and 255 at y: 1080px.

---

### Category 3: Native Social & Clickbait Ads

Highly optimized to grab attention using curiosity loops, standard social UI components, and clickbait markings:

*   **Visual Structure**:
    *   *Template A (Meme / Product Circular Cutout)*: Blurred background with a recognizable meme character (e.g. Mark Zuckerberg as Dr. Evil with red laser eyes). A prominent circular inset in the top-left displays the physical product with sparkles to anchor the promotion.
    *   *Template B (Floating Social Post Card)*: Background contains two split images. Centered is a floating white card styled exactly like a Facebook/Twitter post. A hand-drawn red circle highlights key proof metrics (e.g., "$500k sales month").
    *   *Template C (Sensational Gossip / Eye Censors)*: Background photo of the author/speaker with a solid black rectangle censoring the eyes. Features a red "EXCLUSIVE" banner overlay in the corner.
    *   *Template D (TV Breaking News Ticker)*: Standard screen capture format with a solid white bar across the bottom third, featuring a red rectangular label with white text reading "BREAKING NEWS" and a bold black uppercase news headline.
*   **Layer Composition**:
    1.  Meme/Video-frame background image
    2.  Floating interface UI elements (Social cards, News tickers)
    3.  Sensory overlays (laser eyes, censor bars, hand-drawn red markup circles)
    4.  Circular product cutouts with white borders and sparkles
    5.  Overlay text labels

---

### Category 4: Recruitment & Corporate Flyers

Designed for clear local recruitment, keeping layouts highly structured and corporate:

*   **Visual Structure**:
    *   *Header*: Large red bold all-caps on a clean white background banner (e.g. "RECRUTEMENT TELEVENTE").
    *   *Body Section*: Centered rectangular corporate office stock image.
    *   *Localized Badge*: A distressed, country flag overlay badge (e.g., Cameroon flag) placed in the upper corner of the body image.
    *   *Footer*: A white background area with clean vertical details showing basic salary (in bold black) and commission structures (in bold red).
*   **Layer Composition**:
    1.  White Canvas Base
    2.  Header text layer
    3.  Corporate office image layer (centered, padded)
    4.  Brushstroke Flag badge overlay
    5.  Footer text block (line 1: black, line 2: red)

---

### Category 5: Solid Color Text-Based Graphic Flyers

A minimal, high-speed copy template for advertising digital frameworks:

*   **Visual Structure**:
    *   Solid green background (`#55B23B`).
    *   Perfect symmetrical vertical hierarchy.
    *   Title in large bold white sans-serif.
    *   Description wrapped in parentheses in a slightly smaller weight.
    *   Symmetrical hand emoji graphics placed in the bottom left and right corners pointing downwards to drive attention to the click action.

---

## 3. Core Engine Variables & Positioning Guide

For a programmatic generator using Pillow or Canvas, the layout parameters must be relative to ensure scaling across different screen aspect ratios (1:1, 4:5, 9:16). The following parameters define the core coordinate rules:

| Template Type | Main Aspect Ratio | Alignment Logic | Key Bounding Box Coordinates (1080x1080 canvas) |
| :--- | :--- | :--- | :--- |
| **Header/Footer Banner (1-A)** | 1:1 (Square) | Top and bottom vertical stacks | Header: `[0, 0, 1080, 210]`; Main Image: `[80, 240, 600, 860]`; Book Overlay: `[660, 300, 990, 760]`; Price Capsule: `[650, 780, 1000, 850]`; Footer: `[0, 880, 1080, 1080]`. |
| **Split Half-Image / Yellow Block (1-B)** | 1:1 (Square) | Vertical split at 46% height | Top Image: `[0, 0, 1080, 500]`; Yellow Box: `[0, 500, 1080, 1080]`; Book Overlay: `[780, 380, 1010, 710]`; Price Capsule: `[740, 740, 1050, 804]`; Footer: `[0, 960, 1080, 1080]`. |
| **Publisher News Card (2-A)** | 1:1 or 4:5 | Bottom-anchored gradient overlay | Bottom Gradient: `[0, canvas_height - 400, 1080, canvas_height]`; Logo: Top corner padding `50px`; Circular Inset: `[x_center=800, y_center=600, radius=160]`. |
| **Recruitment Flyer (4-A)** | 1:1 (Square) | Clean vertical layout | Header: `[0, 0, 1080, 120]`; Image: `[0, 120, 1080, 800]`; Flag Badge: `[50, 140, 200, 260]`; Footer: `[0, 800, 1080, 1080]`. |

### Programmatic Recommendations for the Layout Generator:
1.  **Image Masking (Rounded Corners)**: Use `PIL.ImageDraw.Draw` to draw a white rounded rectangle on a blank black mask, then composite the subject image into the canvas.
2.  **Circular Clipping (Insets)**: Clip the avatar image using a circle mask and paste it at the target coordinates. Draw an empty circle with a white stroke on top of the same coordinates to create the clean white border.
3.  **Text Wrapping**: Compute text boundaries dynamically using `font.getmask(text).getbbox()` and wrap lines based on the column width constraints before drawing to avoid overflow.
