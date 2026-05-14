#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ACTIONS = [
  {
    name: '流程配置',
    aliases: ['配置流程', '风险配置', '选择流程', 'gate配置', 'flow-config', 'configure-flow', 'lightweight-entry-governance', 'gate-profile-selection', 'risk-selection'],
    phase: 'lightweight-entry-governance',
    role: 'Harness Engineering Owner',
    skills: ['.harness/skills/harness-change-flow/SKILL.md'],
    inputs: [
      '.harness/config/pipeline.json',
      '.harness/rules/',
      '.harness/templates/change/risk/lightweight-entry-decision.md',
      '.harness/templates/change/risk/gate-profile-selection.md'
    ],
    outputs: [
      'risk/lightweight-entry-decision.md',
      'risk/gate-profile-selection.md'
    ],
    commands: [],
    gates: [
      '入口 5 问必须完整',
      'riskTags 必须匹配 pipeline.riskRules',
      '高风险不得选择 fast-iteration',
      'effective minimum commands 必须写清楚'
    ],
    rollback: '风险不清时回到需求澄清；profile 不匹配时重新生成 gate-profile-selection.md。'
  },
  {
    name: '变更初始化',
    aliases: ['初始化', '创建变更', '初始化变更目录', 'init', 'change-init', 'setup-change'],
    phase: 'change setup',
    role: 'Harness Change 初始化 Agent',
    skills: ['.harness/skills/harness-change-flow/SKILL.md'],
    inputs: [
      '.harness/config/harness-manifest.json',
      '.harness/templates/change/',
      '.harness/rules/engineering-structure.md'
    ],
    outputs: [
      'summary.md',
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'risk/lightweight-entry-decision.md',
      'risk/gate-profile-selection.md',
      'verification/ci-result.json',
      'verification/deploy-result.json'
    ],
    commands: ['npm.cmd run validate'],
    gates: [
      '不得写业务代码',
      '不得覆盖其他 change 目录',
      '不得伪造评审、CI、部署或用户确认'
    ],
    rollback: '目录命名或流程未确认时回到流程配置。'
  },
  {
    name: '需求分析',
    aliases: ['分析需求', '需求拆解', '阶段1', 'request-analysis', 'specify', 'requirements'],
    phase: '1. request-analysis',
    role: 'Request Analysis Agent',
    skills: ['.harness/skills/request-analysis/SKILL.md'],
    inputs: [
      'risk/gate-profile-selection.md',
      '.harness/rules/',
      '业务需求原文',
      '相关 docs / wiki / code'
    ],
    outputs: [
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'summary.md',
      'request_analysis/context-pack.md（启用 SDD/OpenSpec 时）',
      'request_analysis/proposal.md（启用 SDD/OpenSpec 时）'
    ],
    commands: [],
    gates: [
      'spec 必须包含 Goal、Scope、Out Of Scope、Constraints、Acceptance Criteria、Open Questions、Risks',
      'tasks 必须有 owner、dependencies、output、verification',
      '不得写业务代码'
    ],
    rollback: '需求不清时回到需求方澄清；发现新风险时回到流程配置。'
  },
  {
    name: '需求评审',
    aliases: ['评审需求', '需求review', '阶段2', 'requirement-review', 'requirements-review', 'spec-review'],
    phase: '2. requirement-review',
    role: 'Independent Requirement Reviewer',
    skills: ['.harness/skills/expert-reviewer/SKILL.md'],
    inputs: [
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'risk/gate-profile-selection.md'
    ],
    outputs: ['request_analysis/review/spec_review_v1.md'],
    commands: [],
    gates: [
      '必须独立评审',
      'review 必须包含 Verdict、Findings、Next Action',
      'MUST FIX 阻塞进入实现'
    ],
    rollback: 'REVISION REQUIRED 时回 phase 1 修订 spec/tasks。'
  },
  {
    name: '设计准备',
    aliases: ['实现准备', '设计与实现准备', '阶段3', '设计', 'design-prep', 'implementation-readiness', 'plan'],
    phase: '3. implementation plus optional extensions',
    role: 'Design / Readiness Agent',
    skills: [
      '.harness/skills/implementation-readiness/SKILL.md',
      '.harness/skills/government-enterprise-prototype/SKILL.md'
    ],
    inputs: [
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'request_analysis/review/spec_review_v1.md',
      'risk/gate-profile-selection.md'
    ],
    outputs: [
      'design/plan.md（启用 SDD/OpenSpec 时）',
      'prototype/page-map.md（启用原型时）',
      'prototype/user-flow.md（启用原型时）',
      'prototype/high-fidelity-prototype-spec.md（启用原型时）',
      'implementation/openapi-contract-checklist.md（适用时）',
      'implementation/db-migration-checklist.md（适用时）',
      'verification/environment-readiness.md（适用时）'
    ],
    commands: ['npm.cmd run validate'],
    gates: [
      '不得实现完整业务逻辑',
      '原型不得引入未批准 scope',
      '契约和 migration 必须可验证'
    ],
    rollback: '设计扩大范围时回 phase 1；readiness 不满足时停在本阶段。'
  },
  {
    name: '原型确认',
    aliases: ['政企原型', '客户原型', '原型评审', 'prototype', 'prototype-review', 'government-enterprise-prototype'],
    phase: 'government-enterprise-prototype',
    role: 'Government Enterprise Prototype Agent',
    skills: ['.harness/skills/government-enterprise-prototype/SKILL.md'],
    inputs: [
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'OpenAPI draft（如有）',
      '现有 UI 规范'
    ],
    outputs: [
      'prototype/page-map.md',
      'prototype/user-flow.md',
      'prototype/high-fidelity-prototype-spec.md',
      'design/prototype-review-v1.md'
    ],
    commands: ['npm.cmd run validate'],
    gates: [
      '覆盖 MVP 页面、流程、状态和验收标准',
      '确认没有范围膨胀',
      '原型评审通过前不得进入业务编码'
    ],
    rollback: '原型发现范围不一致时回 phase 1 更新需求或明确非目标。'
  },
  {
    name: '实现',
    aliases: ['编码', '开发', '阶段4', 'implementation', 'implement', 'coding'],
    phase: '3. implementation',
    role: 'Implementation Agent',
    skills: ['.harness/skills/coding-skill/SKILL.md'],
    inputs: [
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'request_analysis/review/spec_review_v1.md',
      'design/plan.md（如有）',
      '相关代码'
    ],
    outputs: [
      '代码变更',
      'implementation/notes.md',
      'summary.md'
    ],
    commands: [],
    gates: [
      '每个代码变更必须映射到已批准任务',
      '不得做无关重构',
      '执行 Agent 不输出 APPROVED 评审结论'
    ],
    rollback: '实现发现范围不一致时回 phase 1/2；编译失败回本阶段修复。'
  },
  {
    name: 'TDD实现',
    aliases: ['TDD', '高风险实现', '红绿重构', 'tdd-execution', 'tdd-execution-quality', 'red-green-refactor'],
    phase: 'tdd-execution-quality',
    role: 'TDD Implementation Agent',
    skills: ['.harness/skills/coding-skill/SKILL.md'],
    inputs: [
      'risk/gate-profile-selection.md',
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'design/plan.md（如有）'
    ],
    outputs: [
      'implementation/task-execution-plan.md',
      'implementation/tdd-cycle-log.md',
      'implementation/notes.md',
      '代码变更'
    ],
    commands: ['npm.cmd test', 'npm.cmd run verify'],
    gates: [
      '高风险任务必须记录 Red-Green-Refactor 或等价评审证据',
      'TDD 证据不能替代需求评审、代码评审、测试评审或 CI',
      '每个 cycle 必须链接命令或测试证据'
    ],
    rollback: 'TDD 失败回测试或实现；等价证据需要人工确认。'
  },
  {
    name: '代码评审',
    aliases: ['评审代码', '代码review', '阶段5', 'code-review', 'review-code'],
    phase: '4. code-review',
    role: 'Independent Code Reviewer',
    skills: ['.harness/skills/expert-reviewer/SKILL.md'],
    inputs: [
      'git diff',
      'request_analysis/spec.md',
      'request_analysis/tasks.md',
      'implementation/notes.md'
    ],
    outputs: ['implementation/review/code_review_v1.md'],
    commands: [],
    gates: [
      '必须独立评审',
      'MUST FIX 阻塞后续测试接受',
      '评审必须包含 Verdict、Findings、Evidence、Next Action'
    ],
    rollback: 'REVISION REQUIRED 时回实现阶段。'
  },
  {
    name: '前端评审',
    aliases: ['前端专项评审', 'UI评审', 'frontend review', 'frontend-review', 'frontend-special-review', 'ui-review'],
    phase: 'frontend-special-review',
    role: 'Frontend Reviewer',
    skills: ['.harness/skills/frontend-review/SKILL.md'],
    inputs: [
      '前端 diff',
      'prototype/*（如有）',
      'OpenAPI contract（如有）',
      'frontend build/test results'
    ],
    outputs: [
      'implementation/review/frontend_code_review_v1.md',
      'verification/review/frontend_test_review_v1.md'
    ],
    commands: ['npm.cmd run verify:frontend'],
    gates: [
      '页面必须匹配原型和 API 契约',
      'loading/empty/error/success/disabled/conflict 状态必须检查',
      '前端 review 不能无证据替代基础 code review'
    ],
    rollback: '前端 MUST FIX 回实现或测试阶段。'
  },
  {
    name: '测试编写',
    aliases: ['写测试', '补测试', '阶段6', 'unit-test-writing', 'test-writing', 'write-tests'],
    phase: '5. unit-test-writing',
    role: 'Test Writing Agent',
    skills: ['.harness/skills/unit-test-write/SKILL.md'],
    inputs: [
      'request_analysis/tasks.md',
      'implementation/notes.md',
      'implementation/review/code_review_v1.md',
      '现有测试'
    ],
    outputs: [
      '测试代码',
      'verification/test-plan.md',
      'summary.md'
    ],
    commands: ['npm.cmd test'],
    gates: [
      '测试必须绑定已接受行为',
      '关键异常路径必须覆盖',
      '不得用 E2E 替代单元或集成测试'
    ],
    rollback: '代码不可测试时回实现；需求不可验证时回需求分析。'
  },
  {
    name: '测试评审',
    aliases: ['评审测试', '测试review', 'unit-test-review', 'test-review'],
    phase: '6. unit-test-review',
    role: 'Independent Test Reviewer',
    skills: ['.harness/skills/expert-reviewer/SKILL.md'],
    inputs: [
      'verification/test-plan.md',
      '测试 diff',
      '实现 diff',
      'request_analysis/spec.md'
    ],
    outputs: ['verification/review/test_review_v1.md'],
    commands: [],
    gates: [
      '测试必须验证行为而非实现细节',
      '测试应能在目标行为缺失时失败',
      'MUST FIX 阻塞进入 CI'
    ],
    rollback: '测试不足回 phase 5。'
  },
  {
    name: '提交前检查',
    aliases: ['preflight', '提交检查', '阶段7', 'code-push-readiness', 'push-readiness'],
    phase: '7. code-push-readiness',
    role: 'Code Push Readiness Agent',
    skills: ['.harness/skills/unit-test-ci/SKILL.md'],
    inputs: [
      'summary.md',
      'risk/gate-profile-selection.md',
      '所有 review artifacts',
      'verification/test-plan.md',
      'package.json'
    ],
    outputs: ['verification/preflight.md'],
    commands: ['npm.cmd run validate'],
    gates: [
      '无 unresolved MUST FIX',
      'effective minimum commands 明确',
      '阶段合并有 process-trim-audit 或明确不适用'
    ],
    rollback: '发现问题回拥有该问题的阶段。'
  },
  {
    name: 'CI验证',
    aliases: ['CI', '验证', 'Harness验证', '阶段8', 'ci', 'ci-verification', 'validate', 'verify'],
    phase: '8. ci-verification',
    role: 'CI Verification Agent',
    skills: ['.harness/skills/unit-test-ci/SKILL.md'],
    inputs: [
      'verification/preflight.md',
      'risk/gate-profile-selection.md',
      'package.json',
      '测试输出'
    ],
    outputs: ['verification/ci-result.json'],
    commands: ['npm.cmd test', 'npm.cmd run validate', 'npm.cmd run verify'],
    gates: [
      'status 必须为 SUCCESS',
      'totalTests 必须大于 0，除非低风险等价证据明确记录',
      'passedTests 必须等于 totalTests'
    ],
    rollback: '0 测试回 phase 5；编译错回 phase 3；validator 失败回对应 Harness 资产。'
  },
  {
    name: 'E2E联调',
    aliases: ['E2E', '联调', '端到端', '阶段9联调', 'e2e', 'e2e-integration', 'e2e-integration-gate'],
    phase: 'e2e-integration-gate',
    role: 'E2E Integration Agent',
    skills: ['.harness/skills/e2e-integration/SKILL.md'],
    inputs: [
      'verification/environment-readiness.md',
      'OpenAPI contract',
      'prototype/user-flow.md',
      'backend/frontend/runtime startup commands'
    ],
    outputs: [
      'verification/e2e-plan.md',
      'verification/e2e-result.json',
      'e2e/<flow>.spec.ts（如适用）'
    ],
    commands: ['npm.cmd run verify:e2e', 'npm.cmd run verify:all'],
    gates: [
      'runtime dependencies 必须可达或明确 stub',
      '覆盖 critical happy path',
      '可行时覆盖一个 critical failure path',
      'E2E 不替代单元测试、集成测试或代码评审'
    ],
    rollback: '功能失败回实现或测试；环境失败回 readiness。'
  },
  {
    name: '部署验证',
    aliases: ['部署', '发布验证', 'smoke', '部署smoke', 'deployment-verification', 'deploy-verify', 'deploy'],
    phase: '9. deployment-verification',
    role: 'Deployment Verification Agent',
    skills: ['.harness/skills/deploy-verify/SKILL.md'],
    inputs: [
      'verification/ci-result.json',
      'verification/e2e-result.json（如适用）',
      '部署环境和参数',
      'release notes'
    ],
    outputs: ['verification/deploy-result.json'],
    commands: [],
    gates: [
      'environment 必须明确',
      'smoke checks 必须通过或 release halted',
      'rollback plan 必须记录',
      '不得猜测生产参数'
    ],
    rollback: '部署失败暂停并执行 rollback plan；功能失败回实现阶段。'
  },
  {
    name: '最终审计',
    aliases: ['最终交付审计', '交付审计', '验收审计', '阶段10', 'acceptance-audit', 'final-audit', 'final-delivery-audit'],
    phase: '10. user-confirmation plus acceptance-audit',
    role: 'Final Delivery Auditor',
    skills: ['.harness/skills/acceptance-audit/SKILL.md'],
    inputs: [
      'summary.md',
      'risk/gate-profile-selection.md',
      'request_analysis/',
      'implementation/',
      'verification/',
      'acceptance/process-trim-audit.md（如适用）'
    ],
    outputs: [
      'acceptance/acceptance_review_v1.md',
      'acceptance/release_readiness_checklist.md',
      'acceptance/final_delivery_audit_v1.md',
      'acceptance/archive.md（启用 SDD/OpenSpec 时）'
    ],
    commands: ['npm.cmd run verify'],
    gates: [
      '无 unresolved MUST FIX',
      '验证证据存在',
      'riskRules 和 effective minimum commands 被遵守',
      '没有验证证据不得交付'
    ],
    rollback: 'NOT APPROVED 时回拥有缺口的阶段；流程资产缺口进入 Harness improvement backlog。'
  },
  {
    name: '用户确认',
    aliases: ['确认交付', '用户验收', '关闭变更', 'user-confirmation', 'user-acceptance', 'close-change'],
    phase: '10. user-confirmation',
    role: 'User Confirmation Agent',
    skills: ['.harness/skills/expert-reviewer/SKILL.md'],
    inputs: [
      'acceptance/final_delivery_audit_v1.md',
      'acceptance/release_readiness_checklist.md',
      'verification/ci-result.json',
      'verification/deploy-result.json',
      'summary.md'
    ],
    outputs: ['acceptance/user-confirmation.md'],
    commands: [],
    gates: [
      'final audit 未通过不得写用户已确认',
      '用户可见结果和验证证据必须链接',
      '未解决风险必须显式记录'
    ],
    rollback: '用户不确认时回对应阶段或新建 follow-up change。'
  }
];

