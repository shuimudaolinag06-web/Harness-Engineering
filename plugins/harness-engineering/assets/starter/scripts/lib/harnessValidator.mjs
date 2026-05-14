import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const REQUIRED_MARKDOWN_SECTIONS = ['## Purpose', '## Quality Gates'];
const REQUIRED_REVIEW_SECTIONS = ['## Verdict', '## Findings', '## Next Action'];
const REQUIRED_CONSTITUTION_PATH = '.harness/constitution.md';
const REQUIRED_SPEC_SECTIONS = [
  '## Goal',
  '## Scope',
  '## Out Of Scope',
  '## Constraints',
  '## Acceptance Criteria',
  '## Open Questions'
];
const STANDARD_GATE_PROFILE_IDS = [
  'full-audit',
  'balanced-enterprise',
  'fast-iteration',
  'government-enterprise-prototype-first',
  'risk-adaptive',
  'tdd-execution'
];
const STANDARD_EXTENSION_STAGE_IDS = [
  'lightweight-entry-governance',
  'government-enterprise-prototype',
  'implementation-readiness',
  'frontend-special-review',
  'e2e-integration-gate',
  'acceptance-audit',
  'sdd-change-governance',
  'tdd-execution-quality'
];
const STANDARD_RISK_RULE_IDS = [
  'money-or-financial-calculation',
  'state-machine-transition',
  'security-or-permission-boundary',
  'database-or-data-migration',
  'public-api-contract',
  'deployment-runtime-change',
  'government-enterprise-acceptance',
  'low-risk-documentation-or-template'
];
const GOVERNANCE_TEMPLATE_PATHS = [
  '.harness/templates/change/risk/lightweight-entry-decision.md',
  '.harness/templates/change/request_analysis/context-pack.md',
  '.harness/templates/change/request_analysis/proposal.md',
  '.harness/templates/change/design/plan.md',
  '.harness/templates/change/acceptance/process-trim-audit.md',
  '.harness/templates/change/acceptance/archive.md',
  '.harness/templates/change/implementation/tdd-cycle-log.md',
  '.harness/templates/change/implementation/task-execution-plan.md',
  '.harness/templates/change/implementation/review/spec-compliance-review.md',
  '.harness/templates/change/implementation/review/code-quality-review.md'
];
const GOVERNANCE_REQUIRED_CHANGE_FILES = [
  'risk/gate-profile-selection.md',
  'request_analysis/context-pack.md',
  'request_analysis/proposal.md',
  'design/plan.md'
];
const HIGH_RISK_EXECUTION_FILES = [
  'implementation/tdd-cycle-log.md',
  'implementation/task-execution-plan.md',
  'implementation/review/spec-compliance-review.md',
  'implementation/review/code-quality-review.md'
];
const HIGH_RISK_IMPLEMENTATION_TAGS = new Set([
  'money',
  'financial-calculation',
  'state-machine',
  'status-transition',
  'security',
  'permission',
  'permission-boundary',
  'authorization',
  'database',
  'data-migration',
  'schema',
  'public-api',
  'openapi',
  'contract',
  'deployment',
  'runtime',
  'infrastructure'
]);
const TDD_EXEMPT_RISK_TAGS = new Set([
  'documentation',
  'template-only',
  'process-copy',
  'dry-run'
]);
const KNOWN_EXECUTABLE_COMMANDS = new Set([
  'npm.cmd test',
  'npm.cmd run validate',
  'npm.cmd run verify',
  'npm.cmd run verify:all',
  'npm.cmd run verify:backend',
  'npm.cmd run verify:frontend',
  'npm.cmd run verify:e2e',
  'npm.cmd run validate:harness'
]);

