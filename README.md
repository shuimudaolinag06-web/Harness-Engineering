# Harness Engineering 标准插件

Harness Engineering 是一套面向企业级 AI Coding 的本地流程插件和工程资产包。它把需求分析、设计、实现、评审、测试、CI、部署验证和最终交付审计封装为可执行的 `.harness/` 目录、阶段 skill、模板、验证器和 `harness` 命令。

这套插件的目标不是让新人背流程，而是让新人拿到一个真实需求后，可以按命令一步步推进，并在每个阶段留下可审计证据。

## 适用场景

- 新项目希望引入 Harness Engineering 流程。
- 团队希望统一 AI Coding 的需求、实现、评审和测试证据。
- 新人不知道 `.harness/` 目录、`gateProfile`、`riskTags`、`extensionStages` 如何使用。
- 项目需要轻量治理：低风险轻量执行，高风险加严审计。
- Codex、Claude Code、Cursor、Copilot Workspace 等编程工具需要共享同一套流程资产。

## 核心能力

- 中文阶段命令：例如 `harness 需求分析 <change-id>`。
- 英文阶段命令：例如 `harness request-analysis <change-id>`。
- 风险自适应流程配置：支持 `fast-iteration`、`balanced-enterprise`、`government-enterprise-prototype-first`、`full-audit`、`risk-adaptive`、`tdd-execution`。
- 审计目录：每个需求在 `.harness/changes/<change-id>/` 下沉淀证据。
- 执行与评审分离：实现 Agent 和评审 Agent 不混用。
- 验证器：通过 `npm.cmd run validate` 检查 Harness 资产完整性。
- Starter 安装脚本：把标准 `.harness/`、命令封装和验证器复制到目标项目。

## 仓库结构

```text
plugins/harness-engineering/
  .codex-plugin/
    plugin.json
  skills/
    harness-engineering/
      SKILL.md
  scripts/
    install-starter.mjs
  assets/
    starter/
      .harness/
      scripts/
      harness.cmd
      harness.ps1
      harness
      package.harness-scripts.json

.agents/
  plugins/
    marketplace.json
```

说明：

- `plugins/harness-engineering/.codex-plugin/plugin.json` 是 Codex 本地插件描述文件。
- `plugins/harness-engineering/skills/harness-engineering/SKILL.md` 是总控 skill。
- `plugins/harness-engineering/assets/starter/` 是要安装到业务项目的标准流程资产。
- `plugins/harness-engineering/scripts/install-starter.mjs` 是安装脚本。
- `.agents/plugins/marketplace.json` 用于本地插件市场/插件索引。

## 安装到业务项目

### 1. 克隆插件仓库

```powershell
git clone https://github.com/shuimudaolinag06-web/Harness-Engineering.git
cd Harness-Engineering
```

### 2. 安装 starter 到目标项目

把 `<目标项目路径>` 替换成你的业务项目根目录：

```powershell
node plugins/harness-engineering/scripts/install-starter.mjs <目标项目路径>
```

示例：

```powershell
node plugins/harness-engineering/scripts/install-starter.mjs E:\workspace\agent-data-governance
```

安装后，目标项目会新增或更新：

```text
.harness/
scripts/harness-flow.mjs
scripts/validate-harness.mjs
scripts/lib/harnessValidator.mjs
harness.cmd
harness.ps1
harness
package.harness-scripts.json
```

### 3. 合并 package scripts

如果目标项目已有 `package.json`，请把 `package.harness-scripts.json` 中的脚本合并进去。

推荐脚本：

```json
{
  "scripts": {
    "harness": "node scripts/harness-flow.mjs",
    "validate": "node scripts/validate-harness.mjs",
    "verify": "npm test && npm run validate"
  },
  "bin": {
    "harness": "./scripts/harness-flow.mjs"
  }
}
```

如果目标项目没有 `package.json`，可以先创建一个最小版本：

```json
{
  "name": "your-project",
  "private": true,
  "type": "module",
  "scripts": {
    "harness": "node scripts/harness-flow.mjs",
    "validate": "node scripts/validate-harness.mjs",
    "verify": "npm test && npm run validate"
  },
  "bin": {
    "harness": "./scripts/harness-flow.mjs"
  }
}
```

