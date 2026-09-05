---
name: avatar-mechanism-mapper
description: Extracts target audience avatars, maps the unaware problem for the 60% pyramid layer, extracts unique mechanisms using the NUEEPH framework, and translates intangible products (B2B SaaS, consulting, health, e-com, agencies) into tactile physical Mystery Objects. Use when analyzing offers, identifying unique mechanisms, mapping audience awareness stages, or selecting physical visual anchors for static ads.
---

# Avatar & Mechanism Mapper

The `avatar-mechanism-mapper` operationalizes Sabri Suby's core direct-response market analysis methodology. It unbundles commercial products and services into the psychological levers required for viral, high-dopamine static ads.

Rather than competing for the expensive, highly saturated 3% of buyers actively looking to purchase, this skill penetrates the **60% Unaware Layer** by identifying hidden symptoms, extracting a proprietary **NUEEPH mechanism**, and translating abstract value propositions into tactile, physical **Mystery Objects**.

---

## Quick Start

Given an offer brief, extract the avatar, mechanism, and tangible object:

```bash
# Example extraction call
python3 -c "
from pathlib import Path
# Reads niche_to_object_matrix.md for tactile anchor recommendations
matrix = Path('references/niche_to_object_matrix.md').read_text()
print('Niche matrix loaded with tactile anchors.')
"
```

Core process steps:
1. Map the audience across the 4 Pyramid Layers, focusing on the 60% unaware market.
2. Filter the solution through the NUEEPH framework (`references/nueeph_framework.md`).
3. Convert the intangible software/service into a physical prop from `references/niche_to_object_matrix.md`.
4. Inject odd numbers and specific metrics ($1,422.50 instead of $1,000; 90–480 leads instead of 100).

---

## The Sabri Suby Audience Pyramid

```
                ┌───────┐
                │  3%   │  Ready to Buy Now (Red Ocean: High CPC, direct pitches)
             ┌──┴───────┴──┐
             │     17%     │  Information Gathering Mode (Comparing features/vendors)
          ┌──┴─────────────┴──┐
          │        20%        │  Problem Aware (Knows the pain, has not found cure)
       ┌──┴───────────────────┴──┐
       │           60%           │  UNAWARE (Largest audience, zero ad fatigue, highest scale)
       └─────────────────────────┘
```

### Why Attack the 60% Layer?
1. **Zero Resistance:** They are not evaluating competitors or comparing price points.
2. **Infinite Scale:** They represent the vast majority of social media users scrolling Facebook and Instagram.
3. **Cheap CPMs:** Broad, high-engagement creative unlocks Facebook's lowest auction bid rates.
4. **Pattern Interrupt Requirement:** Because they are unaware, commercial ads are ignored. Only news hooks, gossip framing, and mysterious objects will arrest their thumb.

---

## Workflows

### 1. 60% Unaware Problem Discovery
- Identify the latent symptom the avatar experiences every day without realizing it is caused by an underlying systemic defect.
- **Wrong (Problem-Aware 20%):** *"Are you struggling to generate qualified sales leads for your agency?"*
- **Right (Unaware 60%):** *"Why marketing agency owners with full calendars are quietly noticing cash balances drop on the 1st of every month."*

### 2. NUEEPH Mechanism Formulation
Every high-performing offer possesses an engine that generates results. Unpack it using the NUEEPH framework:
- **N - New:** Frame as a recent protocol, post-2024 loophole, or newly uncovered algorithm rule.
- **U - Unique:** Give it a trademarked or proprietary name (e.g. *"The 4-Second Flush"*, *"The Tesla Funnel"*, *"Passive Packet Sniffing"*).
- **E - Easy:** Convey near-zero friction or human intervention.
- **E - Enabling:** Gives an ordinary practitioner an unfair institutional advantage.
- **P - Proof:** Tied to empirical data points, third-party benchmarks, or physical demonstrations.
- **H - High-Margin:** Justifies premium pricing or exponential return on investment.

See `references/nueeph_framework.md` for complete scoring guidelines.

