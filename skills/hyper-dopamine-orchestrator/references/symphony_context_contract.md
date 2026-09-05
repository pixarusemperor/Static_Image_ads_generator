# Symphony Context Contract Reference

This document defines the input data structure received from the SYNPHONYS Campaign Hub (`/home/stevenjossu/SYNPHONYS`) by the `hyper-dopamine-orchestrator`.

---

## 1. Context Specification

Symphony acts as the strategic intelligence layer. It extracts raw founder inputs, competitor analyses, and campaign goals, packaging them into this canonical context object.

```json
{
  "campaignId": "camp_2026_saas_001",
  "brandName": "FlowAudit AI",
  "product": {
    "name": "FlowAudit Automation Suite",
    "category": "B2B SaaS / Automation",
    "description": "Enterprise workflow automation software that detects lost billing hours and unbilled API tasks in agency pipelines.",
    "coreTransformation": "Recovers $12,400+ monthly in leaked billable agency hours without adding staff",
    "pricePoint": "$299/mo",
    "riskReversal": "14-Day Free Sandbox + 100% Billable Discovery Guarantee",
    "proofPoints": [
      "$4.2M recovered for 312 marketing agencies",
      "SOC-2 Type II Certified",
      "Instant 4-minute Slack/HubSpot integration"
    ]
  },
  "avatar": {
    "role": "B2B Agency Owners & Operations Directors",
    "companySize": "10-50 team members",
    "awarenessStage": "Unaware (60% Layer)",
    "acuteFrustration": "Profit margins shrinking despite record client rosters; staff complaining of burnout while billable hours go unlogged",
    "villain": "Invisible administrative leakage & manual agency spreadsheets",
    "secretDesire": "High-margin hands-off operational clarity"
  },
  "mechanism": {
    "name": "Passive Packet Sniffing (NUEEPH)",
    "intangibleConcept": "Automated background API time reconciliation",
    "tangibleMysteryObject": "Black USB Stick with Glowing Amber LED",
    "curiosityHook": "The $14 Hardware Drive that Audited a 40-Person Agency in 8 Minutes"
  },
  "voice": {
    "tone": "Investigative, candid, insider tabloid, urgent, conversational",
    "readabilityTargetGrade": 4.5,
    "forbiddenWords": [
      "synergy", "paradigm", "cutting-edge", "revolutionary", "best-in-class"
    ]
  },
  "targetTemplates": ["1-a", "2-a", "hd-red-circle", "hd-breaking-news"],
  "delivery": {
    "renderMode": "r2",
    "destinationUrl": "https://flowaudit.io/protocol-leak"
  }
}
```

---

## 2. Validation Field Requirements

| Field | Type | Mandatory? | Description |
| :--- | :--- | :--- | :--- |
| `campaignId` | string | **Yes** | Unique identifier for run isolation and asset tracking. |
| `product.name` | string | **Yes** | Commercial product/service name. |
| `product.category` | string | **Yes** | Standard niche (B2B SaaS, Agency, Mortgage, Health, E-Com, Coaching). |
| `product.coreTransformation` | string | **Yes** | Concrete quantifiable result with odd/specific metrics. |
| `avatar.awarenessStage` | string | **Yes** | Must specify target pyramid layer (`Unaware`, `Problem-Aware`, `Solution-Aware`). |
| `avatar.acuteFrustration` | string | **Yes** | Visceral emotional symptom experienced right now. |
| `targetTemplates` | string[] | **Yes** | Array of target template IDs to render (`1-a` to `5-a`, `hd-*`). |
| `delivery.destinationUrl` | string | **Yes** | Final landing page for congruence audit and bridge generation. |
