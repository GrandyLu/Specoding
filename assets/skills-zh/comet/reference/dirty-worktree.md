# Dirty Worktree 协议

规范路径：`comet/reference/dirty-worktree.md`

本协议由所有涉及代码修改的 comet 子 skill 共享。当 agent 恢复上下文或继续执行时，必须按本协议处理未提交的工作区改动。

## 1. 检查步骤

继续或开始修改前，必须先运行以下命令：

```bash
git status --short
git diff --stat
git diff --cached --stat
git ls-files --others --exclude-standard
```

必要时再查看 `git diff` / `git diff --cached` / 新建文件内容。

随后生成 dirty worktree 的 CodeGraph 上下文，用于归因和影响面判断：

```bash
COMET_ENV="${COMET_ENV:-$(find . "$HOME"/.*/skills "$HOME/.config" "$HOME/.gemini" -path '*/comet/scripts/comet-env.sh' -type f -print -quit 2>/dev/null)}"
if [ -n "$COMET_ENV" ]; then
  . "$COMET_ENV"
  "$COMET_BASH" "$COMET_CODEGRAPH_CONTEXT" . "$COMET_CODEGRAPH_CONTEXT_FILE" dirty "<change-name-or-dirty-files>"
fi
```

归因时优先读取 `$COMET_CODEGRAPH_CONTEXT_FILE` 中的 Git Change Context、Relationship Analysis、Impact、Affected Tests、Targeted Source Excerpts 和 Callback Relationship Hints。不要全量扫描源码；只有当 CodeGraph 证据不足以判断归属时，才按 CodeGraph 指向读取少量相关文件。

## 2. 核心规则

- 用户可能不会说明自己改了哪里。只要存在 dirty worktree（包括 Git 状态里显示为 `??` 的新建文件），就先假设改动可能来自用户或混合来源
- dirty worktree 只代表代码事实，不会自动推进 `.comet.yaml` 的 `phase` 或勾选 `tasks.md`；只有完成归因、验证、同步必要文档，并通过对应阶段 guard 后，才允许推进 Comet 状态

## 3. 归因分类

将 dirty diff 分为三类：

1. **属于当前 change**：文件和内容能对应当前 change 的目标、tasks.md、plan 或 delta spec。将其纳入当前任务继续，不重复改同一处
2. **不属于当前 change**：文件或内容与当前目标无关。暂停并询问用户：并入当前 change、拆成新 change、保留不处理，或明确授权丢弃
3. **来源不确定**：无法从 diff、文档和 CodeGraph 上下文判断归属。暂停并向用户汇报文件列表和判断依据，不继续推进阶段

## 4. 常见处理模式

### 已实现但 tasks.md 未勾选

先验证实现（运行构建和测试），通过后补勾任务。不要因为任务未勾选就重做一遍，也不要因为状态文件滞后而忽略代码事实。若当前子 skill 定义了阶段特例，以子 skill 为准。

### 暗示计划或范围已变化

按当前子 skill 的升级、增量更新或回退规则处理，本协议不重复阶段特例。

### 模糊恢复意图

用户说"继续""接着跑""我改了一点""刚才不满意""重新弄""代码动过""先按现在的来"等模糊恢复意图时，按本协议处理。不要要求用户先回忆具体改了哪里。

### open/design 阶段出现代码改动

若当前仍处于 `open` 或 `design`，但 dirty worktree 已经包含代码改动，先按本协议归因，不要直接推进阶段：

- 属于当前 change 的改动：作为需求或设计输入记录到 proposal/design/spec/design doc/tasks 中；进入 build 前仍需完成对应阶段 guard
- 不属于当前 change 或来源不确定：暂停询问用户是并入当前 change、拆成新 change、保留不处理，还是明确授权丢弃
- 禁止在 open/design 阶段直接把代码改动当作已完成实现并推进到 verify

## 5. 禁令

- 禁止在未理解 dirty diff 来源时覆盖、回滚、格式化重写或忽略用户改动
- 禁止在 dirty diff 未解释清楚时判定验证通过
