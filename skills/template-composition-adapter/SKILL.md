---
name: template-composition-adapter
description: "Bridges copy and visual directives to target template contracts (1-a, 1-b, 2-a, 3-a, 3-b, 4-a, 5-a, hd-red-circle, hd-breaking-news, hd-native-alert). Validates character limits, uppercase rules, subject centering, and produces the JSON payload for /api/assemble. Use when preparing payloads for ad assembly, validating template constraints, auto-fitting copy into layout containers, or formatting multi-layer ad compositions."
---

# Template Composition Adapter

The `template-composition-adapter` connects high-dopamine copywriting and visual art direction with SuperAds' deterministic assembly engine (`POST /api/assemble`).

Every direct-response static template enforces strict **spatial constraints**, **mandatory casing**, **character limits**, and **compositional geometry** (such as human subject centering and transparent 3D cutouts). This skill validates incoming inputs against official template contracts, applies automatic fitting and casing transformations, and compiles the final payload.

---

## Quick Start

Fit text to exact template element boundaries using the bundled utility script:

```bash
# Fit a headline to a 45-character UPPERCASE banner constraint
node skills/template-composition-adapter/scripts/fit_text.js   --text "Former agency director leaks the unlisted client acquisition protocol"   --maxChars 45   --forcedCase UPPERCASE   --mode ellipsize

# Batch audit a template variables payload
node skills/template-composition-adapter/scripts/fit_text.js   --text "PRIX : 5.000 FCFA"   --maxChars 24   --forcedCase UPPERCASE
```

---

## Supported Template Catalog

This skill supports 10 distinct ad layout contracts:

### 1. Standard Production Templates (SuperAds Core)
- **`1-a` (Niche Product - Default Dual Banner):** 1080x1080. Dual header bars, left centered symptom portrait, right 3D transparent product mockup, yellow price pill, dual reassurance footer bars.
- **`1-b` (Niche Product - Split Copy):** 1080x1080. Top hero landscape photo, lower yellow high-energy column, split headline + explanation body paragraph, green offer capsule, floating right mockup.
- **`2-a` (Publisher Content Card - Advertorial):** 1080x1080. Full-bleed photo (subject in top 60%), dark lower 40% gradient, highlighted editorial headline with `[keyword]` syntax, circular author avatar inset.
- **`3-a` (Native Social Promo Card):** 1080x1080. Dark atmospheric background, top-left 240x240 circular product inset with yellow border, tilted 5° urgency badge, bottom translucent headline card.
- **`3-b` (Native Social Post / Tweet Card):** 1080x1080. Social proof tweet layout with profile avatar, display name, handle, authentic customer quote, and viral metrics line.
- **`4-a` (Recruitment & Opportunity Flyer):** 1080x1080. Top header banner, centered 920x600 workplace photo, guaranteed base salary text, uncapped performance bonus banner.
- **`5-a` (Bold Typographic Flyer):** 1080x1080. WhatsApp green or vibrant high-contrast background, giant centered white bold headline (max 55 chars), subtitle, pointing finger emojis (`👇`).

### 2. High-Dopamine Specialized Templates
- **`hd-red-circle` (The Curiosity Loop):** Candid iPhone photo, magnified circular crop around the Mystery Object, hand-drawn jittery red arrow, and bottom tabloid ticker banner.
- **`hd-breaking-news` (The Press Conference Leak):** Documentary-style candid photo, chromatic split news ticker banner (`lead_text` in white + `accent_text` in tabloid yellow), and high-contrast alert badge.
- **`hd-native-alert` (The SMS Notification Glitch):** Authentic everyday background with floating translucent iOS/Android SMS bubble showing surprising transaction or message, paired with bottom benefit bar.

---

## The Adaptation Engine Workflow