export async function validateHarness(rootDir = process.cwd()) {
  const errors = [];
  const warnings = [];
  const manifestPath = path.join(rootDir, '.harness/config/harness-manifest.json');

  const manifest = await readJson(manifestPath, errors);
  if (!manifest) {
    return { ok: false, errors, warnings };
  }

  await validateReferencedPaths(rootDir, manifest, errors);
  await validateConstitutionReference(rootDir, manifest, errors);
  await validateMarkdownSections(rootDir, manifest.rules ?? [], REQUIRED_MARKDOWN_SECTIONS, errors);
  await validateSkills(rootDir, manifest.skills ?? [], errors);

  const pipeline = await readJson(path.join(rootDir, manifest.pipeline ?? ''), errors);
  if (pipeline) {
    validatePipeline(pipeline, errors);
  }

  await validateChangeTemplates(rootDir, manifest.templates ?? [], errors);
  await validateChanges(rootDir, manifest.changeRoot, errors, warnings);

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

export function validatePipeline(pipeline, errors = []) {
  if (!Array.isArray(pipeline.phases)) {
    errors.push('pipeline.phases must be an array.');
    return errors;
  }

  if (pipeline.phases.length !== 10) {
    errors.push(`pipeline must contain exactly 10 phases, found ${pipeline.phases.length}.`);
  }

  const names = new Set();
  pipeline.phases.forEach((phase, index) => {
    const expectedId = index + 1;
    if (phase.id !== expectedId) {
      errors.push(`pipeline phase at index ${index} must have id ${expectedId}.`);
    }

    if (!phase.name || names.has(phase.name)) {
      errors.push(`pipeline phase ${expectedId} must have a unique name.`);
    }
    names.add(phase.name);

    for (const field of ['entryCriteria', 'skills', 'artifacts', 'qualityGates']) {
      if (!Array.isArray(phase[field]) || phase[field].length === 0) {
        errors.push(`phase ${expectedId} (${phase.name ?? 'unnamed'}) requires non-empty ${field}.`);
      }
    }

    if (!phase.rollback || typeof phase.rollback !== 'string') {
      errors.push(`phase ${expectedId} (${phase.name ?? 'unnamed'}) requires rollback guidance.`);
    }
  });

  const checkpoints = pipeline.humanCheckpoints;
  if (!Array.isArray(checkpoints) || checkpoints.length < 5) {
    errors.push('pipeline must define at least 5 human checkpoints.');
  }

  const extensionStageIds = validateExtensionStages(pipeline.extensionStages, errors, pipeline.phases.length);
  const allowedStageIds = new Set([...names, ...extensionStageIds]);
  const gateProfileIds = validateGateProfiles(pipeline.gateProfiles, errors, allowedStageIds);
  validateRiskRules(pipeline.riskRules, errors, {
    extensionStageIds,
    gateProfileIds,
    phaseNames: names
  });

  return errors;
}

function validateExtensionStages(extensionStages, errors, phaseCount) {
  const ids = new Set();
  if (extensionStages === undefined) {
    return ids;
  }

  if (!Array.isArray(extensionStages)) {
    errors.push('pipeline.extensionStages must be an array when provided.');
    return ids;
  }

  extensionStages.forEach((stage, index) => {
    const label = `extension stage at index ${index}`;
    if (!stage.id || ids.has(stage.id)) {
      errors.push(`${label} must have a unique id.`);
    } else {
      ids.add(stage.id);
    }

    if (!stage.name) {
      errors.push(`${label} requires a name.`);
    }

    if (!stage.trigger || typeof stage.trigger !== 'string') {
      errors.push(`${label} requires trigger guidance.`);
    }

    for (const field of ['compatiblePhases', 'artifacts', 'qualityGates']) {
      if (!Array.isArray(stage[field]) || stage[field].length === 0) {
        errors.push(`${label} requires non-empty ${field}.`);
      }
    }

    if (Array.isArray(stage.compatiblePhases)) {
      const phaseIds = new Set();
      for (const phaseId of stage.compatiblePhases) {
        if (!Number.isInteger(phaseId) || phaseId < 1 || phaseId > phaseCount) {
          errors.push(`${label} compatiblePhases must contain phase ids from 1 to ${phaseCount}.`);
        }
        if (phaseIds.has(phaseId)) {
          errors.push(`${label} compatiblePhases must not contain duplicate phase ids.`);
        }
        phaseIds.add(phaseId);
      }
    }
  });

  for (const stageId of STANDARD_EXTENSION_STAGE_IDS) {
    if (!ids.has(stageId)) {
      errors.push(`pipeline.extensionStages must include standard extension stage ${stageId}.`);
    }
  }

  return ids;
}

function validateGateProfiles(gateProfiles, errors, allowedStageIds = new Set()) {
  const ids = new Set();
  if (gateProfiles === undefined) {
    return ids;
  }

  if (!Array.isArray(gateProfiles)) {
    errors.push('pipeline.gateProfiles must be an array when provided.');
    return ids;
  }

  gateProfiles.forEach((profile, index) => {
    const label = `gate profile at index ${index}`;
    if (!profile.id || ids.has(profile.id)) {
      errors.push(`${label} must have a unique id.`);
    } else {
      ids.add(profile.id);
    }

    if (!profile.name) {
      errors.push(`${label} requires a name.`);
    }

    if (!profile.costEstimate || typeof profile.costEstimate !== 'string') {
      errors.push(`${label} requires a costEstimate.`);
    }

    for (const field of [
      'useCases',
      'notUseCases',
      'requiredCommands',
      'minimumCommands',
      'recommendedCommands',
      'requiredEvidence',
      'nonSkippableStages',
      'qualityGates'
    ]) {
      if (!Array.isArray(profile[field]) || profile[field].length === 0) {
        errors.push(`${label} requires non-empty ${field}.`);
      }
    }

    if (Array.isArray(profile.requiredCommands)) {
      validateCommandList(profile.requiredCommands, `${label}.requiredCommands`, errors);
    }

    if (Array.isArray(profile.minimumCommands)) {
      validateCommandList(profile.minimumCommands, `${label}.minimumCommands`, errors);
    }

    if (Array.isArray(profile.recommendedCommands)) {
      validateCommandList(profile.recommendedCommands, `${label}.recommendedCommands`, errors);
    }

    if (Array.isArray(profile.requiredEvidence)) {
      validateStringList(profile.requiredEvidence, `${label}.requiredEvidence`, errors);
    }

    if (profile.combinableStages === undefined) {
      errors.push(`${label} requires combinableStages.`);
    } else if (!Array.isArray(profile.combinableStages)) {
      errors.push(`${label}.combinableStages must be an array.`);
    } else {
      validateStageReferenceList(profile.combinableStages, `${label}.combinableStages`, allowedStageIds, errors);
    }

    if (Array.isArray(profile.nonSkippableStages)) {
      validateStageReferenceList(profile.nonSkippableStages, `${label}.nonSkippableStages`, allowedStageIds, errors);
    }

    if (Array.isArray(profile.requiredCommands) && Array.isArray(profile.minimumCommands)) {
      const requiredCommands = new Set(profile.requiredCommands);
      for (const command of profile.minimumCommands) {
        if (!requiredCommands.has(command)) {
          errors.push(`${label}.minimumCommands must be included in requiredCommands.`);
        }
      }
    }
  });

  for (const profileId of STANDARD_GATE_PROFILE_IDS) {
    if (!ids.has(profileId)) {
      errors.push(`pipeline.gateProfiles must include standard profile ${profileId}.`);
    }
  }

  return ids;
}

function validateRiskRules(riskRules, errors, context) {
  const { extensionStageIds, gateProfileIds, phaseNames } = context;
  if (riskRules === undefined) {
    if (gateProfileIds.has('risk-adaptive')) {
      errors.push('pipeline.riskRules is required when risk-adaptive gate profile is present.');
    }
    return;
  }

  if (!Array.isArray(riskRules)) {
    errors.push('pipeline.riskRules must be an array when provided.');
    return;
  }

  const ids = new Set();
  const allowedReviewIds = new Set([...phaseNames, ...extensionStageIds]);
  riskRules.forEach((rule, index) => {
    const label = `risk rule at index ${index}`;
    if (!rule.id || ids.has(rule.id)) {
      errors.push(`${label} must have a unique id.`);
    } else {
      ids.add(rule.id);
    }

    for (const field of ['riskTags', 'minimumCommands', 'qualityGates']) {
      if (!Array.isArray(rule[field]) || rule[field].length === 0) {
        errors.push(`${label} requires non-empty ${field}.`);
      }
    }

    if (Array.isArray(rule.minimumCommands)) {
      validateCommandList(rule.minimumCommands, `${label}.minimumCommands`, errors);
    }

    for (const field of ['allowedProfiles', 'disallowedProfiles']) {
      if (rule[field] === undefined) {
        continue;
      }
      if (!Array.isArray(rule[field])) {
        errors.push(`${label}.${field} must be an array when provided.`);
        continue;
      }
      for (const profileId of rule[field]) {
        if (!gateProfileIds.has(profileId)) {
          errors.push(`${label}.${field} references unknown gate profile ${profileId}.`);
        }
      }
    }

    if (Array.isArray(rule.allowedProfiles) && Array.isArray(rule.disallowedProfiles)) {
      const allowedProfiles = new Set(rule.allowedProfiles);
      for (const profileId of rule.disallowedProfiles) {
        if (allowedProfiles.has(profileId)) {
          errors.push(`${label} cannot both allow and disallow gate profile ${profileId}.`);
        }
      }
    }

    if (rule.requiredExtensionStages !== undefined) {
      if (!Array.isArray(rule.requiredExtensionStages)) {
        errors.push(`${label}.requiredExtensionStages must be an array when provided.`);
      } else {
        for (const stageId of rule.requiredExtensionStages) {
          if (!extensionStageIds.has(stageId)) {
            errors.push(`${label}.requiredExtensionStages references unknown extension stage ${stageId}.`);
          }
        }
      }
    }

    if (rule.requiredReviews !== undefined) {
      if (!Array.isArray(rule.requiredReviews)) {
        errors.push(`${label}.requiredReviews must be an array when provided.`);
      } else {
        for (const reviewId of rule.requiredReviews) {
          if (!allowedReviewIds.has(reviewId)) {
            errors.push(`${label}.requiredReviews references unknown phase or extension stage ${reviewId}.`);
          }
        }
      }
    }

    const riskTags = new Set(Array.isArray(rule.riskTags) ? rule.riskTags.map(normalizeRiskTag) : []);
    const isTddExempt = intersects(riskTags, TDD_EXEMPT_RISK_TAGS);
    const isHighRiskImplementation = intersects(riskTags, HIGH_RISK_IMPLEMENTATION_TAGS);

    if (isHighRiskImplementation && !isTddExempt) {
      if (!Array.isArray(rule.disallowedProfiles) || !rule.disallowedProfiles.includes('fast-iteration')) {
        errors.push(`${label} matches high-risk implementation tags and must disallow fast-iteration.`);
      }
      if (!Array.isArray(rule.requiredExtensionStages) || !rule.requiredExtensionStages.includes('tdd-execution-quality')) {
        errors.push(`${label} matches high-risk implementation tags and must require tdd-execution-quality or equivalent evidence.`);
      }
      if (!Array.isArray(rule.minimumCommands) || !rule.minimumCommands.includes('npm.cmd run verify')) {
        errors.push(`${label} matches high-risk implementation tags and must require npm.cmd run verify as a minimum command.`);
      }
      if (Array.isArray(rule.allowedProfiles) && rule.allowedProfiles.includes('fast-iteration')) {
        errors.push(`${label} matches high-risk implementation tags and must not allow fast-iteration.`);
      }
    }

    if (isTddExempt && Array.isArray(rule.requiredExtensionStages) && rule.requiredExtensionStages.includes('tdd-execution-quality')) {
      errors.push(`${label} is documentation/template/process/dry-run exempt and must not require tdd-execution-quality.`);
    }
  });

  for (const ruleId of STANDARD_RISK_RULE_IDS) {
    if (!ids.has(ruleId)) {
      errors.push(`pipeline.riskRules must include standard rule ${ruleId}.`);
    }
  }
}

function validateCommandList(commands, label, errors) {
  const seen = new Set();
  for (const command of commands) {
    if (typeof command !== 'string' || command.trim() === '') {
      errors.push(`${label} must contain only non-empty strings.`);
      continue;
    }
    if (seen.has(command)) {
      errors.push(`${label} must not contain duplicate command ${command}.`);
    }
    seen.add(command);
    if (!KNOWN_EXECUTABLE_COMMANDS.has(command) && !command.startsWith('project:')) {
      errors.push(`${label} contains unknown command ${command}; use a known npm.cmd command or prefix project-specific commands with project:.`);
    }
  }
}

function validateStringList(values, label, errors) {
  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${label} must contain only non-empty strings.`);
      continue;
    }
    if (seen.has(value)) {
      errors.push(`${label} must not contain duplicate value ${value}.`);
    }
    seen.add(value);
  }
}

function validateStageReferenceList(values, label, allowedStageIds, errors) {
  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${label} must contain only non-empty strings.`);
      continue;
    }
    if (seen.has(value)) {
      errors.push(`${label} must not contain duplicate stage ${value}.`);
    }
    seen.add(value);
    if (!allowedStageIds.has(value)) {
      errors.push(`${label} references unknown phase or extension stage ${value}.`);
    }
  }
}

