# Archive Mermaid Refresh Design

## Goal

Keep `.codegraph/architecture.mmd` synchronized with completed repository changes by regenerating it after a successful Comet archive.

## Scope

- Add a reusable `comet viz [path]` CLI command for architecture diagram generation.
- Reuse the same visualization entry point from `comet init` and the archive workflow.
- Refresh the diagram only after `codegraph sync` succeeds on the successful archive path.
- Update the Chinese and English `comet-archive` skills together.
- Add regression tests and release notes.

The change does not add Mermaid generation to `/comet-scan`, alter OpenSpec spec generation, or regenerate diagrams during build and verify phases.

## Architecture

The existing `generateArchitectureDiagram` module remains the single diagram generator. A small CLI command owns path resolution, non-interactive execution, output reporting, and exit behavior. `comet init` calls the same command-layer function instead of maintaining a separate invocation path.

After the archive script completes the OpenSpec archive operation and `codegraph sync`, it invokes the installed Comet CLI to regenerate `.codegraph/architecture.mmd`. This keeps CodeGraph indexing and its derived visualization adjacent while preserving the archive script as the workflow coordinator.

## Command Contract

```text
comet viz [path] [--yes] [--json]
```

- `path` defaults to the current directory.
- Output defaults to `<path>/.codegraph/architecture.mmd`.
- `--yes` disables interaction and is used by automation.
- `--json` returns a machine-readable generation result.
- A generation failure exits non-zero when the command is invoked directly.

The existing `comet init --skip-viz` option continues to suppress initialization-time visualization.

## Archive Behavior

The successful archive sequence becomes:

1. Archive the OpenSpec change.
2. Run `codegraph sync`.
3. Run `comet viz . --yes`.
4. Report the refreshed `.codegraph/architecture.mmd` artifact.

Mermaid refresh is a derived-artifact operation. If it fails, the archive remains successful and emits a clear warning with a manual recovery command. A failed `codegraph sync` keeps its existing failure behavior and does not attempt visualization from a stale index.

## Error Handling

- Missing or invalid project paths make `comet viz` fail with a non-zero exit code.
- Diagram-generation errors are printed with their underlying messages.
- If the `comet` executable is unavailable during archive, the archive emits a warning and recommends `comet viz . --yes` after restoring the CLI.
- Archive-triggered visualization failure never reverses or misreports a completed OpenSpec archive.

## Testing

- CLI tests verify default output, non-interactive execution, JSON output, and failure exit behavior.
- Init tests verify visualization still runs by default, still respects `--skip-viz`, and uses the shared command-layer function.
- Shell tests verify a successful archive runs visualization after `codegraph sync`.
- Shell tests verify visualization failure produces a warning without turning a completed archive into failure.
- Skill contract tests verify Chinese and English archive instructions describe the same refresh behavior.

## Release Handling

Before editing release metadata, compare the current branch version and Changelog against the master branch. If this branch already carries the single allowed next version, append the behavior and test notes to that entry; otherwise create only the next version above master and keep `package.json`, `assets/manifest.json`, and `CHANGELOG.md` aligned.
