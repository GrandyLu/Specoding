---
name: comet-design
description: "Comet 阶段 2：深度设计。用 /comet-design 调用。通过 brainstorming 产出 Design Doc 和 delta spec。"
---

# Comet 阶段 2：深度设计（Design）

## 前置条件

- 活跃 change 已存在（proposal.md、design.md、tasks.md）
- 无 Design Doc（`docs/superpowers/specs/` 下无对应文件）

## 步骤

### 0. 入口状态验证（Entry Check）

执行入口验证：

```bash
COMET_ENV="${COMET_ENV:-$(find . "$HOME"/.*/skills "$HOME/.config" "$HOME/.gemini" -path '*/comet/scripts/comet-env.sh' -type f -print -quit 2>/dev/null)}"
if [ -z "$COMET_ENV" ]; then
  echo "ERROR: comet-env.sh not found. Ensure the comet skill is installed." >&2
  return 1
fi
. "$COMET_ENV"
"$COMET_BASH" "$COMET_STATE" check <name> design
```

验证通过后继续 Step 1。验证失败时脚本会输出具体失败原因。

**幂等性**：所有 design 阶段操作可以安全重试。如果 `handoff_context` 和 `handoff_hash` 已存在，先确认它们与当前产物一致再决定是否重新生成。

### 1a. 生成 OpenSpec → Superpowers 交接包

**必须由脚本生成，不允许 agent 临场手写 summary 代替。**

```bash
"$COMET_BASH" "$COMET_HANDOFF" <change-name> design --write
```

脚本会生成并记录：

```
openspec/changes/<name>/.comet/handoff/design-context.json
openspec/changes/<name>/.comet/handoff/design-context.md
```

并在 `.comet.yaml` 写入：

```yaml
handoff_context: openspec/changes/<name>/.comet/handoff/design-context.json
handoff_hash: <sha256>
```

默认交接包是 **compact 可追溯摘录**，不是 agent summary：
- `design-context.json`：机器索引，包含 change、phase、canonical spec、source paths、hash
- `design-context.md`：供 Superpowers 阅读的上下文，包含脚本标记、source path、line range、sha256、确定性摘录
- 超出摘录预算时标记 `[TRUNCATED]`，并保留 Full source 路径

如确实需要全文上下文，可显式运行：

```bash
"$COMET_BASH" "$COMET_HANDOFF" <change-name> design --write --full
```

交接包来源来自 OpenSpec open 阶段产物：
- `proposal.md`：目标、动机、范围、非目标
- `design.md`：高层架构决策、方案约束
- `tasks.md`：初始任务边界
- `specs/*/spec.md`：delta 能力规格

### 1b. 执行 Brainstorming（带上下文）

先生成设计阶段 CodeGraph 上下文，用于约束 Superpowers 设计对现有代码的理解：

```bash
"$COMET_BASH" "$COMET_CODEGRAPH_CONTEXT" . "$COMET_CODEGRAPH_CONTEXT_FILE" design "<change-name>"
```

先读取 `openspec/comet.yaml` 的 `context_skills` 列表。若配置了一个或多个项目上下文 skill，必须逐个使用 Skill 工具加载；这些 skill 可提供开发规范、架构约束、内部组件 API、设计稿映射规则、安全要求、测试规范或其他项目约束。若未配置或加载后未提供有效上下文，记录“项目未配置 context skill”或“context skill 未提供有效项目上下文”，继续设计，但不得声称已遵循未提供的项目专属约束。

**立即执行：** 使用 Skill 工具加载 Superpowers `brainstorming` 技能，ARGUMENTS 包含：

```
Change: <change-name>
OpenSpec Context Pack: openspec/changes/<name>/.comet/handoff/design-context.md
Machine handoff: openspec/changes/<name>/.comet/handoff/design-context.json
CodeGraph Context: $COMET_CODEGRAPH_CONTEXT_FILE
Language: 使用触发本次工作流的用户请求语言输出；Design Doc、delta spec、提问和确认摘要均使用该语言。

OpenSpec 产物是上游事实源，不要重新定义需求，不要重写 proposal/spec。
你的任务是基于交接包和 CodeGraph Context 做深度技术设计：实现方案、技术风险、测试策略、边界条件。CodeGraph Context 是主要代码证据；不得全量扫描源码，只能在 Relationship Analysis / Impact / Targeted Source Excerpts 仍不足时按需读取少量相关文件。
如本 change 涉及项目专属规范、组件选型、组件使用、设计稿组件映射、安全要求或测试规范，优先使用 `openspec/comet.yaml` 的 `context_skills` 所配置 skill 提供的约束；不要在 Design Doc 中重复粘贴上下文 skill 全文。
如发现 OpenSpec delta spec 缺少验收场景，只能提出 Spec Patch，并回写 OpenSpec delta spec；不要在 Design Doc 中创建第二份需求 spec。

Design Doc frontmatter 必须最小化，只包含：
---
comet_change: <change-name>
role: technical-design
canonical_spec: openspec
canonical_spec_hash: <handoff_hash>
---

`canonical_spec_hash` 必须等于当前 `.comet.yaml` 的 `handoff_hash`。如果 Step 1c 回写了 OpenSpec delta spec，先重新运行 `comet-handoff.sh` 更新 hash，再创建或更新 Design Doc frontmatter。

跳过重复上下文探索，直接进入设计提问。
```

