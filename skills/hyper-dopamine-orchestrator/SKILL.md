---
name: hyper-dopamine-orchestrator
description: Coordinates end-to-end generation of high-dopamine static image ad campaigns from Symphony context (Product, Avatar, Mechanism, Voice, Target Templates). Orchestrates sub-skills across avatar mapping, tabloid angle generation, high-dopamine copy, template composition adaptation, and compliance auditing into a validated multi-asset manifest ready for rendering. Use when coordinating high-dopamine ad campaigns, producing complete static ad manifests, or linking Symphony strategic briefs to SuperAds rendering.
---

# Hyper-Dopamine Orchestrator

The `hyper-dopamine-orchestrator` is the meta-coordination engine for high-dopamine static ad generation. It bridges upstream strategic intelligence from the SYNPHONYS Campaign Hub with downstream deterministic rendering in SuperAds (`/api/assemble`).

By orchestrating specialized sub-skills, it transforms high-level product propositions into complete, multi-asset campaign manifests containing scroll-stopping native visuals, greasy-chute copy, contract-validated template payloads, and compliant landing page bridges.

---

## Quick Start

Execute an end-to-end orchestration run from a Symphony context JSON:

```bash
# Ingest Symphony campaign brief and produce full multi-asset manifest
python3 -c "
import json
from pathlib import Path

# Load context from Symphony
context = json.loads(Path('references/sample_symphony_context.json').read_text())
print(f'Ingested Symphony Campaign: {context.get("campaignId")}')
"
```

To run sub-skill validations and assemble payload:
1. Extract Avatar & Mechanism: call `avatar-mechanism-mapper`
2. Generate 5 Tabloid Angles: call `tabloid-angle-generator`
3. Generate Feed & Banner Copy: call `high-dopamine-copywriter`
4. Adapt to Template Contracts: call `template-composition-adapter`
5. Audit Policy & Bridge: call `compliance-bridge-auditor`

---

## Architectural Flow

```
[SYNPHONYS Campaign Hub]
        │
        ▼ (Symphony Context JSON: Product, Avatar, Mechanism, Voice, Target Templates)
┌────────────────────────────────────────────────────────────────────────┐
│                     hyper-dopamine-orchestrator                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Context Intake & Schema Validation                                  │
│       │                                                                │
│       ├─► [avatar-mechanism-mapper]                                   │
│       │     └─► 60% Unaware Problem + NUEEPH Mechanism + Mystery Object│
│       │                                                                │
│       ├─► [tabloid-angle-generator]                                    │
│       │     └─► 5 Tabloid Angles (Honey vs Vinegar Polarity Enforced)  │
│       │                                                                │
│       ├─► [high-dopamine-copywriter]                                   │
│       │     ├─► Primary Text (Zero 'You' in L1-3, Grade <= 5)          │
│       │     ├─► Headline (<40 chars, Odd Numbers, Big Benefit)        │
│       │     ├─► In-Image Chromatic Banner Micro-Copy                   │
│       │     └─► Description + CTA ('Learn More' only)                  │
│       │                                                                │
│       ├─► [template-composition-adapter]                              │
│       │     └─► Validated Element Payloads for 1-a..5-a, hd-*          │
│       │                                                                │
│       └─► [compliance-bridge-auditor]                                  │
│             ├─► Meta Policy Safety Score & Safe-Harbor Rewrites        │
│             └─► Post-Click Landing Page Congruence Bridge (H1+Intro)   │
└────────────────────────────────────────────────────────────────────────┘
        │
        ▼
[Campaign Asset Manifest (JSON)]
        │
        ▼
[SuperAds Microservice /api/assemble & Cloudflare R2 CDN]
```

---

## Multi-Skill Execution Workflow

### Phase 1: Intake & Context Ingestion
1. Ingest context from Symphony conforming to `references/symphony_context_contract.md`.
2. Verify required fields: `campaignId`, `product`, `avatar`, `mechanism`, `targetTemplates`, `delivery.destinationUrl`.
3. Normalize niche into standard category: `B2B SaaS`, `Agency`, `Mortgage/Finance`, `Health/Supplements`, `E-Commerce`, `Coaching/Consulting`.

### Phase 2: Avatar & Mechanism Extraction
Invoke `avatar-mechanism-mapper`:
- Penetrate the **60% Unaware Layer** of the Sabri Suby pyramid.
- Score and validate the unique mechanism against the **NUEEPH** criteria (New, Unique, Easy, Enabling, Proof, High-margin).
- Translate the intangible offer into a tactile physical **Mystery Object** (e.g. Black USB Stick, Redacted Binder, Crumpled Statement).
- Calibrate specific odd numbers (e.g. `$1,422.50`, `90 to 480 leads`).

### Phase 3: Angle Generation & Selection
Invoke `tabloid-angle-generator`:
- Generate 5 distinct angles based on Facebook Most Viewed Content Report archetypes:
  1. Whistleblower / Leak
  2. Accidental Discovery
  3. Authority Counter-Punch
  4. Secret Geography / Asset
  5. The Warning / New Era
- Enforce the **Positive Honey vs Vinegar rule** (positive gain beats negative fear 8:1).
- Rank angles and select the primary angle matching the target template.