export function validateCiResult(ciResult, source = 'ci-result.json', errors = []) {
  if (ciResult.status !== 'SUCCESS') {
    errors.push(`${source}: status must be SUCCESS.`);
  }

  if (!Number.isInteger(ciResult.totalTests) || ciResult.totalTests <= 0) {
    errors.push(`${source}: totalTests must be a positive integer.`);
  }

  if (ciResult.passedTests !== ciResult.totalTests) {
    errors.push(`${source}: passedTests must equal totalTests.`);
  }

  if (ciResult.failedTests !== 0) {
    errors.push(`${source}: failedTests must be 0.`);
  }

  return errors;
}

async function validateReferencedPaths(rootDir, manifest, errors) {
  const groups = [
    ['ownerAgent', [manifest.ownerAgent]],
    ['rules', manifest.rules],
    ['skills', manifest.skills],
    ['wiki', manifest.wiki],
    ['templates', manifest.templates],
    ['pipeline', [manifest.pipeline]]
  ];

  for (const [field, paths] of groups) {
    if (!Array.isArray(paths) || paths.some((item) => !item)) {
      errors.push(`manifest.${field} must reference at least one path.`);
      continue;
    }

    for (const relativePath of paths) {
      await ensureFile(path.join(rootDir, relativePath), `${field}: ${relativePath}`, errors);
    }
  }

  if (manifest.changeRoot) {
    await ensureDirectory(path.join(rootDir, manifest.changeRoot), `changeRoot: ${manifest.changeRoot}`, errors);
  } else {
    errors.push('manifest.changeRoot is required.');
  }
}

