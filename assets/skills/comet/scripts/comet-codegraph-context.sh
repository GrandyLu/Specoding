#!/bin/bash
# Comet CodeGraph context exporter — build an index and write compact phase context.
# Usage: comet-codegraph-context.sh [project-path] [output-file] [mode] [hint...]

set -euo pipefail

red() { echo -e "\033[31m$1\033[0m" >&2; }
green() { echo -e "\033[32m$1\033[0m" >&2; }
yellow() { echo -e "\033[33m$1\033[0m" >&2; }

PROJECT_PATH="${1:-.}"
OUTPUT_FILE="${2:-${COMET_CODEGRAPH_CONTEXT_FILE:-openspec/.comet/codegraph-context.md}}"
MODE="${3:-scan}"
HINT=""
if [ "$#" -gt 3 ]; then
  shift 3
  HINT="$*"
fi

if ! command -v codegraph >/dev/null 2>&1; then
  red "ERROR: codegraph command not found"
  red "Install CodeGraph CLI, then rerun /comet-scan."
  exit 127
fi

PROJECT_PATH="$(cd "$PROJECT_PATH" && pwd -P)"
cd "$PROJECT_PATH"

mkdir -p "$(dirname "$OUTPUT_FILE")"
SYMBOLS_FILE="$(mktemp)"
REFS_FILE="$(mktemp)"
trap 'rm -f "$SYMBOLS_FILE" "$REFS_FILE"' EXIT

strip_ansi() {
  sed -E $'s/\x1B\\[[0-9;]*[[:alpha:]]//g'
}

collect_symbols_from_file() {
  local file="$1"
  awk '
    /^(function|method|class|constant|interface|type)[[:space:]]+/ {
      print $2
    }
  ' "$file" >> "$SYMBOLS_FILE"
}

collect_refs_from_file() {
  local file="$1"
  awk '
    /^[[:space:]]+[^[:space:]]+:[0-9]+/ {
      ref = $1
      sub(/^[[:space:]]+/, "", ref)
      n = split(ref, parts, ":")
      line = parts[n]
      path = substr(ref, 1, length(ref) - length(line) - 1)
      if (path != "" && line ~ /^[0-9]+$/) {
        print path ":" line
      }
    }
  ' "$file" >> "$REFS_FILE"
}

append_command_section() {
  local title="$1"
  shift
  local tmp_file
  tmp_file="$(mktemp)"

  {
    echo ""
    echo "## $title"
    echo ""
    echo '```text'
  } >> "$OUTPUT_FILE"

  if "$@" 2>&1 | strip_ansi > "$tmp_file"; then
    cat "$tmp_file" >> "$OUTPUT_FILE"
    collect_symbols_from_file "$tmp_file"
    collect_refs_from_file "$tmp_file"
    :
  else
    local status=$?
    cat "$tmp_file" >> "$OUTPUT_FILE"
    collect_symbols_from_file "$tmp_file"
    collect_refs_from_file "$tmp_file"
    echo "[command failed: $*] exit=$status" >> "$OUTPUT_FILE"
  fi

  echo '```' >> "$OUTPUT_FILE"
  rm -f "$tmp_file"
}

append_query_section() {
  local term="$1"
  local tmp_file
  tmp_file="$(mktemp)"

  {
    echo ""
    echo "## Symbol Search: $term"
    echo ""
    echo '```text'
  } >> "$OUTPUT_FILE"

  if codegraph query "$term" 2>&1 | strip_ansi > "$tmp_file"; then
    cat "$tmp_file" >> "$OUTPUT_FILE"
    collect_symbols_from_file "$tmp_file"
    collect_refs_from_file "$tmp_file"
  else
    local status=$?
    cat "$tmp_file" >> "$OUTPUT_FILE"
    collect_symbols_from_file "$tmp_file"
    collect_refs_from_file "$tmp_file"
    echo "[command failed: codegraph query $term] exit=$status" >> "$OUTPUT_FILE"
  fi

  echo '```' >> "$OUTPUT_FILE"
  rm -f "$tmp_file"
}