### 3. Intangible-to-Tangible Mystery Object Translation
Abstract concepts cannot be circled with a red marker in a static photo. They must be physicalized into tactile props:
- **B2B SaaS / Code:** Black USB stick with glowing amber LED or thermal paper receipt with red strikeout line.
- **Agency / Client Acquisition:** Redacted black binder with neon highlighter mark or cracked iPad showing live analytics.
- **Mortgage / Refinancing:** Crumpled official bank statement with red ink circling one hidden compliance fee.
- **Health / Weight Loss:** Unmarked amber glass dropper vial or half-cut exotic citrus fruit.
- **E-Commerce Durability:** Close-up macro split: torn competitor factory seam vs intact stitch.
- **Executive Coaching:** Worn pocket Moleskine notebook with 3 handwritten rules.

See `references/niche_to_object_matrix.md` for the complete cross-industry catalog.

### 4. Numeric Calibration (The Odd Number Rule)
Round numbers ($1,000, 100 leads, 50%) look like fabricated advertising claims. High-dopamine copy requires odd, exact, believable numbers:
- Replace `$1,000` with `$1,422.50` or `$847`
- Replace `100 leads` with `90 to 480 inbound accounts`
- Replace `lose weight fast` with `12 to 19 kgs in 8 weeks`
- Replace `save time` with `18.4 hours every Tuesday`

---

## Input Schema

```json
{
  "productName": "FlowAudit Suite",
  "category": "B2B SaaS",
  "offerDescription": "Automates agency billable hours tracking and finds unbilled Slack requests.",
  "idealCustomer": "Agency owners with 10-50 employees",
  "price": "$299/mo",
  "primaryProof": "$4.2M recovered across 312 agencies"
}
```

---

## Output Schema

```json
{
  "avatarProfile": {
    "role": "Independent Agency Principal / COO",
    "marketPyramidTarget": "60% Unaware",
    "symptomManifestation": "Calendar is completely booked, employees are working overtime, yet agency net margin is under 12%",
    "hiddenRootCause": "Silent Scope Creep: Unbilled micro-tasks delivered inside client Slack channels",
    "externalVillain": "Manual timesheet software and client chat sprawl"
  },
  "nueephMechanism": {
    "name": "The Slack Packet Recon Protocol",
    "newAngle": "Post-2025 API reconciliation method",
    "uniqueIdentity": "Proprietary background timestamp auditor",
    "easyFriction": "One-click OAuth connection; zero manual time logging",
    "enablingSuperpower": "Turns standard project managers into forensic auditors",
    "proofAnchor": "$4.2M recovered; audited across 312 active agency instances",
    "highMarginValue": "Unlocks an immediate $12,400/month in billable revenue"
  },
  "tangibleMysteryObject": {
    "prop": "Black USB Drive with Glowing Amber LED indicator",
    "nicheCategory": "B2B SaaS / Automation",
    "visualContext": "Subject in casual office setting holding the drive toward camera while pointing at a blurred monitor screen",
    "macroFocalPoint": "The tip of the drive where the amber light shines"
  },
  "specificNumerics": {
    "revenue": "$12,400.00",
    "timeframe": "8 minutes",
    "volume": "312 agencies",
    "range": "90 to 480 billable hours"
  }
}
```

---

## Execution Checklist

- [ ] Avatar pain articulated as a current everyday symptom, not a sales pitch.
- [ ] 60% Unaware layer targeted; no direct mentions of buying software or booking calls.
- [ ] Unique mechanism named with proprietary branding (NUEEPH certified).
- [ ] Mystery Object selected from `references/niche_to_object_matrix.md` with tactile physical presence.
- [ ] Visual context defined with negative space for red arrow and circle.
- [ ] All round numbers eliminated in favor of specific odd metrics.

---

## References

- [NUEEPH Framework Guide](references/nueeph_framework.md): In-depth breakdown of New, Unique, Easy, Enabling, Proof, High-margin criteria.
- [Niche-to-Object Matrix](references/niche_to_object_matrix.md): Master mapping table for translating intangible offers into tangible props.