async function validateConstitutionReference(rootDir, manifest, errors) {
  await ensureFile(
    path.join(rootDir, REQUIRED_CONSTITUTION_PATH),
    `constitution: ${REQUIRED_CONSTITUTION_PATH}`,
    errors
  );

  const manifestReferencesConstitution = objectContainsString(manifest, REQUIRED_CONSTITUTION_PATH);
  const docsReferenceConstitution = await docsContainConstitutionReference(rootDir);

  if (!manifestReferencesConstitution && !docsReferenceConstitution) {
    errors.push(`${REQUIRED_CONSTITUTION_PATH} must be referenced by harness-manifest.json or docs.`);
  }
}

async function validateMarkdownSections(rootDir, files, sections, errors) {
  for (const relativePath of files) {
    const content = await readText(path.join(rootDir, relativePath), errors);
    if (!content) {
      continue;
    }

    for (const section of sections) {
      if (!content.includes(section)) {
        errors.push(`${relativePath} is missing section ${section}.`);
      }
    }
  }
}

async function validateSkills(rootDir, skillFiles, errors) {
  const required = ['## Purpose', '## Inputs', '## Procedure', '## Outputs', '## Quality Gates'];
  await validateMarkdownSections(rootDir, skillFiles, required, errors);
}

async function validateChangeTemplates(rootDir, templates, errors) {
  const requiredTemplates = [
    '.harness/templates/change/summary.md',
    '.harness/templates/change/request_analysis/spec.md',
    '.harness/templates/change/request_analysis/tasks.md',
    '.harness/templates/change/review/review.md',
    '.harness/templates/change/verification/ci-result.json',
    '.harness/templates/change/verification/deploy-result.json'
  ];

  requiredTemplates.push(...GOVERNANCE_TEMPLATE_PATHS);

  for (const template of requiredTemplates) {
    if (!templates.includes(template)) {
      errors.push(`manifest.templates must include ${template}.`);
    }
    await ensureFile(path.join(rootDir, template), `template: ${template}`, errors);
  }
}

