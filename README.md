# AI License Notice

Declare AI provenance in any open source project.

[![License: Code](https://img.shields.io/badge/code-Apache%202.0-blue)](LICENSE)
[![License: Spec](https://img.shields.io/badge/spec-CC0%201.0-green)](LICENSE-SPEC)
[![npm](https://img.shields.io/npm/v/@korext/ai-license)](https://www.npmjs.com/package/@korext/ai-license)

Open source licenses were designed when all code was human written. When AI tools assist or generate code, downstream consumers have no way to know what portions are AI assisted, which tools were used, or whether the code was governed.

The AI License Notice changes that.

## What This Is

A standardized text notice that declares the AI provenance of source code. It attaches to any existing license (MIT, Apache 2.0, GPL, etc.) as an addendum.

It does not grant or restrict any rights. It does not replace your existing license. It provides transparency.

## Quick Start

```bash
# Track AI usage in your repo
npx @korext/ai-attestation init

# Generate the notice
npx @korext/ai-license generate

# Reference from your LICENSE
npx @korext/ai-license reference
```

That is it. Three commands. Your repo now declares its AI provenance.

## What It Looks Like

```
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

AI ASSISTED PORTIONS: MODERATE (35.1%)
Assisted Commits: 438
Total Commits: 1247
Percentage: 35.1%

AI TOOLS USED:
  GitHub Copilot (Sep 2025 to Apr 2026)
  Cursor (Jan 2026 to Apr 2026)

HUMAN REVIEW:
All AI assisted commits in this
repository were reviewed and accepted
by human developers who are the
authors of record.

GOVERNANCE:
Governance Engine: KOREXT
Last Scan: 2026-04-15T11:45:00Z
Score: 94/100
Verification: https://app.korext.com/verify/kpb_abc123

VERIFY:
The AI provenance data in this notice
can be verified against the
.ai-attestation.yaml file in the repo
root, or online at:
https://oss.korext.com/ai-attestation/report/OWNER/REPO

LEARN MORE:
https://oss.korext.com/ai-license
Specification: CC0 1.0 (public domain)

===============================================
```

## Five AI Provenance Levels

| Level | Percentage | Meaning |
|-------|-----------|---------|
| NONE | 0% | No AI was used |
| LOW | 1-25% | Minimal AI involvement |
| MODERATE | 26-60% | Significant AI involvement |
| HIGH | 61-99% | Majority AI generated |
| FULL | 100% | Entirely AI generated |

## Three Governance Tiers

| Tier | Meaning |
|------|---------|
| UNGOVERNED | No automated governance scanning |
| SCANNED | Recent governance scan result available |
| ATTESTED | Cryptographically signed governance attestation |

ATTESTED is the gold standard. It requires a governance engine that produces signed proof bundles. [KOREXT](https://korext.com) is an example of such an engine.

## Commands

| Command | Description |
|---------|-------------|
| `generate` | Generate AI-LICENSE from attestation data |
| `validate` | Check notice format compliance |
| `update` | Regenerate notice (same as generate) |
| `preview` | Print notice without writing file |
| `append` | Append notice to existing LICENSE |
| `reference` | Add reference to existing LICENSE |

## CI CD Integration

```yaml
- uses: Korext/ai-license/action@v1
  with:
    require-notice: true
    require-freshness: 90d
    minimum-tier: SCANNED
```

## Why Not a New License

Creating a new AI license would:

- Add legal complexity for adopters
- Require legal review for every project
- Fragment the open source license ecosystem
- Take years of committee review to stabilize

The notice approach avoids all of this. Any project can add the notice to any existing license in minutes.

## Compatibility

The AI License Notice is compatible with every open source license:

- MIT, Apache 2.0, GPL (all versions)
- BSD (2 clause, 3 clause, 4 clause)
- MPL, ISC, AGPL, LGPL
- Unlicense, CC0
- Proprietary and commercial licenses

The notice is informational. It does not interact with license terms.

## Privacy

The AI License Notice declares AI tool usage in your code. It does not declare:

- Individual developer names
- Specific commit hashes
- Prompts or conversations with AI tools
- Code itself

Only aggregate statistics and tool names are declared.

## Specification

See [SPEC.md](SPEC.md) for the complete specification.

The specification and notice template are released under [CC0 1.0 Universal](LICENSE-SPEC) (public domain). Copy them. Fork them. Build on them. No attribution needed.

The CLI and tools are licensed under [Apache 2.0](LICENSE).

## Prior Art

See [PRIOR_ART.md](PRIOR_ART.md) for discussion of related standards and how this specification differs from existing work.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Legal

This specification is informational. It does not constitute legal advice. The AI License Notice is a transparency mechanism, not a legal instrument. Consult your legal counsel for licensing decisions.

## Built by

[Korext](https://korext.com) builds AI code governance tools. The AI License Notice is an open standard maintained by the Korext team.
