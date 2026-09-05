# Template Spatial Bounds & Element Constraints Reference

This master reference defines the exact character boundaries, word limits, forced casing, font sizes, and spatial placements for all 10 supported static ad templates in the SuperAds ecosystem.

---

## 1. Template `1-a`: Niche Product (Default Dual Banner)
- **Canvas Dimensions:** 1080 x 1080 px
- **Category:** Direct-Response Product | **Funnel Stage:** Problem-Aware

| Element Key | Type | Mandatory? | Max Chars | Max Words | Forced Case | Default Value | Spatial Placement & Directives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `headerLine1` | text | No | 40 | 6 | UPPERCASE | `INFUSION VOLCANIQUE 100% NATURELLE` | Top black bar: `0, 0, 1080x100`, White bold 44px |
| `headerLine2` | text | **YES** | 45 | 8 | UPPERCASE | `SOUFFREZ-VOUS D'ÉJACULATION PRÉCOCE ?` | Top red bar: `0, 100, 1080x110`, White bold 52px |
| `subjectImage` | image | **YES** | - | - | - | `/templates/assets/MRESISTORFLYER1.png` | Left frame: `80, 240, 520x620`, 30px radius. **Subject MUST be centered** |
| `productImage` | image | **YES** | - | - | - | `/templates/assets/PATSIMMSCFLYER1.png` | Right mockup: `660, 300, 330x460`. **Must be 3D transparent PNG** |
| `priceBadgeText` | badge | **YES** | 24 | 4 | UPPERCASE | `PRIX : 5.000 FCFA` | Black pill: `650, 780, 350x70`, Yellow bold text `#FFE600` |
| `footerLine1` | text | No | 48 | 8 | UPPERCASE | `COMMANDEZ AUJOURD'HUI & PAYEZ À LA LIVRAISON` | Bottom red bar: `0, 880, 1080x90`, White bold 40px |
| `footerLine2` | text | No | 52 | 9 | UPPERCASE | `LIVRAISON RAPIDE ET DISCRÈTE PARTOUT EN CÔTE D'IVOIRE` | Bottom white bar: `0, 970, 1080x110`, Red bold 44px |

---

## 2. Template `1-b`: Niche Product (Split Copy)
- **Canvas Dimensions:** 1080 x 1080 px
- **Category:** Direct-Response Editorial | **Funnel Stage:** Solution-Aware

| Element Key | Type | Mandatory? | Max Chars | Max Words | Forced Case | Default Value | Spatial Placement & Directives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `topBackgroundImage` | image | **YES** | - | - | - | `/templates/assets/MRESISTORFLYER2.png` | Upper hero: `0, 0, 1080x500`. Subject centered in top 500px |
| `productImage` | image | **YES** | - | - | - | `/templates/assets/PATSIMMSCFLYER5.png` | Floating right: `780, 380, 230x330`. **Must be 3D transparent PNG** |
| `priceBadgeText` | badge | **YES** | 26 | 5 | UPPERCASE | `OFFRE LIMITÉE : 5.000 F` | Green capsule: `740, 740, 310x64`, Green `#00875A`, White bold 26px |
| `title` | text | **YES** | 28 | 5 | UPPERCASE | `SECRET VOLCANIQUE` | Left column: `50, 530, 660px wide`, Black bold 56px |
| `subtitle` | text | **YES** | 35 | 6 | UPPERCASE | `RETROUVEZ VOTRE VIGUEUR MASCULINE` | Left column: `50, 600, 660px wide`, Red bold 56px |
| `bodyParagraph` | text | **YES** | 160 | 30 | NONE | `Une formule ancestrale aux herbes rares pour une endurance naturelle et durable.` | Left column: `50, 680, 660px wide`, Black regular 26px |
| `footerText` | text | No | 45 | 8 | UPPERCASE | `LIVRAISON GRATUITE + PAIEMENT À LA LIVRAISON` | Bottom red bar: `0, 960, 1080x120`, White bold 48px |

---

## 3. Template `2-a`: Publisher Content Card (Advertorial Newsfeed)
- **Canvas Dimensions:** 1080 x 1080 px
- **Category:** Publisher / Newsfeed | **Funnel Stage:** Unaware