const ACTION_BY_NAME = new Map();
for (const action of ACTIONS) {
  ACTION_BY_NAME.set(normalize(action.name), action);
  for (const alias of action.aliases) {
    ACTION_BY_NAME.set(normalize(alias), action);
  }
}

const [rawAction, rawChangeId] = process.argv.slice(2);

if (!rawAction || ['help', '-h', '--help', '帮助'].includes(rawAction)) {
  printHelp();
  process.exit(0);
}

if (['list', '列出', '列出阶段', '阶段'].includes(rawAction)) {
  printActionList();
  process.exit(0);
}

const action = ACTION_BY_NAME.get(normalize(rawAction));
if (!action) {
  console.error(`未识别的 Harness 中文阶段：${rawAction}`);
  console.error('请运行：harness 列出阶段');
  console.error('如果未加入 PATH，请在仓库根目录运行：.\\harness.cmd 列出阶段');
  process.exitCode = 1;
} else {
  printActionGuide(action, rawChangeId);
}

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '');
}

function printHelp() {
  console.log(`Harness 中文阶段入口

用法：
  harness 列出阶段
  harness <中文阶段|英文phase> <change-id>

示例：
  harness 需求分析 feature-order-status-20260513
  harness request-analysis feature-order-status-20260513
  harness 需求评审 feature-order-status-20260513
  harness requirement-review feature-order-status-20260513
  harness CI验证 feature-order-status-20260513
  harness ci-verification feature-order-status-20260513
  harness 最终审计 feature-order-status-20260513

Windows PowerShell 如果没有把仓库根目录加入 PATH，可使用：
  .\\harness.cmd 需求分析 feature-order-status-20260513

兼容 npm 方式：
  npm.cmd run harness -- 需求分析 feature-order-status-20260513
`);
}

