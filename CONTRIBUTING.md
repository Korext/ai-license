# Contributing

We welcome contributions to the AI
License Notice specification and
tooling.

## Improving the Specification

The AI License Notice specification
(SPEC.md) is released under CC0
public domain. Proposed changes to
the specification require:

1. Open an issue describing the
   proposed change and rationale
2. Submit a PR with the proposed
   text
3. Allow 14 day comment period for
   community feedback
4. Maintainer approval

## Adding License Templates

Template files in templates/ cover
common scenarios (NO-AI, AI-ASSISTED,
FULLY-AI, GOVERNED). To add a new
template:

1. Identify a scenario not covered
   by existing templates
2. Write the template following the
   notice format in SPEC.md
3. Submit a PR with the new template
   and a description of the scenario

## Improving the CLI

The CLI (bin/ai-license.js) uses
Node.js built-ins and js-yaml only.
No additional dependencies.

To add a command or fix a bug:

1. Fork the repository
2. Make changes to bin/ai-license.js
3. Test all commands: generate,
   validate, update, preview, append,
   reference
4. Submit a PR

## Reporting Issues

Open an issue on GitHub for:

  Incorrect notice generation
  Schema validation problems
  Compatibility issues with
  specific licenses
  Documentation improvements

## Pull Request Process

1. Fork and branch from main
2. Make changes
3. Test locally
4. Submit PR with description
5. Wait for review