## 安装后验证

进入目标项目根目录：

```powershell
cd <目标项目路径>
```

查看阶段命令：

```powershell
.\harness.cmd 列出阶段
```

验证 Harness 资产：

```powershell
npm.cmd run validate
```

如果业务项目已经配置测试命令，可以运行：

```powershell
npm.cmd run verify
```

## 命令用法

Windows PowerShell 推荐直接使用：

```powershell
.\harness.cmd <阶段> <change-id>
```

如果你已经把 `harness` 加入 PATH，或者通过 npm bin 暴露了命令，也可以使用：

```powershell
harness <阶段> <change-id>
```

如果命令封装不可用，可以使用 npm fallback：

```powershell
npm.cmd run harness -- <阶段> <change-id>
```

## 常用阶段命令

| 中文命令 | 英文命令 | 用途 |
|---|---|---|
| `列出阶段` | `list` | 查看所有可用阶段 |
| `流程配置` | `flow-config` | 根据需求风险选择 gateProfile、riskTags、extensionStages |
| `变更初始化` | `change-init` | 创建 `.harness/changes/<change-id>/` 目录和初始证据文件 |
| `需求分析` | `request-analysis` | 生成需求分析、任务拆解、范围和验收标准 |
| `需求评审` | `requirement-review` | 评审需求完整性、风险和是否允许进入实现 |
| `设计准备` | `design-readiness` | 准备原型、OpenAPI、数据库、环境和实现计划 |
| `实现` | `implementation` | 按任务边界实现，不做无关重构 |
| `代码评审` | `code-review` | 独立评审实现边界、质量、风险和可维护性 |
| `前端专项评审` | `frontend-review` | 检查前端交互、状态、可访问性、响应式和视觉一致性 |
| `测试编写` | `unit-test-writing` | 编写单元测试、集成测试和异常路径测试 |
| `测试评审` | `unit-test-review` | 评审测试是否验证行为，而不是实现细节 |
| `提交前检查` | `code-push-readiness` | 检查未解决问题、证据和最小验证命令 |
| `CI验证` | `ci-verification` | 运行 CI、validator 和业务验证命令 |
| `E2E联调` | `e2e-integration` | 前后端联调、E2E 路径和关键业务流验证 |
| `部署验证` | `deployment-verification` | 部署、smoke check、回滚方案和运行时验证 |
| `最终审计` | `final-audit` | 生成交付审计、发布检查和验收证据 |
| `用户确认` | `user-confirmation` | 记录用户确认、遗留事项和最终交付结论 |

示例：

```powershell
.\harness.cmd 流程配置 agent-data-governance-v1
.\harness.cmd 变更初始化 agent-data-governance-v1
.\harness.cmd 需求分析 agent-data-governance-v1
.\harness.cmd 需求评审 agent-data-governance-v1
.\harness.cmd 实现 agent-data-governance-v1
.\harness.cmd CI验证 agent-data-governance-v1
.\harness.cmd 最终审计 agent-data-governance-v1
```

英文等价命令：

```powershell
.\harness.cmd flow-config agent-data-governance-v1
.\harness.cmd change-init agent-data-governance-v1
.\harness.cmd request-analysis agent-data-governance-v1
.\harness.cmd requirement-review agent-data-governance-v1
.\harness.cmd implementation agent-data-governance-v1
.\harness.cmd ci-verification agent-data-governance-v1
.\harness.cmd final-audit agent-data-governance-v1
```

## change-id 如何填写

`change-id` 是本次需求在 Harness 审计目录里的唯一编号，会对应到：

```text
.harness/changes/<change-id>/
```

它不是需求文档文件名，也不是分支名。它应该是一个短、稳定、可读的英文或数字标识。

如果你拿到的需求文档叫：

```text
xx产品需求.md
```

不要把 `change-id` 写成：

```text
xx产品需求.md
```

推荐先从需求主题提炼英文短名：

```text
xx-product-requirement-v1
```

如果是具体业务需求，例如：