禁止跳过此步骤，禁止在未加载该技能的情况下继续。

如 Superpowers `brainstorming` 技能不可用，停止流程并提示安装或启用 Superpowers 技能，不要用普通对话替代该步骤。

技能加载后，按其指引产出设计方案（以对话形式呈现）：
- 技术方案：架构、数据流、关键技术选型与风险
- 测试策略：引用 `openspec/changes/<name>/test-cases.md`，说明哪些用例需要单元、集成、端到端、视觉、手动或其他验证证据
- 如需补充验收场景，标明将回写的 delta spec 变更

brainstorming 阶段不写入 Design Doc 文件，仅产出设计方案供 Step 1c 用户确认。确认后才创建 `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` 并回写 delta spec。

### 1c. 用户确认设计方案（阻塞点）

brainstorming 产出设计方案后，**必须使用 AskUserQuestion 工具暂停并等待用户明确确认设计方案**。不得在用户确认前创建最终 Design Doc、写入 `design_doc`、运行 design guard，或进入 `/comet-build`。也不得仅输出文字提示后继续执行。

暂停时只展示必要摘要：
- 采用的技术方案
- 关键取舍与风险
- 测试策略
- 如有 Spec Patch，列出将回写的 delta spec 变更

用户明确确认后，才继续 Step 2。若用户要求调整，继续 brainstorming 迭代，直到用户确认。

### 2. 更新 Comet 状态

如果 Step 1c 回写了 delta spec（新增或修改了 `specs/*/spec.md`），必须先重新生成 handoff 以更新 hash。然后确认 Design Doc frontmatter 的 `canonical_spec_hash` 等于最新 `handoff_hash`，再记录 design_doc 路径：

```bash
# 如有 delta spec 变更，重新生成 handoff（更新 hash）
"$COMET_BASH" "$COMET_HANDOFF" <change-name> design --write

# 记录 design_doc 路径
"$COMET_BASH" "$COMET_STATE" set <name> design_doc docs/superpowers/specs/YYYY-MM-DD-topic-design.md

# 自动流转到下一阶段
"$COMET_BASH" "$COMET_GUARD" <change-name> design --apply
```

如果没有 delta spec 变更，跳过 handoff 重新生成步骤，但 Design Doc 仍必须写入当前 `handoff_hash`。状态文件自动更新，无需手动编辑其他字段。

## 退出条件

- Design Doc 已创建并保存
- Design Doc frontmatter 包含 `comet_change`、`role: technical-design`、`canonical_spec: openspec`、`canonical_spec_hash`
- `handoff_context` 和 `handoff_hash` 已写入 `.comet.yaml`（由 guard 强制校验）
- `handoff_hash` 与当前 OpenSpec open 阶段产物一致（由 guard 强制校验）
- Design Doc 的 `canonical_spec_hash` 与当前 OpenSpec handoff hash 一致，防止 OpenSpec 与 Superpowers Design Doc 静默漂移（由 guard 强制校验）
- `design-context.md` 必须是脚本生成，且包含 source path、mode、sha256 等可追溯标记（由 guard 强制校验）
- 如有新能力或补充验收场景，OpenSpec delta spec 已创建/更新
- `design_doc` 已写入 `.comet.yaml`
- **阶段守卫**：运行 `"$COMET_BASH" "$COMET_GUARD" <change-name> design --apply`，全部 PASS 后自动流转到 `phase: build`

退出前必须使用 `--apply`：

```bash
"$COMET_BASH" "$COMET_GUARD" <change-name> design --apply
```

## 上下文压缩恢复

design 阶段在 brainstorming 过程中可能触发上下文压缩。恢复时先运行：

```bash
"$COMET_BASH" "$COMET_STATE" check <change-name> design --recover
```

脚本输出结构化恢复上下文（阶段、已完成字段、待完成字段、恢复动作）。按 Recovery action 判断下一步。

## 自动流转

退出条件满足后（包括用户确认设计方案），确保状态机状态已更新，并读取 `AUTO_TRANSITION` 值：

```bash
AUTO_TRANSITION=$("$COMET_BASH" "$COMET_STATE" get <change-name> auto_transition)
```

若 `AUTO_TRANSITION` 为空或不是 `false`，调用 `comet-build` skill 进入计划与构建阶段。

若 `AUTO_TRANSITION=false`，不要调用下一 Skill；打印：

> 状态已更新为 `phase: build`。请使用 `/comet-build` 进入计划与构建阶段。
