---
name: compliance-bridge-auditor
description: "Audits ads against Meta Advertising Standards (personal attributes, unrealistic claims, sensationalism) and generates the post-click Landing Page Bridge (H1 headline, subhead, opening 3 sentences) ensuring scent match. Use when pre-flight auditing Meta ads for policy compliance, rewriting flagged hooks into safe-harbor editorial language, or building landing page congruence bridges."
---

# Compliance & Bridge Auditor

The `compliance-bridge-auditor` acts as the twin pre-flight guardrail for high-dopamine static ad campaigns:

1. **Meta Advertising Standards Pre-Flight Audit:** It audits ad copy and creative direction against Meta's strict policies regarding **Personal Attributes**, **Unrealistic Outcomes**, and **Sensational Systems**, automatically providing Safe Harbor editorial rewrites for flagged phrases.
2. **Post-Click Scent Match & Landing Page Bridge:** It eliminates post-click drop-off and high bounce rates by generating the exact H1 headline, subhead, and 3-sentence introductory narrative needed on the landing page to seamlessly bridge high-curiosity curiosity hooks into commercial VSLs and sales letters.

---

## Quick Start

Audit an ad set and generate its landing page bridge:

```bash
# Ingest copy payload and check compliance against safe harbor rules
python3 -c "
from pathlib import Path
rules = Path('references/meta_policy_rules.md').read_text()
bridges = Path('references/landing_page_bridge_templates.md').read_text()
print('Meta policy rules and landing page bridge templates loaded.')
"
```

Workflow:
1. Scan ad copy for Meta policy triggers (personal attributes, extreme claims).
2. Calculate Meta Policy Safety Score (0–100). If score < 85, apply Safe Harbor rewrites from `references/meta_policy_rules.md`.
3. Select corresponding landing page bridge template from `references/landing_page_bridge_templates.md`.
4. Produce the exact 3-sentence bridge connecting the ad's curiosity hook to the client's commercial offer.

---

## Part 1: Meta Policy Moderation vs. Tabloid Sensationalism

### The Failure Mode
Untrained copywriters use aggressive phrases like:
- ❌ *"This feels illegal"*
- ❌ *"Shocking warning: Your business is failing"*
- ❌ *"Secret hack Meta doesn't want you to know"*
- ❌ *"Lose 20 lbs in 7 days without diet"*

These trigger instant ad rejections, account flags, and high CPM penalties under:
- **Meta Policy 4.1: Personal Attributes** (Asserting or implying personal medical conditions, financial distress, or race).
- **Meta Policy 4.13: Sensational Content** (Shocking, fear-mongering, or clickbait claims).
- **Meta Policy 4.22: Unrealistic Outcomes & Misleading Claims**.
- **Meta Policy 4.29: Circumventing Systems**.

### The Safe-Harbor Translation Layer
This skill automatically reformulates raw tabloid curiosity into safe, compliant editorial, journalistic, and case-study language:

```
[Raw Tabloid Hook (Risky)]                     [Safe-Harbor Editorial Rewrite (Compliant)]
"This client hack feels illegal"         ───►  "Why industry whistleblowers are questioning this 2026 data protocol"
"Are you struggling with back pain?"     ───►  "Why 1,420 desk workers are quietly testing this 1-minute posture routine"
"Make $10,000 overnight from your room"  ───►  "The unlisted agency workflow that recovered $12,400 in unbilled hours"
"Do you have low stamina in bed?"        ───►  "African herbal botanical study reveals natural male vitality formula"
```

---

## Part 2: Scent Match & The Post-Click Bridge

### The Bounce Rate Catastrophe
The #1 reason high-dopamine, newsfeed-disrupting ads fail to generate sales is **Scent Disconnect**:
- The ad promises: *"The $14 black hardware drive that audited a 40-person agency in 8 minutes."*
- The prospect clicks and lands on: *"Welcome to FlowAudit. The world's leading enterprise SaaS for billing tracking. Book a demo today."*
- **Prospect Reaction:** *"Wait, where is the black drive? Is this a scam?"* -> **Immediate 85%+ Bounce**.

