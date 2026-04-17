# AI License Notice Specification

Version 1.0
Released under CC0 1.0 Universal (public domain).

## What This Is

The AI License Notice is a standardized text addendum that declares the AI provenance of source code in a software project. It attaches to any existing license (MIT, Apache 2.0, GPL, etc.) and provides transparent information about which portions of the code were written with AI assistance.

## What This Is Not

This specification does not grant or restrict any rights. It does not replace any existing license. It does not constitute legal advice. The AI License Notice is a transparency mechanism, not a legal instrument.

Consult your legal counsel for licensing decisions.

## Why This Exists

Current open source licenses were designed when all code was human written. When AI tools assist or generate code, downstream consumers have no way to know:

- What percentage of the code was AI assisted
- Which AI tools were used
- Whether the code was governed by any compliance engine
- Where to verify this information

The AI License Notice makes this information explicit and machine readable.

## Usage Options

Projects can integrate the AI License Notice using one of the following methods. Option 1 is recommended for new projects. Option 3 is recommended for projects that cannot modify their existing LICENSE.

### Option 1: Separate File

Include two separate files in the repository root:
- `AI-LICENSE` (the text notice)
- `ai-license-notice.yaml` (the machine readable data)

### Option 2: Appended to Existing LICENSE

The default repository `LICENSE` file gets an "AI LICENSE NOTICE" section appended below the existing license text. The original license text must be preserved.

### Option 3: Referenced in LICENSE

The `LICENSE` file ends with the following paragraph:

"This software is also subject to an AI License Notice. See AI-LICENSE file in the repository root for details about AI tool usage and governance."

## AI Provenance Levels

The notice must include one of the following provenance levels based on the percentage of AI assisted code:

- **NONE (0% AI assisted):** The notice is optional but can be included to explicitly declare that no AI was used.
- **LOW (1-25% AI assisted):** Minimal AI involvement. Most code is human written.
- **MODERATE (26-60% AI assisted):** Significant AI involvement. Human review is critical.
- **HIGH (61-99% AI assisted):** Majority AI generated. Downstream consumers should evaluate governance scanning.
- **FULL (100% AI assisted):** Entirely AI generated. Human role is prompt engineering and review only.

## Governance Tiers

The notice must include one of the following governance tiers to indicate compliance scanning:

- **UNGOVERNED:** No governance engine configured. No automated scanning has been performed. Downstream risk is unknown.
- **SCANNED:** A governance engine is configured and a recent scan result is available. Downstream risk is documented.
- **ATTESTED:** A governance engine is configured. A signed proof bundle with cryptographic verification exists. Downstream risk is independently verifiable.

## Notice Format

The canonical text notice must follow this format precisely:

===============================================
AI LICENSE NOTICE (Version 1.0)
===============================================

This software contains code that was
written with assistance from AI tools.
This notice declares the AI provenance
of the code. It does not grant or
restrict any rights. The primary
software license (shown above or
in a separate LICENSE file) governs
all use of this software.

AI ASSISTED PORTIONS: {LEVEL} ({percentage}%)
Assisted Commits: {assisted_commits}
Total Commits: {total_commits}
Percentage: {percentage}%

AI TOOLS USED:
{for each tool: name, first_seen, last_seen}

HUMAN REVIEW:
All AI assisted commits in this
repository were reviewed and accepted
by human developers who are the
authors of record.

GOVERNANCE:
Governance Engine: {engine}
Last Scan: {last_scan}
Score: {score}/100
Verification: {proof_bundle_url}

VERIFY:
The AI provenance data in this notice
can be verified against the
.ai-attestation.yaml file in the repo
root, or online at:
https://oss.korext.com/ai-attestation/report/{owner}/{repo}

LEARN MORE:
https://oss.korext.com/ai-license
Specification: CC0 1.0 (public domain)

===============================================

(If governance is null, replace the GOVERNANCE section with: "No automated governance scanning has been configured for this repository.")

## Machine Readable Format

Projects should also include the `ai-license-notice.yaml` file to ensure the data is parseable by tools.

```yaml
schema: https://oss.korext.com/ai-license/schema
version: "1.0"
repo:
  owner: owner
  name: repo
notice_generated: "DATE"
attestation_source: .ai-attestation.yaml
ai_provenance:
  assisted_commits: 0
  total_commits: 0
  percentage: 0
tools_used: []
human_review:
  reviewed: true
  reviewers_of_record: developers
governance:
  engine: null
  last_scan: null
  score: null
  verification_url: null
verification:
  attestation_file: .ai-attestation.yaml
  online_report: https://oss.korext.com/ai-attestation/report/owner/repo
specification:
  url: https://oss.korext.com/ai-license
  license: CC0 1.0 Universal
```
