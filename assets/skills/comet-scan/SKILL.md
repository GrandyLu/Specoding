---
name: comet-scan
description: "Comet existing-project scan. Invoke with /comet-scan. Run codegraph index for the current project, then invoke OpenSpec explore to produce specs for the existing codebase."
---

# Comet Existing-Project Scan

`/comet-scan` indexes an existing repository and turns the observed behavior into OpenSpec documentation. It is not a change workflow phase, does not create `.comet.yaml`, and does not enter the `open → design → build → verify → archive` state machine.

## When to use

- Onboarding an existing project into Comet/OpenSpec
- Understanding code structure before writing specs
- Producing project-level specs rather than starting a new change

## Workflow

First locate the bundled Comet scripts:

```bash
COMET_ENV="${COMET_ENV:-$(find . "$HOME"/.*/skills "$HOME/.config" "$HOME/.gemini" -path '*/comet/scripts/comet-env.sh' -type f -print -quit 2>/dev/null)}"
if [ -z "$COMET_ENV" ]; then
  echo "ERROR: comet-env.sh not found. Ensure the comet skill is installed." >&2
  return 1
fi
. "$COMET_ENV"
```

### 1. Build CodeGraph Context

**Note**: CodeGraph is a required dependency. This scan depends on CodeGraph CLI output. If CodeGraph is not installed, the script will fail with an error message.

To ensure CodeGraph is available, run `comet init` first, or manually install:

```bash
npm install -g codegraph@latest
```

Then verify installation:

```bash
command -v codegraph
```

When CodeGraph is available, run from the project root:

```bash
"$COMET_BASH" "$COMET_CODEGRAPH_CONTEXT" . "$COMET_CODEGRAPH_CONTEXT_FILE" scan
```

This script runs `codegraph init` (which automatically builds the index in the latest CodeGraph version), then writes CodeGraph `status`, `files`, `query`, `callers`, `callees`, `impact`, and related output to:

```text
$COMET_CODEGRAPH_CONTEXT_FILE
```

After the CodeGraph context is ready, generate or refresh the architecture diagram:

```bash
comet viz . --yes
```

The command must succeed and write `.codegraph/architecture.mmd` before continuing to OpenSpec exploration.

OpenSpec explore must use that file as the primary input. In particular, inspect the `Relationship Analysis` section first and use `callers` / `callees` / `impact` output to attribute behavior to the correct caller. Do not infer from file names or `query` output alone. If object methods or dynamic calls are not indexed by CodeGraph relationship commands, continue to the `Targeted Source Excerpts` section; it includes only source snippets around CodeGraph-reported `file:line` references. Do not scan the whole repository source.

### 2. Invoke OpenSpec Explore

**Immediately execute:** Use the Skill tool to load the `openspec-explore` skill. If the current platform displays OpenSpec commands with colon names, the equivalent command is `/openspec:explore`. Skipping this step is prohibited.

When loading the skill, ARGUMENTS must include:

```text
Language: Use the language of the user request that triggered this workflow.
Goal: Based on , identify existing capabilities, domain objects, key flows, and edge cases, then create or update specs for the existing project. Do not create a new change unless the user explicitly asks.
Inputs: $COMET_CODEGRAPH_CONTEXT_FILE. First use its Relationship Analysis (callers/callees/impact) to determine call relationships. When relationship commands are missing, return not found, or behavior remains ambiguous, use Targeted Source Excerpts and Callback Relationship Hints to verify concrete code; do not scan the whole repository.
```

During exploration, start from the structural entry points, symbol search results, call relationships, and targeted source excerpts reported by CodeGraph. Separate confirmed behavior from inferred behavior; mark inferred content as requiring confirmation. If `callers/callees` and source-level details disagree, trust the targeted source excerpt or targeted source read and document the evidence source in the spec.

## Exit Conditions

- `codegraph index` has run successfully
- `$COMET_CODEGRAPH_CONTEXT_FILE` has been generated and used as the primary input
- `.codegraph/architecture.mmd` was generated with at least one architecture node
- `openspec-explore` has been invoked
- Existing-project spec draft has been created or updated
- Unknowns, unverified inferences, missing tests, or code-structure blind spots are listed