| Element Key | Type | Mandatory? | Max Chars | Max Words | Forced Case | Default Value | Spatial Placement & Directives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `backgroundImage` | image | **YES** | - | - | - | `/templates/assets/MRESISTORFLYER4.png` | Full bleed: `0, 0, 1080x1080`. **Subject MUST be in top 60%** |
| `headline` | text | **YES** | 75 | 14 | UPPERCASE | `Comment cette [plante africaine] a sauvé plus de 10.000 couples` | Centered bottom: `80, bottom 80, 920px wide`. **Enclose keyword in [ ]** |
| `highlightColor` | color | No | - | - | - | `#E50914` | Hex accent for `[keyword]` highlight box |
| `logoUrl` | image | No | - | - | - | `/templates/assets/PATSIMMSCFLYER7.png` | Top left: `50, 50, height 50px`. Default: "NEWS" pill badge |
| `avatarUrl` | image | No | - | - | - | `/templates/assets/images.jpeg` | Author circle: `right: 80, bottom: 380, 160x160`. Face centered |

---

## 4. Template `3-a`: Native Social Ad (Promo Card)
- **Canvas Dimensions:** 1080 x 1080 px
- **Category:** Social Native Promo | **Funnel Stage:** Most-Aware

| Element Key | Type | Mandatory? | Max Chars | Max Words | Forced Case | Default Value | Spatial Placement & Directives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `backgroundImage` | image | **YES** | - | - | - | `/templates/assets/MRESISTORFLYER5.png` | Full bleed dark background |
| `productImage` | image | **YES** | - | - | - | `/templates/assets/PATSIMMSCFLYER8.png` | Circle: `80, 80, 240x240`. Yellow border `#FFE600`. Product centered |
| `badgeText` | badge | **YES** | 20 | 3 | UPPERCASE | `-50% AUJOURD'HUI` | Top right tilted badge: `top: 50, right: 50`, -5° rotate |
| `headline` | text | **YES** | 65 | 12 | UPPERCASE | `FINI LES DÉCEPTIONS AU LIT ! RÉSULTAT DÈS LE PREMIER JOUR` | Translucent glass card: `bottom: 80, 980px wide`, White bold 42px |

---

## 5. Template `3-b`: Native Social (Post / Tweet Proof Card)
- **Canvas Dimensions:** 1080 x 1080 px
- **Category:** Social Proof / Tweet | **Funnel Stage:** Solution-Aware

| Element Key | Type | Mandatory? | Max Chars | Max Words | Forced Case | Default Value | Spatial Placement & Directives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `backgroundImage` | image | **YES** | - | - | - | `/templates/assets/The_dur_roi_lion_2.png` | Underlying photo at 85% opacity |
| `postAuthor` | text | **YES** | 30 | 5 | NONE | `Dr. Jean-Marc Koffi` | Author display name in card header, bold 28px |
| `postHandle` | text | **YES** | 25 | 2 | NONE | `@dr_koffi_sante` | Social handle in gray 22px |
| `postAvatar` | image | **YES** | - | - | - | `/templates/assets/images_1.jpeg` | Circle avatar: `80x80`. Face centered |
| `postContent` | text | **YES** | 220 | 40 | NONE | `Après 3 semaines de test avec le thé volcanique, les résultats de mes patients sont stupéfiants.` | Quoted testimonial text, regular 32px |
| `postStats` | text | No | 40 | 6 | NONE | `1.4K Reposts · 8.9K Likes` | Viral metrics line in card footer |

---

## 6. Template `4-a`: Recruitment & Opportunity Flyer
- **Canvas Dimensions:** 1080 x 1080 px
- **Category:** Recruitment & Hiring | **Funnel Stage:** All-Stages

| Element Key | Type | Mandatory? | Max Chars | Max Words | Forced Case | Default Value | Spatial Placement & Directives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `headerTitle` | text | **YES** | 32 | 5 | UPPERCASE | `RECRUTEMENT COMMERCIAL URGENT` | Top header bar: `0, 0, 1080x140`, Red bold 56px with underline |
| `bodyImage` | image | **YES** | - | - | - | `/templates/assets/Copie_de_AFFICHE_RECRUTEMENT_CALL_CENTER_.png` | Centered frame: `80, 180, 920x600`. **Office team MUST be centered** |
| `flagBadgeUrl` | image | No | - | - | - | `/templates/assets/PATSIMMSCFLYER7.png` | Urgency sticker top-left of image: `30, 30, 120x80` |
| `footerSalary` | text | **YES** | 38 | 6 | UPPERCASE | `SALAIRE : 250.000 FCFA / MOIS` | Centered text: `80, bottom 90, 920px wide`, Black bold 44px |
| `footerCommissions`| text | No | 38 | 6 | UPPERCASE | `+ COMMISSIONS NON PLAFONNÉES` | Centered text: `80, bottom 40, 920px wide`, Red bold 38px |