### Phase 4: High-Dopamine Copywriting
Invoke `high-dopamine-copywriter`:
- Produce full feed copy: Primary Text, Headline, Description, Call To Action.
- Verify the **Zero You rule**: zero second-person pronouns in lines 1 to 3.
- Run `readability_checker.js` to ensure Flesch-Kincaid Grade Level <= 5.0.
- Draft in-image chromatic banner copy (`lead_text` white + `accent_text` yellow `#FFE500` or red `#E50914`).
- Lock CTA strictly to `"Learn More"`.

### Phase 5: Template Composition Adaptation
Invoke `template-composition-adapter`:
- Map copy and visual parameters to target templates (`1-a`, `1-b`, `2-a`, `3-a`, `3-b`, `4-a`, `5-a`, `hd-red-circle`, `hd-breaking-news`, `hd-native-alert`).
- Run `fit_text.js` to enforce character/word limits and forced uppercase constraints.
- Ensure composition directives: centered human subject, transparent PNG product mockups, upper-60% focal placement for gradients.
- Format the final JSON payload for `POST /api/assemble`.

### Phase 6: Compliance Audit & Landing Page Bridge
Invoke `compliance-bridge-auditor`:
- Audit ad assets against Meta Advertising Standards (personal attributes, sensationalism, unrealistic claims).
- Calculate Meta Policy Safety Score (0-100).
- If score < 85, apply Safe Harbor rewrites.
- Generate the post-click **Landing Page Bridge** (H1 headline, subhead, 3-sentence narrative bridge) to guarantee 100% scent match and minimize bounce rate.

### Phase 7: Manifest Compilation & Handoff
Compile all assets into the canonical **Campaign Asset Manifest** conforming to `references/orchestration_manifest_schema.json`.

---

## Input Schema (Symphony Context)

```typescript
interface SymphonyContext {
  campaignId: string;
  brandName: string;
  product: {
    name: string;
    category: 'B2B SaaS' | 'Agency' | 'Mortgage' | 'Health' | 'E-Commerce' | 'Coaching' | string;
    description: string;
    coreTransformation: string;
    pricePoint: string;
    riskReversal?: string;
    proofPoints: string[];
  };
  avatar: {
    role: string;
    awarenessStage: 'Unaware' | 'Problem-Aware' | 'Solution-Aware' | 'Most-Aware';
    acuteFrustration: string;
    villain: string;
    secretDesire: string;
  };
  mechanism?: {
    name?: string;
    intangibleConcept?: string;
    tangibleMysteryObject?: string;
  };
  voice?: {
    tone?: string;
    readabilityTargetGrade?: number;
    forbiddenWords?: string[];
  };
  targetTemplates: string[];
  delivery: {
    renderMode: 'local' | 'r2' | 'base64';
    destinationUrl: string;
  };
}
```

---

## Output Schema (Campaign Asset Manifest)

The orchestrator produces a validated manifest containing complete instructions for ad delivery:

```typescript
interface CampaignAssetManifest {
  manifestVersion: '1.0.0';
  campaignId: string;
  timestamp: string;
  strategy: {
    unawareProblem: string;
    nueephMechanism: {
      name: string;
      classification: string;
      tactileMysteryObject: string;
      oddNumberMetric: string;
    };
    chosenAngle: {
      archetypeId: 'whistleblower' | 'accidental_discovery' | 'authority_counterpunch' | 'secret_geography' | 'warning_new_era';
      headline: string;
      newsHook: string;
      honeyPolarityScore: number;
    };
  };
  adCreatives: Array<{
    templateId: string;
    templateName: string;
    assemblePayload: {
      templateId: string;
      variables: Record<string, any>;
      uploadToR2: boolean;
    };
    visualDirectives: {
      prompt: string;
      subjectCenteringRequired: boolean;
      mysteryObjectFocalPoint: string;
      overlays: string[];
    };
  }>;
  feedCopy: {
    primaryText: string;
    headline: string;
    description: string;
    callToAction: 'Learn More';
    metrics: {
      readabilityGrade: number;
      zeroYouCompliant: boolean;
      characterCount: number;
    };
  };
  compliance: {
    policyScore: number;
    flaggedTerms: string[];
    safeHarborApplied: boolean;
  };
  landingPageBridge: {
    targetUrl: string;
    preHeadlineTicker: string;
    h1Headline: string;
    subhead: string;
    openingNarrativeBridge: string[];
    scentMatchScore: number;
  };
}
```

---

## Quality & Guardrail Checklist

- [ ] Symphony input validated against `references/symphony_context_contract.md`.
- [ ] 60% Unaware problem formulated without premature solution pitching.
- [ ] Physical Mystery Object identified from `references/niche_to_object_matrix.md`.
- [ ] Odd numbers applied across all metrics ($1,422.50, 90 to 480 leads, 14.8 minutes).
- [ ] 5 angles generated with Honey vs Vinegar positive benefit bias verified.
- [ ] Primary copy verified by `readability_checker.js` (Flesch-Kincaid Grade <= 5.0).
- [ ] Zero instances of "you/your" in first 3 sentences of Primary Text.
- [ ] Target template variables verified by `fit_text.js` within spatial character bounds.
- [ ] Subject centering and transparent PNG requirements explicitly formatted in payloads.
- [ ] Meta policy safety score >= 85; safe-harbor rewrites applied if needed.
- [ ] Landing page bridge provides 100% scent match with the curiosity hook.

---

## References

- [Symphony Context Contract](references/symphony_context_contract.md): Detailed specification of Symphony intake data.
- [Orchestration Manifest Schema](references/orchestration_manifest_schema.json): Canonical JSON schema for the output manifest.
