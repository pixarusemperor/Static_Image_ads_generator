# Meta Policy Rules & Safe Harbor Translation Reference

This reference provides the compliance rule set for Meta advertising. It covers forbidden terms, risky triggers, and the **Safe Harbor Translation Matrix** to convert high-dopamine curiosity into policy-approved editorial creative.

---

## 1. Core Meta Policy Breakdown

### Policy 4.1: Personal Attributes
- **The Rule:** Ads must not contain content that asserts or implies personal attributes, including medical conditions, financial status, criminal history, or physical flaws.
- **Taboo Patterns:**
  - *"Are you in debt?"*
  - *"Are you struggling to get clients?"*
  - *"Do you suffer from erectile dysfunction?"*
  - *"Are you depressed or burned out?"*
- **Safe Harbor Remedy:** Shift to third-person case studies, external reports, or general demographic observations (*"Why agency owners are tracking...", "New botanical research on male stamina..."*).

### Policy 4.13: Sensational Content
- **The Rule:** Ads must not use shocking, sensational, or exaggerated language to induce clicks.
- **Taboo Patterns:**
  - *"This feels illegal"*
  - *"Shocking secret they are hiding from you"*
  - *"Banned by Big Tech"*
  - *"Government loophole exposed"*
- **Safe Harbor Remedy:** Frame as professional whistleblowers, contrarian industry research, or unlisted protocols (*"Why industry whistleblowers are questioning this protocol"*).

### Policy 4.22: Unrealistic Claims & Guarantees
- **The Rule:** Ads must not promise guaranteed overnight wealth, instant effortless weight loss, or unrealistic timeframes.
- **Taboo Patterns:**
  - *"Make $10,000 in 24 hours guaranteed"*
  - *"Lose 30 lbs in 1 week without exercise"*
  - *"100% cure for cancer/diabetes"*
- **Safe Harbor Remedy:** Anchor to exact empirical odd numbers from verified case studies (*"How one 40-person agency audited $12,400.00 in unbilled hours"*).

---

## 2. Safe Harbor Rewrite Matrix

| Raw High-Dopamine Hook (High Risk) | Safe Harbor Editorial Translation (Approved) | Underlying Policy Protected |
| :--- | :--- | :--- |
| *"This feels illegal"* | *"Why industry whistleblowers are questioning this 2026 data protocol"* | Sensationalism & Circumventing Systems |
| *"Stop being broke in 2026"* | *"Why agency owners are quietly restructuring unbilled client hours"* | Personal Attributes (Financial Status) |
| *"Are you struggling with erectile dysfunction?"* | *"Comment cette plante africaine a sauvé plus de 10.000 couples"* | Personal Attributes (Health / Sexual Wellness) |
| *"The secret hack Meta doesn't want you to know"* | *"The unlisted broad-targeting protocol outperforming legacy media buying"* | Circumventing Systems / Trade Disparagement |
| *"Lose 20 lbs in 14 days without diet"* | *"The bizarre 1-minute morning ritual tested by 1,420 desk workers"* | Unrealistic Claims (Diet / Health) |
| *"Banks are scamming you on your mortgage"* | *"Homeowners alarmed: New audit uncovers obsolete 2024 bank fee"* | Sensationalism & Slander |
| *"Your agency is dying and you don't even know it"* | *"Why top agencies are quietly retiring manual spreadsheets before 2026"* | Negative Perception / Fear-Mongering |
| *"Make $50,000 this month with AI"* | *"The 4-minute Slack automation that recovered $12,400 in agency deliverable time"* | Unrealistic Income Claims |
| *"Are you exhausted and burned out from work?"* | *"Why veteran executives do this 1 ritual before entering the family home"* | Personal Attributes (Mental Health / Stress) |
| *"Guaranteed 100 leads or you don't pay"* | *"The acquisition protocol that added 90 to 480 qualified accounts in 8 weeks"* | Deceptive Business Practices |

---

## 3. Compliance Automated Scanning Regex Patterns

The following regular expression patterns detect high-risk triggers during pre-flight audits:

```javascript
// 1. Personal Attribute Inquiries in Opening Lines
const personalAttributeRegex = /\b(are you|do you have|do you suffer|if you are|your debt|your illness|your weight)\b/i;

// 2. Taboo Sensational Terms
const sensationalRegex = /\b(feels illegal|banned hack|secret trick|magic pill|cure for|conspiracy|shocking warning|loophole they hide)\b/i;

// 3. Unrealistic Speed / Guarantee Claims
const unrealisticClaimRegex = /\b(overnight|guaranteed cash|in 24 hours|get rich|100% cure|effortless millions)\b/i;

// 4. Second-Person Opening Violations (Lines 1-3)
const secondPersonOpeningRegex = /\b(you|your|yours|you're|you've|yourself)\b/i;
```
