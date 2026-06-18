<p align="center">
  <a href="https://github.com/rpamis/comet/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/rpamis/comet/ci.yml?branch=master&style=flat-square&label=CI" /></a>
  <a href="https://www.npmjs.com/package/@rpamis/comet"><img alt="npm version" src="https://img.shields.io/npm/v/@rpamis/comet?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
</p>

# @rpamis/comet

> English version: [README.md](README.md)

**面向 AI 编码 Agent 的脚本化工作流 harness** — 把 OpenSpec 需求、Superpowers 执行方法、CodeGraph 代码证据和 Comet 状态自动化串成一条闭环。

OpenSpec 处理 **WHAT**：提案、delta spec、生命周期元数据和归档同步。

Superpowers 处理 **HOW**：头脑风暴、设计文档、实现计划、TDD、代码评审和收尾。

CodeGraph 处理 **WHERE**：代码索引、调用关系、影响面提示、定向源码摘录和架构图。

Comet 是包在它们外层的 harness：负责安装技能、连接脚本、记录阶段状态、生成代码证据，并让 `/comet` 能从正确步骤继续，而不是让 agent 每次重新理解整个项目。

## Comet 是什么

Comet 是一个工作流 harness，不是单个 prompt，也不是组件库。它协调四层能力：

| 层 | 职责 | 主要产物 |
| --- | --- | --- |
| OpenSpec | 需求与 spec 生命周期 | `openspec/changes/<name>/proposal.md`、`design.md`、`tasks.md`、`specs/` |
| Superpowers | 工程方法与执行纪律 | `docs/superpowers/specs/`、`docs/superpowers/plans/` |
| CodeGraph | CodeGraph 证据层，用于理解本地代码 | `.codegraph/codegraph.db`、`.codegraph/architecture.mmd`、`openspec/.comet/codegraph-context.md` |
| Comet 脚本 | 状态机、守护、交接、归档和 CodeGraph context 导出 | `.comet.yaml`、`comet-*.sh` |

主入口 `/comet` 会检测活跃的 OpenSpec change，读取 `.comet.yaml`，识别当前阶段，刷新所需代码证据，再分派到正确的阶段 skill。它适合长任务：中途关闭 AI 编码会话后，再次运行 `/comet` 可以从记录的阶段继续，而不是依赖上下文记忆。

## 工作原理

Comet 会把需求、执行计划和本地代码证据连接起来：

1. `/comet-open` 创建或恢复 OpenSpec change，并写入 Comet 工作流状态。
2. `/comet-design` 基于 OpenSpec 制品生成更深入的 Superpowers 设计文档，并使用 CodeGraph context 作为代码证据。
3. `/comet-build` 生成实现计划，要求用户选择隔离方式和执行方式，然后按计划实现。
4. `/comet-verify` 要求可追溯的验证证据，满足条件后才允许通过阶段。
5. `/comet-archive` 将 delta specs 同步回 main specs，标注关联文档，归档 change，并刷新 CodeGraph 索引。

每个需要理解代码的阶段都会使用 `comet-codegraph-context.sh` 生成 `COMET_CODEGRAPH_CONTEXT_FILE`（默认是 `openspec/.comet/codegraph-context.md`）。CodeGraph context 是主要代码证据，会被传给 OpenSpec 和 Superpowers；agent 应优先使用关系分析、影响面、受影响测试和定向源码摘录，再按需读取源码。

## 安装

前置要求：

- Node.js 20+
- npm/npx
- Git
- 可运行 bash 的 shell 环境（Windows 用户建议使用 Git Bash 或等价环境）

```bash
npm install -g @rpamis/comet
```

## 快速开始

```bash
cd your-project
comet init
```

`comet init` 会：

