---
name: high-dopamine-copywriter
description: "Generates direct-response ad feed copy (Primary Text, Headline, Long Text, Description, CTA) and in-image banner copy following Sabri Suby's high-dopamine copywriting laws. Strictly enforces the Zero You rule in opening 3 lines, Hemingway Grade 5 or lower readability, greasy chute formatting with 1 sentence per paragraph, and exclusive Learn More CTA. Use when writing Facebook ad copy, crafting news banners, optimizing readability, or removing second-person pronoun policy violations."
---

# High-Dopamine Copywriter

The `high-dopamine-copywriter` produces direct-response social ad copy strictly tuned to Sabri Suby's high-dopamine ad architecture. 

It splits the copywriting task into two distinct psychological components:
1. **The In-Image Chromatic Banner:** Pattern-interrupt tabloid headline rendered directly on the graphic creative.
2. **The Ad Unit Feed Copy:** Primary Text, Headline, Description, and CTA rendered in Meta's newsfeed UI.

Every piece of copy is validated through deterministic tooling to enforce the **Zero You Rule**, **Hemingway Grade $\le 5$ readability**, **Greasy Chute cadence**, and the **"Learn More" CTA standard**.

---

## Quick Start

Test any piece of ad copy with the bundled deterministic Node.js checker:

```bash
# Check raw text directly
node skills/high-dopamine-copywriter/scripts/readability_checker.js   --text "This client getting hack feels wild. Most founders think ads are about media buying. They are wrong. It is about psychology."

# Run strict audit on a copy file (fails if Grade > 5.0 or 'you' in lines 1-3)
node skills/high-dopamine-copywriter/scripts/readability_checker.js --file copy.txt --strict --json
```

---

## The 4 Non-Negotiable Direct-Response Laws

### Law 1: The "Zero You" Rule in Lines 1–3
- **Why?** Using second-person pronouns (*"you", "your", "yours", "you're"*) in the opening 3 lines triggers two catastrophic failures:
  1. **Algorithmic:** Meta's policy bots flag direct-attribute callouts (*"Are you in debt?", "Are you struggling?"*) leading to ad account restrictions.
  2. **Psychological:** The reader's cognitive firewall instantly identifies the post as an ad, triggering instant thumb scroll-past.
- **The Execution:** Open with third-person observations, case studies, or group identifiers (*"Aussies", "Founders", "Most agency owners", "A 28-year-old nurse"*).

### Law 2: Hemingway Grade $\le 5$ Readability
- The average social media user scrolls fast while multi-tasking. Complex sentences and multi-syllable corporate jargon kill momentum.
- Keep average sentence length under **12 words**.
- Use 1- and 2-syllable words for 85%+ of vocabulary.
- Flesch-Kincaid Grade Level must be **5.0 or below**.

### Law 3: Greasy Chute Formatting (One Sentence Per Paragraph)
- Once the reader begins reading the first sentence, the design and rhythm must pull them down the page like a slide greased with butter.
- Exactly **1 sentence per paragraph**.
- Use generous vertical whitespace to optimize for mobile viewport scanning.
- Ellipses (`...`) or short transitional phrases at paragraph ends to bridge thought to thought.

### Law 4: The "Learn More" CTA Exclusivity
- Never select `"Buy Now"`, `"Sign Up"`, `"Shop Now"`, or `"Book Now"`.
- Commercial call-to-actions trigger buyer defense mechanisms and price resistance.
- `"Learn More"` frames the click as risk-free information gathering.

---

## The Ad Unit Architecture

```
┌──────────────────────────────────────────────────────────┐
│ [Facebook / Instagram Feed Post]                         │
│                                                          │
│ Primary Text (Layer 2: The Slippery Slope)               │
│ - Line 1: Curiosity hook / external story (NO 'YOU')     │
│ - Line 2: Agitation of hidden symptom                    │
│ - Line 3: Discovery / unexpected outlier                 │
│ - Butter Body: Odd-number proof, mechanism reveal        │
│ - Final Line: Frictionless call to action                │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Static Image Creative (Layer 1: Pattern Interrupt)   │ │
│ │ - Unpolished candid photo with Mystery Object        │ │
│ │ - Magnified circular crop with jittery red arrow     │ │
│ │ - [DATA LEAK: The Unmarked $14 Hardware Drive]       │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Headline (Layer 3: The Bullseye - Max 40 Chars)          │
│ "Recover $12,400 In Unbilled Client Work"               │
│                                                          │
│ Description (Layer 3: The Friction Reducer)              │
│ "4.9 ⭐ (312 Verified Agencies)"                          │
│                                                          │
│ CTA Button                                 [Learn More]  │
└──────────────────────────────────────────────────────────┘
```

