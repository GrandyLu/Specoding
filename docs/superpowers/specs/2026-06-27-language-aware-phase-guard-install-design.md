# Language-Aware Phase Guard Installation

## Problem

Comet ships a Chinese phase guard as `comet-phase-guard.md` and an English phase guard as `comet-phase-guard.en.md`. Skill installation respects the selected language, but rule installation always copies `comet-phase-guard.md`. An English installation can therefore receive a Chinese rule and produce mixed-language prompts.

## Design

Keep both rule files unchanged. Make rule installation select the source by the requested Comet language:

- Chinese installations copy `comet-phase-guard.md`.
- English installations copy `comet-phase-guard.en.md`, while retaining the installed destination name `comet-phase-guard.md`.

Do not modify OpenCode, OpenSpec, Superpowers, or the Chinese Skill content. Do not add a new language policy.

## Verification

Add installation tests that assert English targets receive the English phase guard and Chinese targets continue receiving the Chinese phase guard. Run the focused Skill tests, formatting, lint, build, and full test suite before completion.

## Release Note

Record the behavior fix under the repository's existing unreleased version when that version is already greater than `master`; otherwise increment exactly one version from `master` and keep `package.json` aligned.