async function validateChanges(rootDir, changeRoot, errors, warnings) {
  if (!changeRoot) {
    return;
  }

  const absoluteChangeRoot = path.join(rootDir, changeRoot);
  const entries = await safeReadDir(absoluteChangeRoot, errors);
  if (!entries) {
    return;
  }

  const directories = [];
  for (const entry of entries) {
    const fullPath = path.join(absoluteChangeRoot, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) {
      directories.push(entry);
    }
  }

  if (directories.length === 0) {
    warnings.push('No change directories found. Run a dry run before first product adoption.');
    return;
  }

  for (const directory of directories) {
    await validateChangeDirectory(rootDir, path.join(changeRoot, directory), errors);
  }
}

async function validateChangeDirectory(rootDir, changePath, errors) {
  const requiredFiles = [
    'summary.md',
    'request_analysis/spec.md',
    'request_analysis/tasks.md',
    'verification/ci-result.json',
    'verification/deploy-result.json'
  ];

  for (const relative of requiredFiles) {
    await ensureFile(path.join(rootDir, changePath, relative), `${changePath}/${relative}`, errors);
  }

  const spec = await readText(path.join(rootDir, changePath, 'request_analysis/spec.md'), errors);
  if (spec) {
    for (const section of REQUIRED_SPEC_SECTIONS) {
      if (!spec.includes(section)) {
        errors.push(`${changePath}/request_analysis/spec.md is missing ${section}.`);
      }
    }
  }

  const reviewFiles = await collectMarkdownFiles(path.join(rootDir, changePath), 'review');
  if (reviewFiles.length === 0) {
    errors.push(`${changePath} must contain at least one review markdown file.`);
  }

  for (const reviewFile of reviewFiles) {
    const content = await readText(reviewFile, errors);
    for (const section of REQUIRED_REVIEW_SECTIONS) {
      if (!content.includes(section)) {
        errors.push(`${path.relative(rootDir, reviewFile)} is missing ${section}.`);
      }
    }
  }

  const ciResult = await readJson(path.join(rootDir, changePath, 'verification/ci-result.json'), errors);
  if (ciResult) {
    validateCiResult(ciResult, `${changePath}/verification/ci-result.json`, errors);
  }

  const deployResult = await readJson(path.join(rootDir, changePath, 'verification/deploy-result.json'), errors);
  if (deployResult) {
    validateDeployResult(deployResult, `${changePath}/verification/deploy-result.json`, errors);
  }

  const governanceContext = await readChangeGovernanceContext(rootDir, changePath);
  await validateGovernanceChangeDirectory(rootDir, changePath, governanceContext, errors);
}

