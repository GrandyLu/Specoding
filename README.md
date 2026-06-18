<p align="center">
  <a href="https://github.com/rpamis/comet/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/rpamis/comet/ci.yml?branch=master&style=flat-square&label=CI" /></a>
  <a href="https://www.npmjs.com/package/@rpamis/comet"><img alt="npm version" src="https://img.shields.io/npm/v/@rpamis/comet?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
</p>

# @rpamis/comet

> 中文版：[README-zh.md](README-zh.md)

**A script-backed workflow harness for AI coding agents** — OpenSpec requirements, Superpowers execution discipline, CodeGraph evidence, and Comet state automation in one loop.

OpenSpec handles **WHAT**: proposals, delta specs, lifecycle metadata, and archive sync.

Superpowers handles **HOW**: brainstorming, design docs, implementation plans, TDD, code review, and finish-up discipline.

CodeGraph handles **WHERE**: code indexing, relationship analysis, impact hints, targeted source excerpts, and architecture visualization.

Comet is the harness around them: it installs the skills, wires the scripts, records phase state, generates code evidence, and lets `/comet` resume the right step instead of asking the agent to reconstruct the project from scratch.

## What Comet Is

Comet is a workflow harness, not a single prompt or a component library. It coordinates four layers:

| Layer | Role | Main artifacts |
| ----- | ---- | -------------- |
| OpenSpec | Requirements and spec lifecycle | `openspec/changes/<name>/proposal.md`, `design.md`, `tasks.md`, `specs/` |
| Superpowers | Engineering method and execution discipline | `docs/superpowers/specs/`, `docs/superpowers/plans/` |
| CodeGraph | CodeGraph evidence layer for local code understanding | `.codegraph/codegraph.db`, `.codegraph/architecture.mmd`, `openspec/.comet/codegraph-context.md` |
| Comet scripts | State machine, guards, handoff, archive, and CodeGraph context export | `.comet.yaml`, `comet-*.sh` |

The main entry `/comet` detects the active OpenSpec change, reads `.comet.yaml`, identifies the current phase, refreshes the needed code evidence, and dispatches to the correct phase skill. That makes Comet useful for long-running work: after closing an AI coding session midway, running `/comet` can resume from the recorded phase instead of relying on memory.

## How It Works

Comet keeps requirements, execution plans, and local code evidence connected:

1. `/comet-open` creates or resumes an OpenSpec change and records Comet workflow state.
2. `/comet-design` turns the OpenSpec artifacts into a deeper Superpowers design doc, using CodeGraph context as code evidence.
3. `/comet-build` creates an implementation plan, asks the user to choose isolation and execution mode, then executes against the plan.
4. `/comet-verify` requires traceable verification evidence before the phase can pass.
5. `/comet-archive` syncs delta specs back to main specs, marks linked docs, archives the change, and refreshes the CodeGraph index.

Every code-aware phase uses `comet-codegraph-context.sh` to generate `COMET_CODEGRAPH_CONTEXT_FILE` (`openspec/.comet/codegraph-context.md` by default). CodeGraph context is the primary code evidence passed into OpenSpec and Superpowers: agents should prefer relationship analysis, impact output, affected tests, and targeted source excerpts before reading source files directly.

## Install

Requirements:

- Node.js 20+
- npm/npx
- Git
- Bash-compatible shell for workflow scripts (Windows users should use Git Bash or an equivalent bash environment)

```bash
npm install -g @rpamis/comet
```

## Quick Start

```bash
cd your-project
comet init
```

`comet init` will:

1. Prompt you to select AI platforms (auto-detects existing configs)
2. Choose install scope: project-level (current directory) or global (home directory)
3. Select language for Comet skills: 中文 (default) or English
4. Install the CodeGraph CLI dependency and initialize code evidence support
5. Generate `.codegraph/architecture.mmd` unless you pass `--skip-viz`
6. Install [OpenSpec](https://github.com/Fission-AI/OpenSpec) skills
7. Install [Superpowers](https://github.com/obra/superpowers) skills
8. Deploy Comet skills (in your chosen language) to selected platforms
9. Create `docs/superpowers/specs/` and `docs/superpowers/plans/` working directories for project-scope installs

After initialization, start a change from your AI coding agent:

```text
/comet "your idea"
```

For an existing project, run `/comet-scan` to build CodeGraph context and let OpenSpec explore the current codebase before you start changing behavior.

> [!TIP]
> update version
>
> `comet update` or `npm install -g @rpamis/comet@latest` to get the latest features and fixes.

## Support for OpenClaw and Hermes, and other AI platforms

For platforms that use the generic `skills` CLI directly, you can install the Comet skill package with:

```bash
npx skills add rpamis/comet
```

## Commands

<details>
<summary><code>comet init [path]</code> — Initialize Comet workflow</summary>

Initializes OpenSpec, Superpowers, and Comet skills for selected AI coding platforms.

| Option            | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `--yes`           | Non-interactive mode, auto-select detected platforms (or all if none detected) |
| `--scope <scope>` | Install scope: `project` or `global`                                           |
| `--language <lang>` | Skill language: `zh` (default) or `en`                                       |
| `--skip-viz`      | Skip CodeGraph architecture visualization generation                           |
| `--skip-existing` | Skip already installed components                                              |
| `--overwrite`     | Overwrite already installed components                                         |
| `--json`          | Output structured JSON                                                         |

When multiple existing components are found on the same platform, interactive init offers one bulk choice: overwrite all, skip all, or choose per component.

</details>

<details>
<summary><code>comet status [path]</code> — Show active changes and next workflow command</summary>

Displays active changes, task progress, and the recommended next Comet workflow command.

| Option   | Description                              |
| -------- | ---------------------------------------- |
| `--json` | Output active changes with `nextCommand` |

</details>

<details>
<summary><code>comet doctor [path]</code> — Diagnose Comet installation health</summary>

Checks project/global installation health, working directories, installed skills, scripts, and Comet state files.

| Option            | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `--json`          | Output structured diagnostic results                            |
| `--scope <scope>` | Diagnose `auto`, `project`, or `global` scope (default: `auto`) |

</details>

<details>
<summary><code>comet update [path]</code> — Update Comet package and skills</summary>

Updates the npm package and refreshes installed Comet skills in detected project/global targets.

| Option              | Description                                   |
| ------------------- | --------------------------------------------- |
| `--json`            | Output npm and skill update results as JSON   |
| `--language <lang>` | Override detected skill language (`en`, `zh`) |
| `--scope <scope>`   | Update only `global` or `project` scope       |

</details>

| Command           | Description  |
| ----------------- | ------------ |
| `comet --help`    | Show help    |
| `comet --version` | Show version |

## Supported Platforms

`comet init` supports 28 AI coding platforms:

<details>
<summary>View full platform list</summary>

| Platform           | Skills Dir   | Platform   | Skills Dir    |
| ------------------ | ------------ | ---------- | ------------- |
| Claude Code        | `.claude/`   | Cursor     | `.cursor/`    |
| Codex              | `.codex/`    | OpenCode   | `.opencode/`  |
| Windsurf           | `.windsurf/` | Cline      | `.cline/`     |
| RooCode            | `.roo/`      | Continue   | `.continue/`  |
| GitHub Copilot     | `.github/`   | Gemini CLI | `.gemini/`    |
| Amazon Q Developer | `.amazonq/`  | Qwen Code  | `.qwen/`      |
| Kilo Code          | `.kilocode/` | Auggie     | `.augment/`   |
| Kiro               | `.kiro/`     | Lingma     | `.lingma/`    |
| Junie              | `.junie/`    | CodeBuddy  | `.codebuddy/` |
| CoStrict           | `.cospec/`   | Crush      | `.crush/`     |
| Factory Droid      | `.factory/`  | iFlow      | `.iflow/`     |
| Pi                 | `.pi/`       | Qoder      | `.qoder/`     |
| Antigravity        | `.agents/`   | Bob Shell  | `.bob/`       |
| ForgeCode          | `.forge/`    | Trae       | `.trae/`      |

</details>

Some platforms use different project and global directories. For example, OpenCode global installs use `.config/opencode`, Lingma global installs use `.lingma`, and Antigravity global installs use `.gemini/antigravity`.

## Skills

After `comet init`, three groups of skills are installed to the selected platform's `skills/` directory:

### Comet Skills

<details>
<summary>View Comet skills</summary>

| Skill            | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `/comet`         | Main entry — auto-detects phase and dispatches to sub-commands |
| `/comet-open`    | Phase 1: Open a change (proposal, design, task breakdown)      |
| `/comet-design`  | Phase 2: Deep design (brainstorming, Design Doc)               |
| `/comet-build`   | Phase 3: Plan and build (implementation plan, code commits)    |
| `/comet-verify`  | Phase 4: Verify and finish (testing, verification report)      |
| `/comet-archive` | Phase 5: Archive (delta spec sync, status annotation)          |
| `/comet-hotfix`  | Preset: Quick bug fix (skips brainstorming)                    |
| `/comet-tweak`   | Preset: Small change (skips brainstorming and full plan)       |
| `/comet-scan`    | Existing-project scan: CodeGraph index + OpenSpec explore      |

</details>

### Guard & Automation Scripts

<details>
<summary>View script list</summary>

| Script                   | Purpose                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `comet-env.sh`           | Script discovery helper — exports bundled script paths such as `COMET_GUARD`, `COMET_STATE`, `COMET_HANDOFF`, and `COMET_ARCHIVE` |
| `comet-codegraph-context.sh` | CodeGraph context exporter — writes `COMET_CODEGRAPH_CONTEXT_FILE` with status, structure, relationships, impact, affected tests, and targeted excerpts |
| `comet-guard.sh`         | Phase transition guard — validates exit conditions, `--apply` auto-updates `.comet.yaml`              |
| `comet-handoff.sh`       | Design handoff — generates deterministic context packages from OpenSpec artifacts with SHA256 tracing |
| `comet-archive.sh`       | One-command archive — validates state, syncs specs, moves to archive, updates status                  |
| `comet-yaml-validate.sh` | Schema validator — validates `.comet.yaml` structure and field values                                 |
| `comet-state.sh`         | Unified state management — init/set/get/check/scale, agents' exclusive YAML interface                 |

</details>

### OpenSpec Skills

Spec lifecycle management: propose, explore, sync, verify, archive, and more.

### Superpowers Skills

Development methodology: brainstorming, TDD, subagent-driven development, code review, plan writing, and more.

### Optional Context Skills

Comet does not bundle project-specific context guidance. Configure any context skills your project wants Comet to load, such as development standards, architecture rules, component-library guidance, security requirements, or testing conventions:

```yaml
# openspec/comet.yaml
context_skills:
  - my-development-standards
  - my-component-library
  - my-security-guidelines
```

During `/comet-design` and `/comet-build`, Comet reads `context_skills` and asks the agent to load each configured skill before design or implementation. If no context skills are configured, the workflow continues, but agents must not claim compliance with project-specific guidance that was not provided.

## CodeGraph Evidence

CodeGraph is first-class in the Comet workflow:

- `comet init` installs `codegraph@latest`, initializes CodeGraph support, and generates `.codegraph/architecture.mmd` by default.
- `comet init --skip-viz` keeps the install flow but skips architecture diagram generation.
- `/comet-scan` is for existing projects: it builds CodeGraph context, then asks OpenSpec explore to draft specs from confirmed code evidence.
- `/comet-open`, `/comet-design`, `/comet-build`, `/comet-verify`, `/comet-hotfix`, and `/comet-tweak` generate phase-specific CodeGraph context before code-aware work.
- `comet-codegraph-context.sh` writes `COMET_CODEGRAPH_CONTEXT_FILE`, defaulting to `openspec/.comet/codegraph-context.md`.

The generated context includes CodeGraph index status, indexed file structure, symbol searches, callers/callees/impact relationships, affected tests when available, and targeted source excerpts. The goal is not to hide source code from the agent; it is to make code reading evidence-led and bounded.

## Workflow

```
/comet
  ↓ auto-detect
/comet-open  -->  /comet-design  -->  /comet-build  -->  /comet-verify  -->  /comet-archive
(OpenSpec)         (Superpowers)       (Superpowers)       (Both)           (OpenSpec)

/comet-hotfix (preset path, skips brainstorming)
  open  -->  build  -->  verify  -->  archive

/comet-tweak (preset path, skips brainstorming and full plan)
  open  -->  lightweight build  -->  light verify  -->  archive

/comet-scan (existing-project scan, outside the change state machine)
  codegraph index  -->  OpenSpec explore  -->  existing spec draft
```

### Five Phases

| Phase              | Command          | Owner       | Artifacts                            |
| ------------------ | ---------------- | ----------- | ------------------------------------ |
| 1. Open            | `/comet-open`    | OpenSpec    | proposal.md, design.md, tasks.md     |
| 2. Deep Design     | `/comet-design`  | Superpowers | Design Doc, delta spec               |
| 3. Plan & Build    | `/comet-build`   | Superpowers | Implementation plan, code commits    |
| 4. Verify & Finish | `/comet-verify`  | Both        | Verification report, branch handling |
| 5. Archive         | `/comet-archive` | OpenSpec    | delta→main spec sync, archive        |

### Core Principles

- **Brainstorming is non-skippable** — every change must go through deep design (except hotfix/tweak)
- **Delta specs are living documents** — freely editable during Phase 3, synced at archive
- **Keep tasks.md in sync** — check off each task as completed
- **Commit frequently** — one commit per task, message reflects design intent
- **Verify before archive** — `/comet-verify` must pass before `/comet-archive`

### State Management

Comet uses a decoupled state architecture with separate YAML files:

| File             | Owner    | Purpose                                             |
| ---------------- | -------- | --------------------------------------------------- |
| `.openspec.yaml` | OpenSpec | Spec lifecycle, change metadata                     |
| `.comet.yaml`    | Comet    | Workflow phase, execution mode, verification status |

All states and execution phases are updated via scripts, and each phase verifies that tasks are truly complete before advancing. Compared to storing complex state rules only in Skill text, this script-backed state machine gives Comet more reliable phase transitions, correct YAML, and easier breakpoint recovery; agents can read the current Spec situation through Comet's built-in commands.

`comet-state.sh` is the write interface for `.comet.yaml`; `comet-guard.sh` validates and advances phases; `comet-handoff.sh` records the design handoff package and hash; `comet-archive.sh` performs archive-time sync and then runs `codegraph sync`.

<details>
<summary>View key .comet.yaml fields</summary>

**Key Fields in `.comet.yaml`:**

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

In full workflow, `build_mode`, `build_pause`, `isolation`, and `verify_mode` may temporarily be `null`; `build_mode` and `isolation` must be resolved before `build → verify`. `build_pause` records an internal build-phase pause point: `null` means no pause, while `plan-ready` means the plan has been generated and the user paused before choosing isolation and execution mode. It is not an execution mode and must not be written into `build_mode`. `test_cases` points to the per-change verification matrix; entries may be unit, integration, end-to-end, visual, manual, build, lint, accessibility, or other traceable evidence. `verification_report` stays `null` until verification writes a report, and `verify-pass` requires that report to exist plus `branch_status: handled`. Fields after `archived` in the example are optional or script-derived: `direct_override` is only needed for full-workflow direct builds, project commands may be absent unless configured, and `handoff_context` / `handoff_hash` are recorded by `comet-handoff.sh` before leaving design. Projects can configure `build_command` / `verify_command` in the change or repo root, and guard will run those commands first and print failure output.

</details>

### Reliability Features

Comet ensures agent execution reliability through automated state transitions:

<details>
<summary>View reliability features</summary>

1. **Entry Verification** — Each phase validates preconditions before execution
   - Checks file existence, state consistency, and phase transitions
   - Outputs `[HARD STOP]` with actionable suggestions if validation fails

2. **Automated State Transitions** — `comet-guard.sh --apply` updates `.comet.yaml` automatically
   - All phase transitions (open → design/build → verify → archive) use `guard --apply`
   - No manual state editing required — eliminates write-verification errors
   - `comet-state.sh` is the agents' exclusive interface for state operations
   - Guard and archive scripts use `comet-state.sh` internally for state management

3. **Schema Validation** — `comet-yaml-validate.sh` ensures data integrity
   - Validates required and optional fields
   - Validates enum values, including `direct_override`
   - Validates `design_doc`, `plan`, and `handoff_context` paths exist, plus `handoff_hash` format
   - Detects unknown/typos fields

4. **Build Decision Enforcement** — Guard and state transitions both block skipped build choices
   - `isolation` must be `branch` or `worktree`
   - `build_mode` must be selected before leaving build
   - `build_pause: plan-ready` is a recoverable pause after plan generation, not a `build_mode`
   - Full workflow `build_mode: direct` requires `direct_override: true`

5. **Verification Evidence** — Guard enforces proof before phase advance
   - `verify-pass` transition requires `verification_report` pointing to an existing report file
   - `branch_status` must be `handled` before verify can pass
   - Guard checks `verification_report exists` and `branch_status=handled` as hard prerequisites
   - Prevents false phase advances when verification or branch handling was skipped

6. **Archive Automation** — `comet-archive.sh` handles the full archive flow in one command
   - Validates entry state, syncs delta specs to main specs
   - Annotates design doc and plan frontmatter
   - Moves change to archive directory and updates `archived: true`
   - Supports `--dry-run` for preview

</details>

## Project Structure

```
your-project/
├── .claude/skills/              # Platform skills dir (Comet + OpenSpec + Superpowers)
│   ├── comet/SKILL.md
│   │   └── scripts/
│   │       ├── comet-guard.sh       # Phase transition guard (--apply auto-updates state)
│   │       ├── comet-env.sh         # Script discovery helper
│   │       ├── comet-codegraph-context.sh # CodeGraph context exporter
│   │       ├── comet-handoff.sh     # Design handoff (OpenSpec → Superpowers context tracing)
│   │       ├── comet-archive.sh     # One-command archive automation
│   │       ├── comet-yaml-validate.sh # Schema validator
│   │       └── comet-state.sh       # Unified state management (init/set/get/check/scale)
│   ├── comet-*/SKILL.md
│   ├── openspec-*/SKILL.md
│   └── brainstorming/SKILL.md
├── openspec/                    # OpenSpec — WHAT
│   ├── config.yaml
│   └── changes/
│       └── <name>/
│           ├── .openspec.yaml       # OpenSpec state
│           ├── .comet.yaml          # Comet workflow state (decoupled)
│           ├── proposal.md
│           ├── design.md
│           ├── test-cases.md        # Per-change verification matrix
│           ├── specs/<capability>/spec.md
│           └── tasks.md
├── openspec/.comet/
│   └── codegraph-context.md         # COMET_CODEGRAPH_CONTEXT_FILE
├── .codegraph/
│   ├── codegraph.db                 # CodeGraph index
│   └── architecture.mmd             # Generated architecture diagram
└── docs/superpowers/            # Superpowers — HOW
    ├── specs/                   # Design documents
    └── plans/                   # Implementation plans
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, commit conventions, PR process, and guidance for adding platforms or skills.

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## License

[MIT](LICENSE)