append_relation_sections() {
  {
    echo ""
    echo "## Relationship Analysis"
    echo ""
    echo "The sections below are generated from CodeGraph callers/callees/impact commands. Use them to attribute behavior to the correct caller instead of guessing from file names alone."
  } >> "$OUTPUT_FILE"

  {
    cat "$SYMBOLS_FILE" 2>/dev/null || true
    printf '%s\n' \
      summarizeDashboard summarizeProject createRouter route createMemoryStore \
      listProjects listTasks addTask createTask isOpenTask sendJson sendNotFound \
      main handler controller service repository model config validate verify build test
  } | awk 'NF && !seen[$0]++' | head -n 40 | while IFS= read -r symbol; do
    append_command_section "Callees: $symbol" codegraph callees "$symbol"
    append_command_section "Callers: $symbol" codegraph callers "$symbol"
    append_command_section "Impact: $symbol" codegraph impact "$symbol"
  done
}

append_phase_guidance() {
  {
    echo ""
    echo "## Phase Guidance"
    echo ""
    echo "- Mode: $MODE"
    if [ -n "$HINT" ]; then
      echo "- Hint: $HINT"
    fi
    echo ""
    case "$MODE" in
      scan)
        echo "Use this context to create or update specs for an existing codebase."
        ;;
      open|change)
        echo "Use this context to ground proposal/design/tasks in existing architecture and integration points."
        ;;
      design)
        echo "Use this context to ground technical design in current patterns, dependencies, and call relationships."
        ;;
      plan|build)
        echo "Use this context to choose implementation touch points. Prefer CodeGraph callers/callees/impact before reading source."
        ;;
      hotfix)
        echo "Use this context to locate the likely root cause and verify the fix scope stays small."
        ;;
      tweak)
        echo "Use this context to identify local edit targets and confirm the change does not cross module boundaries."
        ;;
      verify)
        echo "Use this context to verify implementation evidence, affected symbols, and tests without scanning the whole repository."
        ;;
      dirty)
        echo "Use this context to attribute dirty worktree changes and assess impact before deciding whether they belong to the current change."
        ;;
      *)
        echo "Use this context as the primary project code evidence for this Comet phase."
        ;;
    esac
  } >> "$OUTPUT_FILE"
}

query_terms_for_mode() {
  printf '%s\n' server route router controller handler service store storage model domain task test spec config summary index
  case "$MODE" in
    open|change|design|plan|build)
      printf '%s\n' architecture integration api interface adapter repository client middleware validation
      ;;
    hotfix)
      printf '%s\n' error exception bug fix fail failure validate guard handler test
      ;;
    tweak)
      printf '%s\n' copy docs prompt config setting label message text template
      ;;
    verify)
      printf '%s\n' verify validation assertion test coverage scenario requirement
      ;;
    dirty)
      printf '%s\n' impact dependency caller callee test affected
      ;;
  esac
  if [ -n "$HINT" ]; then
    printf '%s\n' "$HINT" | tr ' ,:/#()[]{}' '\n\n\n\n\n\n\n\n\n' | awk 'length($0) >= 3'
  fi
}

append_git_change_context() {
  {
    echo ""
    echo "## Git Change Context"
    echo ""
    echo '```text'
    git status --short 2>&1 || true
    echo ""
    git diff --stat 2>&1 || true
    echo ""
    git diff --cached --stat 2>&1 || true
    echo '```'
  } >> "$OUTPUT_FILE"

  local changed_files
  changed_files="$(git diff --name-only 2>/dev/null || true)"
  if [ -n "$changed_files" ]; then
    # shellcheck disable=SC2086
    append_command_section "Affected Tests from Dirty Files" codegraph affected $changed_files
  fi
}

append_targeted_source_excerpts() {
  {
    echo ""
    echo "## Targeted Source Excerpts"
    echo ""
    echo "These snippets are selected from CodeGraph-reported file:line references. Use them only to resolve behavior that relationship commands cannot fully express; this is not a full repository scan."
  } >> "$OUTPUT_FILE"

  awk 'NF && !seen[$0]++' "$REFS_FILE" | head -n 60 | while IFS= read -r ref; do
    local file="${ref%:*}"
    local line="${ref##*:}"

    if [ ! -f "$file" ]; then
      continue
    fi

    local start end
    start=$((line - 8))
    if [ "$start" -lt 1 ]; then
      start=1
    fi
    end=$((line + 12))

    {
      echo ""
      echo "### $file:$line"
      echo ""
      echo '```text'
      awk -v start="$start" -v end="$end" 'NR >= start && NR <= end { printf "%6d  %s\n", NR, $0 }' "$file"
      echo '```'
    } >> "$OUTPUT_FILE"
  done
}