async function readChangeGovernanceContext(rootDir, changePath) {
  const textEntries = await Promise.all(
    [
      'summary.md',
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'risk/lightweight-entry-decision.md',
      'risk/gate-profile-selection.md'
    ].map(async (relativePath) => [
      relativePath,
      (await readOptionalText(path.join(rootDir, changePath, relativePath))) ?? ''
    ])
  );
  const texts = Object.fromEntries(textEntries);
  const combinedText = Object.values(texts).join('\n');
  const riskSelection = texts['risk/gate-profile-selection.md'];
  const lightweightDecision = texts['risk/lightweight-entry-decision.md'];
  const riskTags = extractRiskTags(riskSelection);
  const dryRun = isDryRunChange(changePath, combinedText) || riskTags.has('dry-run');
  const tddExempt = intersects(riskTags, TDD_EXEMPT_RISK_TAGS) || isTddExemptChangeType(riskSelection);

  return {
    combinedText,
    riskSelection,
    selectedProfile: extractSelectedProfile(riskSelection),
    riskTags,
    dryRun,
    declaresGovernance: declaresSddGovernance(combinedText),
    declaresLightweightGovernance: declaresLightweightGovernance(combinedText)
      || lightweightDecision.trim().length > 0,
    declaresProcessTrim: declaresProcessTrim(combinedText),
    highRiskImplementation: !dryRun && !tddExempt && intersects(riskTags, HIGH_RISK_IMPLEMENTATION_TAGS)
  };
}

