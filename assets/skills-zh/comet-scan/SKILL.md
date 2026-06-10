---
name: comet-scan
description: "Comet 存量项目扫描。用 /comet-scan 调用。先运行 codegraph index 生成当前项目代码结构，再调用 OpenSpec explore 为存量项目沉淀 spec 文档。"
---

# Comet 存量项目扫描

`/comet-scan` 用于给已有项目建立代码结构索引，并把存量行为沉淀为 OpenSpec 文档。它不是变更开发流程的一环，不创建 `.comet.yaml`，也不进入 `open → design → build → verify → archive` 状态机。

## 适用场景

- 初次接入 Comet/OpenSpec 的存量项目
- 需要先理解代码结构，再整理现有能力规格
- 想生成项目级 spec 文档，而不是启动一个新 change

## 流程

开始前先定位 Comet 脚本：

```bash
COMET_ENV="${COMET_ENV:-$(find . "$HOME"/.*/skills "$HOME/.config" "$HOME/.gemini" -path '*/comet/scripts/comet-env.sh' -type f -print -quit 2>/dev/null)}"
if [ -z "$COMET_ENV" ]; then
  echo "ERROR: comet-env.sh not found. Ensure the comet skill is installed." >&2
  return 1
fi
. "$COMET_ENV"
```

### 1. 生成 CodeGraph 上下文

先检查 CodeGraph CLI：

```bash
command -v codegraph
```

如果命令不存在，**必须使用 AskUserQuestion 工具暂停并询问用户是否安装 CodeGraph CLI**。不得直接安装，也不得只输出文字后继续。

- 用户同意：运行 `npm install -g codegraph@latest`，然后再次执行 `command -v codegraph` 验证
- 用户拒绝：停止 `/comet-scan`，说明无法继续，因为 scan 必须依赖 CodeGraph 产物

CodeGraph 可用后，在项目根目录运行：

```bash
"$COMET_BASH" "$COMET_CODEGRAPH_CONTEXT" .
```

该脚本会先执行 `codegraph index`，再把 CodeGraph 的 `status`、`files`、`query`、`callers`、`callees`、`impact` 等产物写入：

```text
openspec/.comet/codegraph-context.md
```

后续 OpenSpec explore 必须优先读取该文件。尤其要先查看 `Relationship Analysis` 小节，用 `callers` / `callees` / `impact` 结果判断调用归属；不要仅凭文件名或 `query` 搜索结果推断。若对象方法或动态调用没有被 CodeGraph 关系命令索引，继续查看 `Targeted Source Excerpts` 小节，该小节只截取 CodeGraph 指向的 `file:line` 附近源码。不要全量扫描仓库源码。

### 2. 调用 OpenSpec Explore

**立即执行：** 使用 Skill 工具加载 `openspec-explore` 技能。若当前平台把 OpenSpec 命令显示为冒号形式，等价命令是 `/openspec:explore`。禁止跳过此步骤。

技能加载时，ARGUMENTS 必须包含：

```text
Language: 使用触发本次工作流的用户请求语言输出。
Goal: 基于 openspec/.comet/codegraph-context.md 梳理存量项目的能力、领域对象、关键流程和边界条件，生成或补充项目现有 spec 文档。不要创建新的 change，除非用户明确要求。
Inputs: openspec/.comet/codegraph-context.md。必须优先使用其中的 Relationship Analysis（callers/callees/impact）判断调用关系；关系命令缺失、返回 not found，或行为仍不明确时，使用 Targeted Source Excerpts 核验具体代码；不得全量扫描仓库。
```

探索时优先从 CodeGraph 产物中的结构入口、符号搜索结果、调用关系和定向源码摘录展开。生成 spec 时应区分已确认行为与推断行为；推断内容必须标注为待确认。如果 `callers/callees` 与源码细节不一致，以定向源码摘录或按需读取的源码事实为准，并在 spec 中写清楚证据来源。

## 退出条件

- `codegraph index` 已成功运行
- `openspec/.comet/codegraph-context.md` 已生成并被用作主要输入
- 已调用 `openspec-explore`
- 已产出或更新存量项目 spec 草稿
- 对未确认推断、缺失测试或代码结构盲区给出清单