```
[Raw High-Dopamine Copy + Image Directives]
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│             template-composition-adapter               │
├────────────────────────────────────────────────────────┤
│ 1. Contract Lookup (references/template_spatial_bounds)│
│ 2. Casing Enforcement (e.g. UPPERCASE for 1-a headers) │
│ 3. Character & Word Bound Fitting (fit_text.js)        │
│ 4. Visual Composition Rule Enforcement:                │
│    - Human subject strictly centered in frame          │
│    - 3D product mockup on 100% transparent PNG         │
│    - Key action in top 60% (prevent gradient eclipse)  │
│ 5. Syntax Formatting (e.g. [keyword] highlights)       │
│ 6. Assembly JSON Payload Construction                  │
└────────────────────────────────────────────────────────┘
                   │
                   ▼
[POST /api/assemble Payload with Resolved Variables]
```

---

## Critical Composition Directives

### 1. Subject Centering (For Images)
- In templates with portrait boxes (`1-a` left frame, `4-a` office photo, `3-a` circular inset), the rendering engine applies `object-fit: cover`.
- **Rule:** The human face or focal prop **MUST BE CENTERED HORIZONTALLY AND VERTICALLY**. If the model or photographer places the head in the top-left rule-of-thirds sweet spot, the top-crop will decapitate the subject.

### 2. Transparent Backgrounds (For Product Mockups)
- In templates `1-a` and `1-b`, the product image overlaps white or colored container backgrounds.
- **Rule:** The product mockup **MUST BE A CLEAN PNG WITH 100% TRANSPARENCY**. Opaque JPEG white boxes create an amateur aesthetic that destroys CTR.

### 3. Gradient Safety (Template `2-a` & `hd-breaking-news`)
- The bottom 40% of the canvas is covered by a dark gradient scrim (`rgba(0,0,0,0.85)`).
- **Rule:** All critical visual cues, facial expressions, and Mystery Objects must live in the **upper 60% (top 0 to 650px)**.

---

## Input Schema

```json
{
  "templateId": "1-a",
  "copy": {
    "qualification": "INFUSION VOLCANIQUE 100% NATURELLE",
    "visceralHook": "SOUFFREZ-VOUS D'ÉJACULATION PRÉCOCE ?",
    "pricePill": "PRIX : 5.000 FCFA",
    "codAction": "COMMANDEZ AUJOURD'HUI & PAYEZ À LA LIVRAISON",
    "reassurance": "LIVRAISON RAPIDE ET DISCRÈTE EN 24H"
  },
  "assets": {
    "subjectImageUrl": "https://cdn.mysite.com/centered-man-stamina.jpg",
    "productMockupUrl": "https://cdn.mysite.com/volcano-tea-cutout.png"
  }
}
```

---

## Output Schema (`/api/assemble` Ready)

```json
{
  "templateId": "1-a",
  "variables": {
    "headerLine1": "INFUSION VOLCANIQUE 100% NATURELLE",
    "headerLine2": "SOUFFREZ-VOUS D'ÉJACULATION PRÉCOCE ?",
    "subjectImage": "https://cdn.mysite.com/centered-man-stamina.jpg",
    "productImage": "https://cdn.mysite.com/volcano-tea-cutout.png",
    "priceBadgeText": "PRIX : 5.000 FCFA",
    "footerLine1": "COMMANDEZ AUJOURD'HUI & PAYEZ À LA LIVRAISON",
    "footerLine2": "LIVRAISON RAPIDE ET DISCRÈTE EN 24H"
  },
  "uploadToR2": true,
  "validationReport": {
    "isValid": true,
    "elementsAudited": 7,
    "casingAdjustmentsApplied": 0,
    "truncationsApplied": 0
  }
}
```

---

## Execution Checklist

- [ ] Target `templateId` exists in supported catalog.
- [ ] All mandatory fields for the template are populated.
- [ ] Forced casing rules enforced (`UPPERCASE` where required by contract).
- [ ] Text lengths verified via `scripts/fit_text.js` without overflow.
- [ ] Image assets verified for subject centering and transparent PNG requirements.
- [ ] Bracket highlight syntax `[keyword]` applied for template `2-a`.
- [ ] Output JSON structured for direct POST to `/api/assemble`.

---

## References

- [Template Spatial Bounds Reference](references/template_spatial_bounds.md): Complete field-by-field character limits, font sizes, and layout coordinates for all 10 templates.