async function validateGovernanceChangeDirectory(rootDir, changePath, context, errors) {
  if (!context.dryRun && context.declaresLightweightGovernance) {
    for (const relative of ['risk/lightweight-entry-decision.md', 'risk/gate-profile-selection.md']) {
      await ensureFile(
        path.join(rootDir, changePath, relative),
        `${changePath}/${relative}`,
        errors
      );
    }
  }

  if (!context.dryRun && context.declaresGovernance) {
    for (const relative of GOVERNANCE_REQUIRED_CHANGE_FILES) {
      await ensureFile(
        path.join(rootDir, changePath, relative),
        `${changePath}/${relative}`,
        errors
      );
    }

    if (!(await hasEquivalentFinalAudit(rootDir, changePath))) {
      errors.push(`${changePath} declares SDD/OpenSpec/Superpowers governance and must include acceptance/final_delivery_audit_v1.md or equivalent final audit.`);
    }

    if (!(await hasEquivalentVerificationEvidence(rootDir, changePath))) {
      errors.push(`${changePath} declares SDD/OpenSpec/Superpowers governance and must include verification/ci-result.json or equivalent verification evidence.`);
    }
  }

  if (!context.dryRun && context.declaresProcessTrim) {
    await ensureFile(
      path.join(rootDir, changePath, 'acceptance/process-trim-audit.md'),
      `${changePath}/acceptance/process-trim-audit.md`,
      errors
    );
  }

  if (context.highRiskImplementation) {
    if (context.selectedProfile === 'fast-iteration') {
      errors.push(`${changePath} is a high-risk implementation change and must not select fast-iteration.`);
    }
    for (const relative of HIGH_RISK_EXECUTION_FILES) {
      await ensureFile(
        path.join(rootDir, changePath, relative),
        `${changePath}/${relative}`,
        errors
      );
    }
  }
}

async function hasEquivalentFinalAudit(rootDir, changePath) {
  const exact = path.join(rootDir, changePath, 'acceptance/final_delivery_audit_v1.md');
  if (await fileExists(exact)) {
    return true;
  }

  return anyFileMatching(path.join(rootDir, changePath, 'acceptance'), (filePath) => {
    const filename = path.basename(filePath).toLowerCase();
    return filename.endsWith('.md') && filename.includes('final') && filename.includes('audit');
  });
}

async function hasEquivalentVerificationEvidence(rootDir, changePath) {
  const exact = path.join(rootDir, changePath, 'verification/ci-result.json');
  if (await fileExists(exact)) {
    return true;
  }

  return anyFileMatching(path.join(rootDir, changePath, 'verification'), (filePath) => {
    const filename = path.basename(filePath).toLowerCase();
    return /\.(json|md)$/.test(filename) && /(ci|verify|verification|validation).*result/.test(filename);
  });
}

function declaresSddGovernance(content) {
  return /governance version\s*:\s*`?sdd[-/ ]openspec[-/ ]superpowers/i.test(content)
    || /sdd\/openspec\/superpowers governance/i.test(content)
    || /sdd-openspec-superpowers-governance/i.test(content);
}

function declaresLightweightGovernance(content) {
  return /governance version\s*:\s*`?lightweight-governance/i.test(content)
    || /lightweight entry governance/i.test(content)
    || /harness-lightweight-governance/i.test(content);
}

function declaresProcessTrim(content) {
  return /process trim\s*:\s*(true|yes)/i.test(content)
    || /stage merge\s*:\s*(true|yes)/i.test(content)
    || /combined stages\s*:\s*(?!`?n\/a`?)(true|yes|[a-z0-9-]+)/i.test(content);
}

function extractSelectedProfile(riskSelection) {
  const profilePattern = STANDARD_GATE_PROFILE_IDS.join('|');
  const direct = riskSelection.match(new RegExp(`Selected Profile\\s*[:：]\\s*\`?(${profilePattern})\`?`, 'i'));
  if (direct) {
    return direct[1];
  }

  const section = riskSelection.match(/## Selected Profile([\s\S]*?)(?:\r?\n## |$)/i)?.[1] ?? '';
  for (const line of section.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.includes('|')) {
      continue;
    }
    const match = trimmed.match(new RegExp(`^[-*\\s]*\`?(${profilePattern})\`?`, 'i'));
    if (match) {
      return match[1];
    }
  }

  return null;
}

function isDryRunChange(changePath, content) {
  const changeId = path.basename(changePath).toLowerCase();
  return changeId.startsWith('dry-run')
    || /dry[- ]?run\s*:\s*(true|yes)/i.test(content)
    || /"dryRun"\s*:\s*true/i.test(content)
    || /\btreat\b[\s\S]{0,80}\bas a dry run\b/i.test(content);
}

function isTddExemptChangeType(content) {
  return /change type\s*:\s*`?(documentation|template-only|process-copy|dry-run)`?/i.test(content);
}