```text
Agent数据治理平台.md
```

推荐：

```text
agent-data-governance-v1
```

如果团队需要日期前缀，可以使用：

```text
20260514-agent-data-governance
```

推荐规则：

- 使用小写英文、数字和短横线。
- 不使用空格。
- 不使用中文标点。
- 不使用 `.md`、`.docx` 等文件后缀。
- 同一需求后续小版本可以加 `v2`、`phase-2`、`uat-fix`。

## 新需求推荐使用路径

新人拿到一个需求后，建议按下面顺序执行：

### 1. 流程配置

```powershell
.\harness.cmd 流程配置 <change-id>
```

目标：

- 判断需求风险。
- 选择 `riskTags`。
- 选择 `gateProfile`。
- 选择 `extensionStages`。
- 计算最低验证命令。
- 判断哪些阶段可合并，哪些阶段不可跳过。

### 2. 变更初始化

```powershell
.\harness.cmd 变更初始化 <change-id>
```

目标：

- 创建 `.harness/changes/<change-id>/`。
- 从模板复制本次需求需要的证据文件。
- 确保后续每个阶段都有固定沉淀位置。

### 3. 需求分析

```powershell
.\harness.cmd 需求分析 <change-id>
```

目标：

- 生成 `request_analysis/spec.md`。
- 生成 `request_analysis/tasks.md`。
- 更新 `summary.md`。
- 明确范围、非目标、验收标准、风险和任务拆解。

### 4. 需求评审

```powershell
.\harness.cmd 需求评审 <change-id>
```

目标：

- 由评审 Agent 检查需求质量。
- 发现 MUST FIX 时阻塞进入实现。
- 避免边做边猜。

### 5. 设计准备与实现

```powershell
.\harness.cmd 设计准备 <change-id>
.\harness.cmd 实现 <change-id>
```

目标：

- 高风险需求先补齐原型、OpenAPI、数据库、环境和任务计划。
- 实现阶段只按任务边界改代码。
- 不做无关重构。

### 6. 独立代码评审

```powershell
.\harness.cmd 代码评审 <change-id>
```

目标：

- 执行 Agent 不评审自己的实现。
- 评审边界、质量、风险、可维护性和测试缺口。

### 7. 测试与验证

```powershell
.\harness.cmd 测试编写 <change-id>
.\harness.cmd 测试评审 <change-id>
.\harness.cmd 提交前检查 <change-id>
.\harness.cmd CI验证 <change-id>
```

目标：

- 单元测试验证核心行为。
- 集成测试验证模块协作。
- 异常路径测试覆盖关键失败场景。
- CI 和 validator 证据必须落地。

### 8. 联调、部署和最终审计

```powershell
.\harness.cmd E2E联调 <change-id>
.\harness.cmd 部署验证 <change-id>
.\harness.cmd 最终审计 <change-id>
.\harness.cmd 用户确认 <change-id>
```

目标：

- 有前后端、外部系统、UAT 或部署风险时启用。
- 没有验证证据不得交付。
- 如果裁剪了阶段，必须补充裁剪审计。

## 流程配置建议

| 需求类型 | 推荐 gateProfile | 常见 riskTags | 说明 |
|---|---|---|---|
| 文档、模板、小修小补 | `fast-iteration` | 无或低风险 | 可以轻量，但仍需留下审计证据 |
| 普通后台功能 | `balanced-enterprise` | `public-api`、`permission` | 需要需求评审、代码评审、测试和 CI |
| 前端页面与 API 联调 | `balanced-enterprise` | `public-api`、`runtime` | 建议启用 `frontend-special-review`、`e2e-integration-gate` |
| 金额计算、订单状态 | `full-audit` 或 `risk-adaptive` | `money`、`financial-calculation`、`state-machine` | 高风险必须加严 |
| 数据库 migration | `full-audit` | `database`、`data-migration` | 必须有 migration checklist 和回滚方案 |
| 政企客户原型确认 | `government-enterprise-prototype-first` | `government-acceptance`、`enterprise-uat` | 先原型确认，再实现 |
| 部署或运行时配置 | `risk-adaptive` | `deployment`、`runtime` | 必须做部署验证和 smoke checks |
| TDD 明确要求 | `tdd-execution` | 按需求选择 | 必须有 TDD cycle log |