1. 提示你选择 AI 平台（自动检测已有配置）
2. 选择安装范围：项目级（当前目录）或全局（用户主目录）
3. 选择 Comet 技能语言：中文（默认）或 English
4. 安装 CodeGraph CLI 依赖并初始化代码证据能力
5. 默认生成 `.codegraph/architecture.mmd`，除非传入 `--skip-viz`
6. 安装 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 技能
7. 安装 [Superpowers](https://github.com/obra/superpowers) 技能
8. 将 Comet 技能（你选择的语言）部署到所选平台
9. 在项目级安装时创建 `docs/superpowers/specs/` 和 `docs/superpowers/plans/` 工作目录

初始化后，在你的 AI 编码 Agent 中启动一个 change：

```text
/comet "your idea"
```

对于存量项目，可以先运行 `/comet-scan`，让 CodeGraph 建立上下文，并让 OpenSpec 基于已确认的代码证据探索现有能力。

> [!TIP]
> 更新版本号
>
> 执行 `comet update` 或者 `npm install -g @rpamis/comet@latest` 即可更新到最新版本。

## 对OpenClaw和Hermes、或其他AI平台的支持

对于直接使用通用 `skills` CLI 的平台，可以用下面的方式安装 Comet skill 包：

```bash
npx skills add rpamis/comet
```

## CLI命令

<details>
<summary><code>comet init [path]</code> — 初始化 Comet 工作流</summary>

为选定的 AI 编码平台初始化 OpenSpec、Superpowers 和 Comet 技能。

| 选项 | 描述 |
|--------|-------------|
| `--yes` | 非交互模式，自动选择已检测平台（未检测到则选择全部） |
| `--scope <scope>` | 安装范围：`project` 或 `global` |
| `--language <lang>` | Skill 语言：`zh`（默认）或 `en` |
| `--skip-viz` | 跳过 CodeGraph 架构图生成 |
| `--skip-existing` | 跳过已安装的组件 |
| `--overwrite` | 覆盖已安装的组件 |
| `--json` | 输出结构化 JSON |

当同一平台检测到多个已安装组件时，交互式 init 会先提供一次批量选择：全部覆盖、全部跳过，或逐项选择。

</details>

<details>
<summary><code>comet status [path]</code> — 显示活跃更改和下一步命令</summary>

显示活跃更改、任务进度，以及推荐的下一步 Comet 工作流命令。

| 选项 | 描述 |
|--------|-------------|
| `--json` | 输出活跃更改，并包含 `nextCommand` |

</details>

<details>
<summary><code>comet doctor [path]</code> — 诊断 Comet 安装健康状态</summary>

检查项目级/全局安装、工作目录、已安装技能、脚本和 Comet 状态文件。

| 选项 | 描述 |
|--------|-------------|
| `--json` | 输出结构化诊断结果 |
| `--scope <scope>` | 诊断 `auto`、`project` 或 `global` 范围（默认：`auto`） |

</details>

<details>
<summary><code>comet update [path]</code> — 更新 Comet 包和技能</summary>

更新 npm 包，并刷新已检测到的项目级/全局 Comet 技能。

| 选项 | 描述 |
|--------|-------------|
| `--json` | 以 JSON 输出 npm 和 skill 更新结果 |
| `--language <lang>` | 覆盖自动检测到的 skill 语言 (`en`, `zh`) |
| `--scope <scope>` | 仅更新 `global` 或 `project` 范围 |

</details>

| 命令 | 描述 |
|---------|-------------|
| `comet --help` | 显示帮助 |
| `comet --version` | 显示版本 |

## 支持平台

`comet init` 支持 28 个 AI 编码平台：

<details>
<summary>查看完整平台列表</summary>

| 平台 | 技能目录 | 平台 | 技能目录 |
|----------|-----------|----------|-----------|
| Claude Code | `.claude/` | Cursor | `.cursor/` |
| Codex | `.codex/` | OpenCode | `.opencode/` |
| Windsurf | `.windsurf/` | Cline | `.cline/` |
| RooCode | `.roo/` | Continue | `.continue/` |
| GitHub Copilot | `.github/` | Gemini CLI | `.gemini/` |
| Amazon Q Developer | `.amazonq/` | Qwen Code | `.qwen/` |
| Kilo Code | `.kilocode/` | Auggie | `.augment/` |
| Kiro | `.kiro/` | Lingma | `.lingma/` |
| Junie | `.junie/` | CodeBuddy | `.codebuddy/` |
| CoStrict | `.cospec/` | Crush | `.crush/` |
| Factory Droid | `.factory/` | iFlow | `.iflow/` |
| Pi | `.pi/` | Qoder | `.qoder/` |
| Antigravity | `.agents/` | Bob Shell | `.bob/` |
| ForgeCode | `.forge/` | Trae | `.trae/` |

</details>

部分平台的项目级目录和全局目录不同。例如 OpenCode 全局安装使用 `.config/opencode`，Lingma 全局安装使用 `.lingma`，Antigravity 全局安装使用 `.gemini/antigravity`。

## 技能

`comet init` 完成后，三组技能将被安装到所选平台的 `skills/` 目录：

### Comet 技能

<details>
<summary>查看 Comet 技能列表</summary>

| 技能 | 描述 |
|-------|-------------|
| `/comet` | 主入口 — 自动检测阶段并分派到子命令 |
| `/comet-open` | 阶段 1：打开变更（提案、设计、任务分解） |
| `/comet-design` | 阶段 2：深度设计（头脑风暴、设计文档） |
| `/comet-build` | 阶段 3：规划与构建（实现计划、代码提交） |
| `/comet-verify` | 阶段 4：验证与完成（测试、验证报告） |
| `/comet-archive` | 阶段 5：归档（delta spec 同步、状态标注） |
| `/comet-hotfix` | 快捷路径：快速 bug 修复（跳过头脑风暴，不需要能力设计） |
| `/comet-tweak` | 快捷路径：小改动（文案调整、配置调整、文档或 Prompt 优化） |
| `/comet-scan` | 存量项目扫描：CodeGraph 索引 + OpenSpec explore 生成现有 spec |

</details>

### 守护与自动化脚本

<details>
<summary>查看脚本列表</summary>

| 脚本 | 用途 |
|--------|---------|
| `comet-env.sh` | 脚本发现助手 — 导出 `COMET_GUARD`、`COMET_STATE`、`COMET_HANDOFF`、`COMET_ARCHIVE` 等内置脚本路径 |
| `comet-codegraph-context.sh` | CodeGraph context 导出器 — 写入 `COMET_CODEGRAPH_CONTEXT_FILE`，包含索引状态、结构、调用关系、影响面、受影响测试和定向源码摘录 |
| `comet-guard.sh` | 阶段转换守护 — 验证退出条件，`--apply` 自动更新 `.comet.yaml` |
| `comet-handoff.sh` | 设计交接 — 从 OpenSpec 制品生成带 SHA256 追踪的确定性上下文包 |
| `comet-archive.sh` | 一键归档 — 验证状态、同步 specs、移至归档、更新状态 |
| `comet-yaml-validate.sh` | 模式校验器 — 校验 `.comet.yaml` 结构和字段值 |
| `comet-state.sh` | 统一状态管理 — init/set/get/check/scale，agent 的专属 YAML 接口 |

</details>

### OpenSpec 技能

Spec 生命周期管理：propose、explore、sync、verify、archive 等。

### Superpowers 技能

开发方法论：brainstorming、TDD、subagent-driven development、code review、plan writing 等。

### 可选上下文技能

Comet 不再内置项目专属上下文说明。可以在项目配置中声明希望 Comet 加载的任意上下文技能，例如开发规范、架构约束、组件库说明、安全要求或测试规范：

```yaml
# openspec/comet.yaml
context_skills:
  - my-development-standards
  - my-component-library
  - my-security-guidelines
```

执行 `/comet-design` 和 `/comet-build` 时，Comet 会读取 `context_skills`，并要求 agent 在设计或实现前逐个加载这些技能。若未配置 context skill，流程继续，但 agent 不得声称已遵循未提供的项目专属规范。

## CodeGraph 证据

CodeGraph 是 Comet 工作流的一等能力：

- `comet init` 会安装 `codegraph@latest`，初始化 CodeGraph 支持，并默认生成 `.codegraph/architecture.mmd`。
- `comet init --skip-viz` 会保留安装流程，但跳过架构图生成。
- `/comet-scan` 面向存量项目：先构建 CodeGraph context，再让 OpenSpec explore 基于已确认的代码证据生成 spec 草稿。
- `/comet-open`、`/comet-design`、`/comet-build`、`/comet-verify`、`/comet-hotfix` 和 `/comet-tweak` 都会在需要理解代码前生成对应阶段的 CodeGraph context。
- `comet-codegraph-context.sh` 会写入 `COMET_CODEGRAPH_CONTEXT_FILE`，默认路径是 `openspec/.comet/codegraph-context.md`。

生成的 context 包含 CodeGraph 索引状态、已索引文件结构、符号搜索、callers/callees/impact 关系、可用时的受影响测试，以及定向源码摘录。它不是为了禁止 agent 阅读源码，而是让阅读源码之前先有证据、有边界。

## 工作流

```
/comet
  ↓ auto-detect
/comet-open  -->  /comet-design  -->  /comet-build  -->  /comet-verify  -->  /comet-archive
(OpenSpec)         (Superpowers)       (Superpowers)       (Both)           (OpenSpec)

/comet-hotfix（快捷路径，跳过头脑风暴）
  open  -->  build  -->  verify  -->  archive

/comet-tweak（快捷路径，跳过头脑风暴和完整计划）
  open  -->  轻量构建  -->  轻量验证  -->  archive

/comet-scan（存量项目扫描，不进入 change 状态机）
  codegraph index  -->  OpenSpec explore  -->  现有 spec 草稿
```

### 五个阶段

| 阶段 | 命令 | 归属 | 产出物 |
|-------|---------|-------|-----------|
| 1. Open | `/comet-open` | OpenSpec | proposal.md、design.md、tasks.md |
| 2. Deep Design | `/comet-design` | Superpowers | Design Doc、delta spec |
| 3. Plan & Build | `/comet-build` | Superpowers | 实现计划、代码提交 |
| 4. Verify & Finish | `/comet-verify` | Both | 验证报告、分支处理 |
| 5. Archive | `/comet-archive` | OpenSpec | delta→main spec 同步、归档 |

### 核心原则

- **头脑风暴不可跳过** — 每个变更必须经过深度设计（hotfix/tweak 除外）
- **Delta spec 是活文档** — 在阶段 3 中可自由编辑，归档时同步
- **保持 tasks.md 同步** — 每完成一个任务就勾选
- **频繁提交** — 每个任务一个 commit，message 体现设计意图
- **先验证再归档** — `/comet-verify` 必须通过才能执行 `/comet-archive`

### 状态管理

Comet 使用解耦状态架构，YAML 文件独立管理：

| 文件 | 归属 | 用途 |
|------|-------|---------|
| `.openspec.yaml` | OpenSpec | Spec 生命周期、变更元数据 |
| `.comet.yaml` | Comet | 工作流阶段、执行模式、验证状态 |

所有状态和运行阶段都通过脚本更新，并且会在每个阶段退出前校验任务是否真实完成。相比于将复杂状态管理写在 Skill 文本中，脚本化状态机能更稳定地保障阶段流转、YAML 正确性和断点恢复；Agent 只需要通过 Comet 内置命令读取状态，就能知道当前 Spec 处于哪个阶段。

`comet-state.sh` 是 `.comet.yaml` 的写入接口；`comet-guard.sh` 负责校验并推进阶段；`comet-handoff.sh` 记录设计交接包和 hash；`comet-archive.sh` 在归档时完成同步，并随后执行 `codegraph sync`。

<details>
<summary>查看 .comet.yaml 关键字段</summary>

**`.comet.yaml` 关键字段：**

```yaml
workflow: full
phase: build
build_mode: subagent-driven-development
build_pause: null
isolation: branch
verify_mode: null
design_doc: docs/superpowers/specs/YYYY-MM-DD-topic-design.md
plan: docs/superpowers/plans/YYYY-MM-DD-feature.md
test_cases: openspec/changes/<name>/test-cases.md
verify_result: pending
verification_report: null
branch_status: pending
verified_at: null
archived: false
direct_override: false
build_command: null
verify_command: null
handoff_context: openspec/changes/<name>/.comet/handoff/design-context.json
handoff_hash: <sha256>
```

full workflow 初始化时 `build_mode`、`build_pause`、`isolation` 和 `verify_mode` 可以暂时为 `null`；进入 `build → verify` 前必须完成 `build_mode` 与 `isolation` 决策并写入合法值。`build_pause` 记录 build 阶段内部暂停点：`null` 表示无暂停，`plan-ready` 表示 plan 已生成，用户在选择隔离方式和执行方式前暂停。它不是执行方式，不得写入 `build_mode`。`test_cases` 指向当前 change 的测试/验证矩阵；条目可以是单元、集成、端到端、视觉、手动、构建、lint、可访问性或其他可追溯证据。`verification_report` 在验证报告生成前保持 `null`，`verify-pass` 要求该报告文件存在且 `branch_status: handled`。示例中 `archived` 之后的字段是可选字段或脚本派生字段：`direct_override` 只在 full workflow 直接构建时需要，项目命令未配置时可以不存在，`handoff_context` 和 `handoff_hash` 由 `comet-handoff.sh` 在离开 design 阶段前写入。项目可在 change 或仓库根配置中设置 `build_command` / `verify_command`，guard 会优先运行并打印失败输出。

</details>

### 可靠性特性

Comet 通过自动化状态转换确保 agent 执行可靠性：

<details>
<summary>查看可靠性特性</summary>

1. **入口验证** — 每个阶段在执行前验证前置条件
   - 检查文件存在、状态一致性、阶段转换
   - 验证失败时输出 `[HARD STOP]` 及可操作建议

2. **自动化状态转换** — `comet-guard.sh --apply` 自动更新 `.comet.yaml`
   - 所有阶段转换（open → design/build → verify → archive）使用 `guard --apply`
   - 无需手动状态编辑 — 消除写入验证错误
   - `comet-state.sh` 是 agent 对状态操作的专属接口
   - Guard 和 archive 脚本内部使用 `comet-state.sh` 进行状态管理

3. **模式校验** — `comet-yaml-validate.sh` 确保数据完整性
   - 校验必填字段和可选字段
   - 校验枚举值（包括 `direct_override`）
   - 校验 `design_doc`、`plan`、`handoff_context` 路径存在，并校验 `handoff_hash` 格式
   - 检测未知/拼写错误字段

4. **Build 决策强制** — Guard 和状态转换同时拦截跳过关键选择
   - `isolation` 必须是 `branch` 或 `worktree`
   - `build_mode` 必须已选择
   - `build_pause: plan-ready` 是 plan 生成后的可恢复暂停点，不是 `build_mode`
   - full workflow 的 `build_mode: direct` 必须有 `direct_override: true`

5. **验证证据强制** — Guard 在阶段流转前强制要求验证凭证
   - `verify-pass` 转换要求 `verification_report` 指向已存在的验证报告文件
   - `branch_status` 必须为 `handled` 才能通过验证
   - Guard 检查 `verification_report exists` 和 `branch_status=handled` 作为硬性前提
   - 防止验证或分支处理被跳过时产生虚假的阶段推进

6. **归档自动化** — `comet-archive.sh` 一键处理完整归档流程
   - 验证入口状态、同步 delta specs 到 main specs
   - 标注设计文档和计划文档的 frontmatter
   - 将变更移至归档目录并更新 `archived: true`
   - 支持 `--dry-run` 预览

</details>

## 项目结构

```
your-project/
├── .claude/skills/              # 平台技能目录（Comet + OpenSpec + Superpowers）
│   ├── comet/SKILL.md
│   │   └── scripts/
│   │       ├── comet-guard.sh       # 阶段转换守护（--apply 自动更新状态）
│   │       ├── comet-env.sh         # 脚本发现助手
│   │       ├── comet-codegraph-context.sh # CodeGraph context 导出器
│   │       ├── comet-handoff.sh     # 设计交接（OpenSpec → Superpowers 上下文追踪）
│   │       ├── comet-archive.sh     # 一键归档自动化
│   │       ├── comet-yaml-validate.sh # 模式校验器
│   │       └── comet-state.sh       # 统一状态管理（init/set/get/check/scale）
│   ├── comet-*/SKILL.md
│   ├── openspec-*/SKILL.md
│   └── brainstorming/SKILL.md
├── openspec/                    # OpenSpec — WHAT
│   ├── config.yaml
│   └── changes/
│       └── <name>/
│           ├── .openspec.yaml       # OpenSpec 状态
│           ├── .comet.yaml          # Comet 工作流状态（解耦）
│           ├── proposal.md
│           ├── design.md
│           ├── test-cases.md        # 当前 change 的验证矩阵
│           ├── specs/<capability>/spec.md
│           └── tasks.md
├── openspec/.comet/
│   └── codegraph-context.md         # COMET_CODEGRAPH_CONTEXT_FILE
├── .codegraph/
│   ├── codegraph.db                 # CodeGraph 索引
│   └── architecture.mmd             # 生成的架构图
└── docs/superpowers/            # Superpowers — HOW
    ├── specs/                   # 设计文档
    └── plans/                   # 实现计划
```

## 开发

贡献流程、提交规范、PR 流程，以及新增平台或 Skill 的说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。

详见 [CHANGELOG.md](CHANGELOG.md) 了解版本历史与更新。

## License

[MIT](LICENSE)
