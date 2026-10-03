# Project-local skills

Skills in this folder load automatically in every Claude Code session opened on
this repository (local or cloud), so they are available from any device.

## Vendored from emilkowalski/skills

The following 11 skills are copied verbatim from
[emilkowalski/skills](https://github.com/emilkowalski/skills) (commit `e8a175d`),
MIT License © 2026 Emil Kowalski. Each folder keeps its own copy of the upstream
`LICENSE`.

emil-design-eng, animate, find-animation-opportunities, review-animations,
improve-animations, animation-vocabulary, apple-design, prototype,
mobile-native, break-ui, pick-ui-library

Not vendored: write-swift, animate-expo, ask-sonner.

## Vendored from ibelick/ui-skills

The following 6 skills are copied verbatim from
[ibelick/ui-skills](https://github.com/ibelick/ui-skills) (commit `ebf5f26`),
MIT License © 2026 Julien Thibeaut. Each folder keeps its own copy of the
upstream `LICENSE`.

baseline-ui, create-design-md, fixing-accessibility, fixing-metadata,
fixing-motion-performance, improve-ui

Not vendored: ui-skills-root (fetches skills through the `ui-skills` npm CLI at
run time; the skills it would fetch are vendored above instead).

## Vendored from shadcn-ui/ui

`shadcn/` is copied verbatim from the official
[shadcn-ui/ui](https://github.com/shadcn-ui/ui/tree/main/skills/shadcn) repo
(commit `295a1f1`), MIT License © 2023 shadcn, with the upstream `LICENSE.md`.
It drives the `npx shadcn@latest` CLI, so a project needs Node.js to use it.

Not vendored: migrate-radix-to-base (one-off Radix → Base UI migration guide).

## Vendored from anthropics/skills

canvas-design, theme-factory and brand-guidelines are copied verbatim from
[anthropics/skills](https://github.com/anthropics/skills) (commit `8a1541c`),
Apache License 2.0 © Anthropic, PBC. Each folder keeps its upstream
`LICENSE.txt`.

## Plugins enabled for this project

`.claude/settings.json` enables this repo's own marketplace plugins plus
`frontend-design` (anthropics/claude-code), `impeccable` (pbakaus/impeccable) and
`ui-ux-pro-max` (nextlevelbuilder/ui-ux-pro-max-skill, MIT) and `figma`
(figma/mcp-server-guide, via anthropics/claude-plugins-official),
which Claude Code installs from their marketplaces at session start.
