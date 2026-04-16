const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function setOutput(key, value) {
  const outputFilePath = process.env.GITHUB_OUTPUT;
  if (outputFilePath && fs.existsSync(outputFilePath)) {
    fs.appendFileSync(outputFilePath, `${key}=${value}\n`);
  } else {
    console.log(`::set-output name=${key}::${value}`);
  }
}

function getOutput(name, defaultValue) {
  const val = process.env[`INPUT_${name.replace(/-/g, '_').toUpperCase()}`];
  return val !== undefined && val !== '' ? val : defaultValue;
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
  if (governance.proof_bundle_url || governance.verification_url) return 'ATTESTED';
  return 'SCANNED';
}

const requireNotice = getOutput('require-notice', 'true') === 'true';
const requireFreshness = getOutput('require-freshness', '90d');
const minimumTier = getOutput('minimum-tier', '');

const txtPath = path.join(process.env.GITHUB_WORKSPACE || process.cwd(), 'AI-LICENSE');
const yamlPath = path.join(process.env.GITHUB_WORKSPACE || process.cwd(), 'ai-license-notice.yaml');

if (!fs.existsSync(txtPath) || !fs.existsSync(yamlPath)) {
  if (requireNotice) {
    console.error('Error: AI-LICENSE or ai-license-notice.yaml checking failed. File missing.');
    setOutput('status', 'FAIL');
    process.exit(1);
  } else {
    console.log('Notice not required and not found. Skipping.');
    setOutput('status', 'PASS');
    process.exit(0);
  }
}

let data;
try {
  data = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
} catch (e) {
  console.error('Error parsing ai-license-notice.yaml:', e.message);
  setOutput('status', 'FAIL');
  process.exit(1);
}

const level = determineLevel(data.ai_provenance ? data.ai_provenance.percentage : 0);
const tier = determineTier(data.governance);

setOutput('ai-level', level);
setOutput('governance-tier', tier);

const lastGen = data.notice_generated ? new Date(data.notice_generated) : null;
let ageDays = 0;
if (lastGen) {
  ageDays = Math.floor((new Date() - lastGen) / (1000 * 60 * 60 * 24));
}
setOutput('notice-age-days', ageDays.toString());

if (requireFreshness) {
  const maxDays = parseInt(requireFreshness.replace('d', ''));
  if (!isNaN(maxDays) && ageDays > maxDays) {
    console.error(`Error: Notice is ${ageDays} days old, max allowed is ${maxDays} days.`);
    setOutput('status', 'FAIL');
    process.exit(1);
  }
}

const tiers = ['UNGOVERNED', 'SCANNED', 'ATTESTED'];
if (minimumTier && tiers.indexOf(tier) < tiers.indexOf(minimumTier)) {
  console.error(`Error: Minimum governance tier is ${minimumTier}, but found ${tier}.`);
  setOutput('status', 'FAIL');
  process.exit(1);
}

console.log('AI License Check passed.');
setOutput('status', 'PASS');
process.exit(0);
