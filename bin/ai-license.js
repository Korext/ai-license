#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const VERSION = '1.0.3';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(val) {
  if (!val) return 'Unknown';
  const d = (val instanceof Date) ? val : new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(msg) {
  if (process.stdout.isTTY) {
    console.log(msg
      .replace(/\[green\]/g, colors.green)
      .replace(/\[red\]/g, colors.red)
      .replace(/\[yellow\]/g, colors.yellow)
      .replace(/\[blue\]/g, colors.blue)
      .replace(/\[cyan\]/g, colors.cyan)
      .replace(/\[bold\]/g, colors.bold)
      .replace(/\[reset\]/g, colors.reset));
  } else {
    // Strip tags if not TTY
    console.log(msg.replace(/\[\w+\]/g, ''));
  }
}

function error(msg) {
  log(`\n[red][bold]Error:[reset] ${msg}\n`);
  process.exit(1);
}

function printHelp() {
  console.log(`
  AI License Notice CLI - v${VERSION}

  Declare AI provenance in your open source project.

  Commands:
    generate    Generate AI-LICENSE file from .ai-attestation.yaml
    validate    Check AI-LICENSE file format compliance
    update      Regenerate AI-LICENSE (shortcut for generate)
    preview     Print notice to terminal without writing a file
    append      Append notice to existing LICENSE file
    reference   Add reference line to LICENSE file pointing to AI-LICENSE

  General Options:
    --help      Show this help message
    --version   Show version number
  `);
}

function determineLevel(percentage) {
  if (percentage === 0) return 'NONE';
  if (percentage <= 25) return 'LOW';
  if (percentage <= 60) return 'MODERATE';
  if (percentage <= 99) return 'HIGH';
  return 'FULL';
}

function determineTier(governance) {
  if (!governance || !governance.engine) return 'UNGOVERNED';
  if (governance.proof_bundle_url) return 'ATTESTED';
  return 'SCANNED';
}

function readAttestation() {
  const file = path.join(process.cwd(), '.ai-attestation.yaml');
  if (!fs.existsSync(file)) {
    error('Could not find .ai-attestation.yaml in the current directory.\nPlease run "npx @korext/ai-attestation init" first.');
  }

  try {
    const raw = fs.readFileSync(file, 'utf8');
    return { data: yaml.load(raw), path: file, raw, stat: fs.statSync(file) };
  } catch (e) {
    error(`Failed to parse .ai-attestation.yaml: ${e.message}`);
  }
}

function generateNoticeText(attest) {
  const { data } = attest;
  const level = determineLevel(data.ai.percentage);
  const tier = determineTier(data.governance);
  
  let toolsText = '';
  if (data.ai.tools && data.ai.tools.length > 0) {
    toolsText = data.ai.tools.map(t => `${t.name} (${formatDate(t.first_seen)} to ${formatDate(t.last_seen)})`).join('\n');
  } else {
    toolsText = 'None declared';
  }

  let governanceText = '';
  if (data.governance && data.governance.engine) {
    governanceText = `Governance Engine: ${data.governance.engine}\nLast Scan: ${data.governance.last_scan || 'Unknown'}\nScore: ${data.governance.score !== null ? data.governance.score : 'Unknown'}/100\nVerification: ${data.governance.proof_bundle_url || 'Unknown'}`;
  } else {
    governanceText = `No automated governance scanning has been configured for this repository.`;
  }

  const owner = data.repo.owner || 'unknown';
  const name = data.repo.name || 'unknown';

  return `===============================================
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

AI ASSISTED PORTIONS: ${level} (${data.ai.percentage}%)
Assisted Commits: ${data.ai.assisted_commits}
Total Commits: ${data.range ? data.range.commits : 'Unknown'}
Percentage: ${data.ai.percentage}%

AI TOOLS USED:
${toolsText}

HUMAN REVIEW:
All AI assisted commits in this
repository were reviewed and accepted
by human developers who are the
authors of record.

GOVERNANCE:
${governanceText}

VERIFY:
The AI provenance data in this notice
can be verified against the
.ai-attestation.yaml file in the repo
root, or online at:
https://oss.korext.com/ai-attestation/report/${owner}/${name}

LEARN MORE:
https://oss.korext.com/ai-license
Specification: CC0 1.0 (public domain)

===============================================`;
}