function printActionList() {
  console.log('可用中文阶段：');
  for (const action of ACTIONS) {
    const englishAliases = action.aliases.filter((alias) => /^[a-z0-9-]+$/i.test(alias));
    const aliasText = englishAliases.length ? `，英文：${englishAliases.join(', ')}` : '';
    console.log(`- ${action.name} -> ${action.phase}${aliasText}`);
  }
}

function printActionGuide(action, changeId) {
  const changeRoot = changeId ? path.join('.harness', 'changes', changeId) : null;
  const riskSelection = changeRoot
    ? readOptionalText(path.join(changeRoot, 'risk', 'gate-profile-selection.md'))
    : '';

  console.log(`# ${action.name}`);
  console.log('');
  console.log(`Harness 阶段：${action.phase}`);
  console.log(`建议角色：${action.role}`);
  console.log('');

  if (changeId) {
    console.log(`change-id：${changeId}`);
    console.log(`change 目录：${changeRoot}`);
    console.log(`目录状态：${existsSync(changeRoot) ? '存在' : '不存在，需先执行「变更初始化」'}`);
    const profile = extractSelectedProfile(riskSelection);
    const riskTags = extractRiskTags(riskSelection);
    if (profile || riskTags.length > 0) {
      console.log(`已读取风险配置：${profile ? `profile=${profile}` : 'profile 未识别'}${riskTags.length ? `，riskTags=${riskTags.join(', ')}` : ''}`);
    } else if (action.name !== '流程配置' && action.name !== '变更初始化') {
      console.log('风险配置：未发现或未填写 risk/gate-profile-selection.md，请先确认流程配置。');
    }
    console.log('');
  } else {
    console.log('change-id：未提供。建议传入 change-id，便于定位证据目录。');
    console.log('');
  }

  printList('需要调用 / 读取的 skill', action.skills);
  printList('输入材料', prefixChangeFiles(action.inputs, changeId));
  printList('本阶段产出证据', prefixChangeFiles(action.outputs, changeId));
  printList('底层验证命令', action.commands.length ? action.commands : ['本阶段通常不直接运行命令，但不得跳过后续验证证据']);
  printList('质量门禁', action.gates);

  console.log('');
  console.log(`失败回退：${action.rollback}`);
  console.log('');
  console.log('给 AI 的一句话：');
  console.log(`请调用 \`.harness/skills/harness-change-flow/SKILL.md\` 的「${action.name}」动作${changeId ? `，change-id 是 \`${changeId}\`` : ''}，读取上述输入材料，按门禁生成本阶段产出证据；不要跳过评审、验证或审计责任。`);
}

function printList(title, items) {
  console.log(`${title}：`);
  for (const item of items) {
    console.log(`- ${item}`);
  }
  console.log('');
}

function prefixChangeFiles(items, changeId) {
  if (!changeId) {
    return items;
  }

  const changeRelativePrefixes = [
    'summary.md',
    'risk/',
    'request_analysis/',
    'design/',
    'prototype/',
    'implementation/',
    'verification/',
    'acceptance/'
  ];

  return items.map((item) => {
    const shouldPrefix = changeRelativePrefixes.some((prefix) => item.startsWith(prefix));
    return shouldPrefix ? `.harness/changes/${changeId}/${item}` : item;
  });
}

function readOptionalText(relativePath) {
  try {
    return readFileSync(relativePath, 'utf8');
  } catch {
    return '';
  }
}

function extractSelectedProfile(text) {
  if (!text) {
    return '';
  }

  const profiles = [
    'full-audit',
    'balanced-enterprise',
    'fast-iteration',
    'government-enterprise-prototype-first',
    'risk-adaptive',
    'tdd-execution'
  ];

  const selectedProfileIndex = text.toLowerCase().indexOf('## selected profile');
  const searchText = selectedProfileIndex >= 0 ? text.slice(selectedProfileIndex, selectedProfileIndex + 500) : text;

  return profiles.find((profile) => searchText.includes(profile)) ?? '';
}

function extractRiskTags(text) {
  if (!text) {
    return [];
  }

  const knownTags = [
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
    'infrastructure',
    'government-acceptance',
    'enterprise-uat',
    'external-acceptance',
    'documentation',
    'template-only',
    'process-copy',
    'dry-run'
  ];

  return knownTags.filter((tag) => text.includes(tag));
}