## 验证命令

基础仓库至少运行：

```powershell
npm.cmd run validate
```

如果配置了测试：

```powershell
npm.cmd test
npm.cmd run verify
```

业务项目可以按需增加：

```powershell
npm.cmd run verify:harness
npm.cmd run verify:backend
npm.cmd run verify:frontend
npm.cmd run verify:e2e
npm.cmd run verify:all
```

原则：

- 没有验证证据不得交付。
- 验证失败必须记录失败原因、修复方式和复验结果。
- 重复失败要沉淀到 rule、skill、template、prompt 或 validator。

## 在 Codex 中使用

当 Codex 识别到插件后，可以直接让它使用 Harness Engineering skill：

```text
请使用 Harness Engineering，基于 docs/Agent数据治理平台.md，为本次需求生成流程配置方案。
change-id 建议为 agent-data-governance-v1。
请读取 .harness/config/pipeline.json、.harness/config/harness-manifest.json、.harness/rules/、.harness/skills/ 和 .harness/templates/change/。
输出 gateProfile、riskTags、extensionStages、最低验证命令、可合并阶段、不可跳过阶段、需要创建的证据文件。
```

也可以按阶段调用：

```text
请使用 Harness Engineering，对 change-id=agent-data-governance-v1 执行“需求分析”阶段。
请读取需求文档 docs/Agent数据治理平台.md 和 .harness/changes/agent-data-governance-v1/ 下已有证据。
请输出并更新 spec.md、tasks.md、summary.md。
禁止直接进入实现。
```

## 在其他编程工具中使用

这套插件不依赖某个单一工具。其他编程工具也可以按普通文件和 Node 脚本使用：

1. 让工具读取 `.harness/skills/harness-change-flow/SKILL.md`。
2. 使用 `.\harness.cmd <阶段> <change-id>` 或 `node scripts/harness-flow.mjs <阶段> <change-id>` 获取阶段指令。
3. 所有证据写入 `.harness/changes/<change-id>/`。
4. 使用 `npm.cmd run validate` 检查 Harness 资产完整性。
5. 使用项目自己的测试、构建、E2E 和部署命令补齐验证证据。

## 升级插件

在插件仓库拉取最新版本：

```powershell
git pull
```

重新安装 starter 到目标项目：

```powershell
node plugins/harness-engineering/scripts/install-starter.mjs <目标项目路径>
```

升级前建议先查看目标项目中 `.harness/` 是否有团队自定义内容。安装脚本会复制标准资产，但团队仍应评审差异，避免覆盖本地约定。

## 常见问题

### 1. 为什么不是所有需求都走 full-audit？

因为新版 Harness Engineering 支持轻量治理。低风险需求可以选择 `fast-iteration`，但不能删除审计责任；高风险需求必须加严。

### 2. 可以跳过需求分析直接写代码吗？

不建议。即使是低风险需求，也至少要留下轻量需求分析和交付证据。没有明确范围、验收标准和风险判断，就不应该进入实现。

### 3. E2E 可以替代单元测试吗？

不可以。E2E 验证业务链路，单元测试验证核心行为和边界。高风险逻辑必须有更靠近代码的测试证据。

### 4. 实现 Agent 可以自己评审自己的代码吗？

不可以。Harness Engineering 明确要求执行 Agent 与评审 Agent 或评审流程分离。

### 5. CI 通过就可以交付吗？

不一定。还要看本次流程配置要求的证据是否齐全，例如需求评审、测试评审、部署验证、用户确认和最终审计。

### 6. 命令中 `<change-id>` 和需求文档是什么关系？

需求文档是输入材料，例如 `docs/Agent数据治理平台.md`。`change-id` 是审计目录名，例如 `agent-data-governance-v1`。两者可以有关联，但不能直接把文档文件名当作 `change-id`。

## 许可证

当前版本为团队内部标准插件模板。正式开源或商用前，请根据组织要求补充明确许可证。