function generateNoticeYamlObj(attest) {
  const { data } = attest;
  return {
    schema: 'https://oss.korext.com/ai-license/schema',
    version: '1.0',
    repo: data.repo,
    notice_generated: new Date().toISOString(),
    attestation_source: '.ai-attestation.yaml',
    ai_provenance: {
      assisted_commits: data.ai.assisted_commits,
      total_commits: data.range ? data.range.commits : 0,
      percentage: data.ai.percentage
    },
    tools_used: data.ai.tools || [],
    human_review: {
      reviewed: true,
      reviewers_of_record: 'developers'
    },
    governance: data.governance || {
      engine: null,
      last_scan: null,
      score: null,
      verification_url: null
    },
    verification: {
      attestation_file: '.ai-attestation.yaml',
      online_report: `https://oss.korext.com/ai-attestation/report/${data.repo.owner}/${data.repo.name}`
    },
    specification: {
      url: 'https://oss.korext.com/ai-license',
      license: 'CC0 1.0 Universal'
    }
  };
}

function cmdGenerate() {
  const attest = readAttestation();
  const text = generateNoticeText(attest);
  const yamlObj = generateNoticeYamlObj(attest);
  const yamlText = yaml.dump(yamlObj, { noRefs: true, lineWidth: -1 });

  fs.writeFileSync(path.join(process.cwd(), 'AI-LICENSE'), text);
  fs.writeFileSync(path.join(process.cwd(), 'ai-license-notice.yaml'), yamlText);

  printSummary(attest);
}

function cmdPreview() {
  const attest = readAttestation();
  const text = generateNoticeText(attest);
  console.log(text);
}

function printSummary(attest) {
  const { data } = attest;
  const level = determineLevel(data.ai.percentage);
  const tier = determineTier(data.governance);

  log(`\n  [bold][cyan]AI License Notice Generator[reset]\n`);
  log(`  Source: .ai-attestation.yaml`);
  log(`  Repository: ${data.repo.owner}/${data.repo.name}\n`);
  
  const levelColor = level === 'NONE' || level === 'LOW' ? '[green]' : (level === 'MODERATE' ? '[yellow]' : '[red]');
  log(`  AI Provenance: ${levelColor}${level} (${data.ai.percentage}%)[reset]`);
  
  const tierColor = tier === 'ATTESTED' ? '[green]' : '[yellow]';
  log(`  Governance Tier: ${tierColor}${tier}[reset]\n`);

  log(`  Tools declared:`);
  if (data.ai.tools && data.ai.tools.length > 0) {
    data.ai.tools.forEach(t => log(`    [cyan]${t.name}[reset] (${formatDate(t.first_seen)} to ${formatDate(t.last_seen)})`));
  } else {
    log(`    None`);
  }

  log(`\n  Created:`);
  log(`    [green]AI-LICENSE[reset]`);
  log(`    [green]ai-license-notice.yaml[reset]\n`);

  log(`  Next steps:`);
  log(`  1. Review the AI-LICENSE file`);
  log(`  2. Commit both files`);
  log(`  3. Optionally: link from LICENSE`);
  log(`     [cyan]npx @korext/ai-license reference[reset]\n`);

  log(`  Add badge to your README:`);
  log(`  [![AI License](https://oss.korext.com/api/ai-license-badge/${data.repo.owner}/${data.repo.name})](https://oss.korext.com/ai-license)\n`);
}

function cmdAppend() {
  const attest = readAttestation();
  const text = generateNoticeText(attest);
  
  const licenseFile = path.join(process.cwd(), 'LICENSE');
  if (!fs.existsSync(licenseFile)) {
    error('LICENSE file not found in current directory. Cannot append.');
  }

  const existing = fs.readFileSync(licenseFile, 'utf8');
  if (existing.includes('AI LICENSE NOTICE')) {
    error('AI LICENSE NOTICE already exists in LICENSE file.');
  }

  const newContent = `${existing.trim()}\n\n${text}\n`;
  fs.writeFileSync(licenseFile, newContent);
  log(`\n[green]Success:[reset] AI License Notice appended to LICENSE file.\n`);
}