append_callback_relationship_hints() {
  {
    echo ""
    echo "## Callback Relationship Hints"
    echo ""
    echo "These relationships are inferred from CodeGraph-directed source files when JavaScript/TypeScript functions are passed as callbacks to common higher-order APIs. Treat them as evidence hints, not CodeGraph-confirmed direct call edges."
  } >> "$OUTPUT_FILE"

  awk -F: 'NF >= 2 { line=$NF; path=substr($0, 1, length($0) - length(line) - 1); if (path != "" && !seen[path]++) print path }' "$REFS_FILE" |
    head -n 80 |
    while IFS= read -r file; do
      if [ ! -f "$file" ]; then
        continue
      fi

      awk -v file="$file" '
        function trim(value) {
          sub(/^[[:space:]]+/, "", value)
          sub(/[[:space:]]+$/, "", value)
          return value
        }
        function emit_edge(method, callback) {
          callback = trim(callback)
          if (callback ~ /^[A-Za-z_$][A-Za-z0-9_$]*$/) {
            caller = current
            if (caller == "") {
              caller = "<unknown>"
            }
            printf "- %s -> %s via .%s() callback (%s:%d)\n", caller, callback, method, file, NR
          }
        }
        {
          line = $0
          if (line ~ /^[[:space:]]*(async[[:space:]]+)?function[[:space:]]+[A-Za-z_$][A-Za-z0-9_$]*[[:space:]]*\(/) {
            current = line
            sub(/^[[:space:]]*(async[[:space:]]+)?function[[:space:]]+/, "", current)
            sub(/[[:space:]]*\(.*/, "", current)
          } else if (line ~ /^[[:space:]]*(const|let|var)[[:space:]]+[A-Za-z_$][A-Za-z0-9_$]*[[:space:]]*=[[:space:]]*(async[[:space:]]*)?(\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)[[:space:]]*=>/) {
            current = line
            sub(/^[[:space:]]*(const|let|var)[[:space:]]+/, "", current)
            sub(/[[:space:]]*=.*/, "", current)
          }

          rest = line
          while (match(rest, /\.(filter|map|find|findIndex|some|every|reduce|reduceRight|flatMap|forEach|then|catch|finally)[[:space:]]*\([[:space:]]*[A-Za-z_$][A-Za-z0-9_$]*/)) {
            segment = substr(rest, RSTART, RLENGTH)
            method = segment
            sub(/^\./, "", method)
            sub(/[[:space:]]*\(.*/, "", method)
            callback = segment
            sub(/^.*\([[:space:]]*/, "", callback)
            emit_edge(method, callback)
            rest = substr(rest, RSTART + RLENGTH)
          }
        }
      ' "$file"
    done |
    awk 'NF && !seen[$0]++ { print }' |
    {
      matched=0
      while IFS= read -r line; do
        if [ "$matched" -eq 0 ]; then
          echo "" >> "$OUTPUT_FILE"
        fi
        matched=1
        echo "$line" >> "$OUTPUT_FILE"
      done
      if [ "$matched" -eq 0 ]; then
        {
          echo ""
          echo "- No named callback references detected in CodeGraph-directed source files."
        } >> "$OUTPUT_FILE"
      fi
    }
}

cat > "$OUTPUT_FILE" <<EOF
# Comet CodeGraph Context

Generated by Comet from CodeGraph CLI output.

- Project: $PROJECT_PATH
- Mode: $MODE
- Hint: ${HINT:-none}
- Index DB: $PROJECT_PATH/.codegraph/codegraph.db
- Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

Use this file as the primary codebase evidence for Comet/OpenSpec/Superpowers workflows. Read source files only when this context points to them or when a specific behavior remains ambiguous.
EOF

append_phase_guidance
append_command_section "Index Output" codegraph index "$PROJECT_PATH"
append_command_section "Index Status" codegraph status "$PROJECT_PATH"
append_command_section "Indexed File Structure" codegraph files

if [ "$MODE" = "verify" ] || [ "$MODE" = "dirty" ]; then
  append_git_change_context
fi

query_terms_for_mode | awk 'NF && !seen[$0]++' | head -n 80 | while IFS= read -r term; do
  append_query_section "$term"
done

append_relation_sections
append_callback_relationship_hints
append_targeted_source_excerpts

green "CodeGraph context written: $OUTPUT_FILE"