---

## Workflows

### 1. In-Image Banner Copy Generation
Generate a chromatic split for the graphic compositor:
- `leadText`: 1–3 words in pure white (`#FFFFFF`) specifying the alert type: `DATA LEAK:`, `REVEALED:`, `EXPOSED:`, `ALERT:`.
- `accentText`: 3–7 words in vibrant tabloid yellow (`#FFE500`) or alert red (`#E50914`): `The $14 Hardware Drive Auditing 40-Person Teams`.
- Total length must not exceed 45 characters.

### 2. Primary Text Drafting
Construct the narrative following the 5-step greasy chute:
1. **The Hook (Line 1):** Intriguing observation without second-person pronouns.
2. **The Descent (Lines 2–4):** Agitating the hidden flaw with short, punchy sentences.
3. **The Catalyst (Lines 5–7):** Introducing the tactile Mystery Object and proprietary mechanism.
4. **The Proof Stack (Lines 8–10):** Stacking specific odd metrics ($12,400.00, 312 agencies, 8 minutes).
5. **The Gateway (Final Line):** Recommending tapping below to learn more.

### 3. Headline & Description Crafting
- **Headline:** Focus strictly on the **Specific Big Benefit**. Must remain under 40 characters so mobile devices do not truncate it with `...`.
- **Description:** 20–35 characters providing social proof (*"312 verified agency audits"*) or gentle command (*"Watch Carefully, Then Click"*).
- **CTA:** Strictly lock to `"Learn More"`.

### 4. Deterministic Readability Audit
Pass the drafted copy through `scripts/readability_checker.js`. If the script flags any second-person pronouns in sentences 1–3 or a Flesch-Kincaid Grade > 5.0, immediately revise according to `references/hemingway_rules.md`.

---

## Input Schema

```json
{
  "productName": "FlowAudit Suite",
  "category": "B2B SaaS / Agency Automation",
  "targetAvatar": "Agency Principals & Operations Leads",
  "mechanismName": "Passive Slack Packet Recon",
  "mysteryObject": "Black USB Drive with Amber LED",
  "oddNumberMetric": "$12,400.00 / month",
  "selectedAngle": "The Whistleblower / Leak"
}
```

---

## Output Schema

```json
{
  "inImageBanner": {
    "leadText": "DATA LEAK:",
    "accentText": "The $14 Drive Auditing 40-Person Teams",
    "accentColor": "#FFE500",
    "characterCount": 42
  },
  "feedCopy": {
    "primaryText": "This client audit method feels like a cheat code.\n\nMost agency owners think profit leaks happen in payroll.\n\nThey are wrong.\n\nIt happens in client chat channels every single Tuesday.\n\nA former operations chief recently showed off a small black drive.\n\nIt audits thousands of Slack messages in 8 minutes.\n\nNo manual timesheets.\n\nNo awkward staff surveys.\n\nIn a test across 312 marketing firms, it recovered an average of $12,400.00 in unbilled work.\n\nDetails on how the protocol works have been published below.\n\nTap Learn More to see the full breakdown.",
    "headline": "Recover $12,400 In Unbilled Work",
    "description": "4.9 ⭐ (312 Verified Agencies)",
    "callToAction": "Learn More"
  },
  "verification": {
    "fleschKincaidGrade": 4.1,
    "fleschReadingEase": 82.4,
    "zeroYouRuleCompliant": true,
    "averageSentenceLengthWords": 8.7,
    "totalCharacters": 642,
    "status": "APPROVED_HIGH_DOPAMINE"
  }
}
```

---

## Quality Checklist

- [ ] Zero instances of "you", "your", "yours", "you're", "you've" in sentences 1–3.
- [ ] Readability tested with `scripts/readability_checker.js` (Grade $\le 5.0$).
- [ ] 1 sentence per paragraph with blank lines between every thought.
- [ ] Headline $\le 40$ characters with specific odd numbers ($12,400 vs $10,000).
- [ ] Description provides social proof or intrigue under 35 characters.
- [ ] CTA button strictly set to `"Learn More"`.
- [ ] Chromatic banner copy under 45 characters with white/yellow split.

---

## References

- [Hemingway Rules Reference](references/hemingway_rules.md): Syllable count math, cadence guidelines, and simplification dictionary.
- [Suby Copywriting Rules](references/suby_copy_rules.md): Sabri Suby's foundational direct-response laws from $200M+ ad spend.