function cmdReference() {
  const licenseFile = path.join(process.cwd(), 'LICENSE');
  if (!fs.existsSync(licenseFile)) {
    error('LICENSE file not found in current directory. Cannot add reference.');
  }

  const existing = fs.readFileSync(licenseFile, 'utf8');
  if (existing.includes('AI License Notice')) {
    error('AI License Notice reference already exists in LICENSE file.');
  }

  const ref = `This software is also subject to an AI License Notice. See AI-LICENSE file in the repository root for details about AI tool usage and governance.`;
  const newContent = `${existing.trim()}\n\n${ref}\n`;
  fs.writeFileSync(licenseFile, newContent);
  log(`\n[green]Success:[reset] Reference appended to LICENSE file.\n`);
}

function cmdValidate() {
  log(`\n  [bold][cyan]AI License Notice Validation[reset]\n`);
  let valid = true;

  const txtPath = path.join(process.cwd(), 'AI-LICENSE');
  const yamlPath = path.join(process.cwd(), 'ai-license-notice.yaml');
  const attestFile = path.join(process.cwd(), '.ai-attestation.yaml');

  const txtExists = fs.existsSync(txtPath);
  const yamlExists = fs.existsSync(yamlPath);

  log(`    AI-LICENSE exists: ${txtExists ? '[green]YES[reset]' : '[red]NO[reset]'}`);
  log(`    ai-license-notice.yaml exists: ${yamlExists ? '[green]YES[reset]' : '[red]NO[reset]'}`);

  if (!txtExists || !yamlExists) {
    valid = false;
  }

  let yamlData = null;
  if (yamlExists) {
    try {
      yamlData = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
      if (yamlData.schema !== 'https://oss.korext.com/ai-license/schema') throw new Error('Invalid schema');
      if (yamlData.version !== '1.0') throw new Error('Unsupported schema version');
      log(`    Schema version: 1.0 ([green]supported[reset])`);
      log(`    Required fields: [green]ALL PRESENT[reset]`);
    } catch (e) {
      valid = false;
      log(`    Schema checks: [red]FAILED (${e.message})[reset]`);
    }
  } else {
    log(`    Schema checks: [red]FAILED (missing)[reset]`);
  }

  if (yamlExists && yamlData && fs.existsSync(attestFile)) {
    const noticeStat = fs.statSync(yamlPath);
    const attestStat = fs.statSync(attestFile);
    
    const diffMs = noticeStat.mtime - attestStat.mtime;
    const diffHours = Math.abs(diffMs / (1000 * 60 * 60));
    
    if (diffMs < -1000) { // attestation modified AFTER notice (giving 1s allowance)
      log(`    Data freshness: [red]STALE[reset] (.ai-attestation.yaml was modified after notice)`);
      valid = false;
    } else {
      let ageStr = `${Math.floor(diffHours)} hours old`;
      if (diffHours < 1) {
         ageStr = `${Math.floor(Math.abs(diffMs / (1000 * 60)))} minutes old`;
      }
      log(`    Data freshness: ${ageStr}`);
    }

    try {
      const attest = readAttestation();
      if (attest.data.ai.percentage !== yamlData.ai_provenance.percentage) {
        log(`    Matches attestation: [red]NO[reset] (percentage mismatch)`);
        valid = false;
      } else {
        log(`    Matches attestation: [green]YES[reset]`);
      }
    } catch (err) {
      valid = false;
    }
  } else {
    log(`    Matches attestation: [red]SKIPPED[reset]`);
    valid = false;
  }

  log(`\n    Result: ${valid ? '[bold][green]VALID[reset]' : '[bold][red]INVALID[reset]'}\n`);
  if (!valid) {
    process.exit(1);
  }
}

function run() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  if (cmd === '--version' || cmd === '-v') {
    console.log(VERSION);
    return;
  }

  switch (cmd) {
    case 'generate':
    case 'update':
      cmdGenerate();
      break;
    case 'preview':
      cmdPreview();
      break;
    case 'append':
      cmdAppend();
      break;
    case 'reference':
      cmdReference();
      break;
    case 'validate':
      cmdValidate();
      break;
    default:
      console.log(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(1);
  }
}

run();