function extractRiskTags(riskSelection) {
  const tags = new Set();
  if (!riskSelection) {
    return tags;
  }

  const section = riskSelection.match(/## Risk Tags([\s\S]*?)(?:\r?\n## |$)/i)?.[1]
    ?? riskSelection.match(/Risk Tags\s*:\s*([^\n]+)/i)?.[1]
    ?? '';

  for (const match of section.matchAll(/`([^`]+)`/g)) {
    tags.add(normalizeRiskTag(match[1]));
  }

  for (const match of section.matchAll(/(?:^|\n)\s*[-*]\s*`?([a-z0-9-]+)`?/gi)) {
    tags.add(normalizeRiskTag(match[1]));
  }

  for (const token of section.split(/[\s,|]+/)) {
    const normalized = normalizeRiskTag(token.replace(/^[`*-]+|[`.,;:]+$/g, ''));
    if (/^[a-z0-9-]+$/.test(normalized)) {
      tags.add(normalized);
    }
  }

  tags.delete('');
  return tags;
}

function validateDeployResult(deployResult, source, errors) {
  const allowedStatuses = new Set(['SUCCESS', 'NOT_REQUIRED']);
  if (!allowedStatuses.has(deployResult.status)) {
    errors.push(`${source}: status must be SUCCESS or NOT_REQUIRED.`);
  }

  if (!deployResult.environment) {
    errors.push(`${source}: environment is required.`);
  }

  if (!Array.isArray(deployResult.smokeChecks)) {
    errors.push(`${source}: smokeChecks must be an array.`);
  }

  if (!deployResult.rollbackPlan) {
    errors.push(`${source}: rollbackPlan is required.`);
  }
}

async function collectMarkdownFiles(rootDir, pathSegment) {
  const results = [];
  await walk(rootDir, async (filePath) => {
    const parts = filePath.split(path.sep);
    if (parts.includes(pathSegment) && filePath.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

async function collectAllMarkdownFiles(rootDir) {
  const results = [];
  await walk(rootDir, async (filePath) => {
    if (filePath.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

async function collectRootMarkdownFiles(rootDir) {
  try {
    const entries = await readdir(rootDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.join(rootDir, entry.name));
  } catch {
    return [];
  }
}

async function docsContainConstitutionReference(rootDir) {
  const files = [
    ...(await collectAllMarkdownFiles(path.join(rootDir, 'docs'))),
    ...(await collectRootMarkdownFiles(rootDir))
  ];

  for (const filePath of files) {
    const content = await readOptionalText(filePath);
    if (content?.includes(REQUIRED_CONSTITUTION_PATH) || content?.includes('constitution.md')) {
      return true;
    }
  }

  return false;
}

function objectContainsString(value, expected) {
  if (typeof value === 'string') {
    return value.includes(expected);
  }

  if (Array.isArray(value)) {
    return value.some((item) => objectContainsString(item, expected));
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some((item) => objectContainsString(item, expected));
  }

  return false;
}

function normalizeRiskTag(tag) {
  return String(tag ?? '').trim().toLowerCase();
}

function intersects(left, right) {
  for (const value of left) {
    if (right.has(value)) {
      return true;
    }
  }
  return false;
}

async function anyFileMatching(rootDir, predicate) {
  let matched = false;
  await walk(rootDir, async (filePath) => {
    if (!matched && predicate(filePath)) {
      matched = true;
    }
  });
  return matched;
}

async function walk(directory, visit) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, visit);
    } else {
      await visit(fullPath);
    }
  }
}

async function ensureFile(filePath, label, errors) {
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      errors.push(`${label} must be a file.`);
    }
  } catch {
    errors.push(`${label} does not exist.`);
  }
}

async function ensureDirectory(directoryPath, label, errors) {
  try {
    const info = await stat(directoryPath);
    if (!info.isDirectory()) {
      errors.push(`${label} must be a directory.`);
    }
  } catch {
    errors.push(`${label} does not exist.`);
  }
}

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

async function readText(filePath, errors) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    errors.push(`${filePath}: ${error.message}`);
    return null;
  }
}

async function readOptionalText(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function readJson(filePath, errors) {
  const content = await readText(filePath, errors);
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    errors.push(`${filePath}: invalid JSON: ${error.message}`);
    return null;
  }
}

async function safeReadDir(directoryPath, errors) {
  try {
    return await readdir(directoryPath);
  } catch (error) {
    errors.push(`${directoryPath}: ${error.message}`);
    return null;
  }
}