---

## 7. Template `5-a`: Bold Typographic Flyer
- **Canvas Dimensions:** 1080 x 1080 px
- **Category:** Typographic / WhatsApp | **Funnel Stage:** Problem-Aware

| Element Key | Type | Mandatory? | Max Chars | Max Words | Forced Case | Default Value | Spatial Placement & Directives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `backgroundColor`| color | No | - | - | - | `#55B23B` | Canvas background hex (Default: WhatsApp green `#55B23B`) |
| `title` | text | **YES** | 55 | 10 | UPPERCASE | `VOULEZ-VOUS DURER PLUS DE 45 MINUTES NATURELLEMENT ?` | Centered giant headline, White bold 72px |
| `subtitle` | text | No | 65 | 12 | NONE | `CLIQUEZ CI-DESSOUS POUR COMMANDER SUR WHATSAPP` | Centered subtitle, White medium 44px |
| `emoji` | text | No | - | - | - | `👇` | Bottom corner emojis directing eye to Meta ad button |

---

## 8. High-Dopamine Specialized Templates

### Template `hd-red-circle` (Sabri Suby Red Circle & Jitter Arrow)
- **Canvas Dimensions:** 1080 x 1080 px | **Category:** High-Dopamine Direct Response | **Funnel Stage:** Problem-Aware
- **Element Contract:**
  - `subjectImage` (image, **MANDATORY**): Full-bleed candid iPhone photo. Subject looking at camera or laptop, leaving negative space in upper third.
  - `mysteryImage` (image, **MANDATORY**): Close-up zoom of mystery mechanism inside red circle (`left: 650, top: 230, 260x260`, radius 130px).
  - `headlineWhite` (text, **MANDATORY**): Max 25 chars, 1–4 words, **UPPERCASE**. Left banner lead text (e.g. `DATA LEAK:`). Font size 44px bold.
  - `headlineYellow` (text, **MANDATORY**): Max 65 chars, 3–10 words, **UPPERCASE**. Vibrant tabloid yellow (`#FFE500`) hook text. Font size 44px bold.
  - `footerReassurance` (text, optional): Max 50 chars, **UPPERCASE**. Source credibility tag (e.g. `CONFIDENTIAL REPORT · SOURCE: INTERNAL AUDIT`). Font size 18px bold.

### Template `hd-breaking-news` (Tabloid Breaking News Card)
- **Canvas Dimensions:** 1080 x 1080 px | **Category:** Publisher / Tabloid News Broadcast | **Funnel Stage:** Unaware
- **Element Contract:**
  - `backgroundImage` (image, **MANDATORY**): Full-bleed dramatic editorial or situational photo.
  - `alertBadgeText` (text, **MANDATORY**): Max 20 chars, 1–3 words, **UPPERCASE**. Urgent pill text (e.g. `BREAKING NEWS`, `REVEALED`).
  - `sourceText` (text, **MANDATORY**): Max 40 chars, **UPPERCASE**. Red strip source citation (e.g. `CONSUMER REPORT · INVESTIGATION`).
  - `headline` (text, **MANDATORY**): Max 90 chars, 4–12 words, **UPPERCASE**. Massive bold headline with `[bracketed]` yellow highlight syntax.
  - `subtitle` (text, optional): Max 120 chars, 6–18 words, normal case. Supporting statistic or context.

### Template `hd-native-alert` (Native SMS / Notification Overlay)
- **Canvas Dimensions:** 1080 x 1080 px | **Category:** Social Native Proof | **Funnel Stage:** Solution-Aware
- **Element Contract:**
  - `backgroundImage` (image, **MANDATORY**): Full-bleed authentic iPhone lifestyle/selfie/desk photo.
  - `senderName` (text, **MANDATORY**): Max 25 chars. Sender display name (e.g. `Dr. Koffi`, `Operations Lead`, `Chase Banking`).
  - `timestamp` (text, optional): Max 20 chars. E.g. `Today 2:45 PM`, `now`.
  - `messageText` (text, **MANDATORY**): Max 180 chars, 6–30 words. Core conversational proof message with odd numbers.
  - `calloutBadge` (text, optional): Max 25 chars, **UPPERCASE**. Sub-badge (e.g. `VERIFIED SMS ALERT`, `PRIVATE THREAD`).
  - `bottomNotice` (text, optional): Max 60 chars. E.g. `Tap to view full message thread • 100% Confidential`.