### The 3-Sentence Landing Page Bridge Architecture
To maintain dopamine continuity and conversion momentum, the landing page header must immediately confirm the curiosity hook before transitioning to the sales pitch:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [LANDING PAGE HERO SECTION]                                            │
│                                                                        │
│ Pre-Headline Ticker:                                                   │
│ [SPECIAL INVESTIGATIVE REPORT: AS SEEN IN THE 2026 AGENCY EXPOSÉ]      │
│                                                                        │
│ H1 Headline (Scent Confirmation):                                      │
│ Yes, This Is The $14 Hardware Protocol That Recovered $12,400          │
│ In Unbilled Agency Work In Under 8 Minutes...                          │
│                                                                        │
│ Subhead:                                                               │
│ Here is exactly what is inside the drive, how the background packet    │
│ audit works, and why 312 marketing agencies quietly run it weekly.     │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 3-Sentence Narrative Bridge:                                       │ │
│ │ 1. Scent Confirmation: Over the past 3 weeks, a short video showing│ │
│ │    a small black drive auditing Slack channels went viral.         │ │
│ │ 2. The Revelation: That drive contains a lightweight automation script│
│ │    designed to detect scope creep and unbilled client deliverables.│ │
│ │ 3. The Pivot: Today, we are releasing the complete FlowAudit        │ │
│ │    software suite so your team can run the exact same audit in      │ │
│ │    4 clicks—without touching a piece of hardware.                  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ [WATCH THE 4-MINUTE BREAKDOWN VIDEO]                  [TRY FREE DEMO]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Workflows

### 1. Pre-Flight Compliance Audit
1. Ingest ad headline, primary text, and image banner text.
2. Execute regex heuristic scan for taboo terms in `references/meta_policy_rules.md`.
3. Check for second-person pronoun violations in opening lines.
4. If score < 85, apply the matching Safe Harbor rewrite rule.

### 2. Scent Congruence Scoring
1. Compare ad headline with landing page H1 headline.
2. Calculate lexical and conceptual overlap (must share the unique mechanism name and specific odd metric).
3. Generate Scent Match Score (0–100). Target: $\ge 90$.

### 3. Bridge Generation
Select the corresponding archetype template from `references/landing_page_bridge_templates.md` and populate:
- Pre-Headline Ticker
- H1 Scent Confirmation Headline
- Subhead
- 3-Sentence Narrative Bridge
- Call-to-Action Transition

---

## Input Schema

```json
{
  "adHeadline": "EX-AGENCY OPS CHIEF LEAKS 4-MINUTE AUDIT SPREADSHEET",
  "bannerText": "DATA LEAK: The $14 Drive Auditing 40-Person Teams",
  "primaryText": "This client audit method feels like a cheat code. Most agency owners think profit leaks happen in payroll. They are wrong...",
  "mechanismName": "Passive Slack Packet Recon",
  "mysteryObject": "Black USB Drive with Amber LED",
  "oddNumberMetric": "$12,400.00",
  "destinationUrl": "https://flowaudit.io/protocol-leak"
}
```

---

## Output Schema

```json
{
  "complianceAudit": {
    "policySafetyScore": 92,
    "status": "APPROVED_WITH_SAFE_HARBOR",
    "flaggedPhrases": [
      {
        "phrase": "feels like a cheat code",
        "policyTrigger": "Sensational Content / Circumventing Systems",
        "safeHarborRewrite": "is causing a stir among operations directors"
      }
    ],
    "personalAttributeViolations": 0,
    "unrealisticClaimRisk": "LOW"
  },
  "landingPageBridge": {
    "targetUrl": "https://flowaudit.io/protocol-leak",
    "preHeadlineTicker": "SPECIAL INVESTIGATIVE REPORT: 2026 AGENCY AUDIT DISCOVERY",
    "h1Headline": "Yes, This Is The $14 Hardware Protocol That Recovered $12,400 In Unbilled Client Work...",
    "subhead": "Here is exactly how the background packet scan works, and how 312 agencies deployed it without writing a single line of code.",
    "openingNarrativeBridge": [
      "Over the past month, operations leads have shared reports of a simple black drive uncovering thousands in leaked billables.",
      "That hardware simply housed an automated Slack reconciliation script that matches client requests against completed invoices.",
      "Below, you will see the exact software that powers this protocol—and how to run a complete sandbox audit on your agency today."
    ],
    "scentMatchScore": 96,
    "bounceRiskAssessment": "MINIMAL (Complete Continuity Established)"
  }
}
```

---

## Evaluation Checklist

- [ ] Copy free of personal attribute callouts ("Are you...", "Do you suffer...").
- [ ] Sensational phrases translated to journalistic/editorial Safe Harbor.
- [ ] Scent Match Score $\ge 90$; landing page H1 confirms ad hook instantly.
- [ ] 3-sentence bridge follows: Confirmation ➔ Revelation ➔ Commercial Pivot.
- [ ] Destination URL verified and congruent with offer parameters.

---

## References

- [Meta Policy Rules Reference](references/meta_policy_rules.md): Complete policy breakdown, taboo word lexicon, and regex scanners.
- [Landing Page Bridge Templates](references/landing_page_bridge_templates.md): Field-tested hero bridges for all 5 core angle archetypes.
