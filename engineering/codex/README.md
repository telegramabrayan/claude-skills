# codex — OpenAI Codex inside Claude Code

Vendored copy of [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc)
(Apache-2.0, © 2026 OpenAI), pinned at upstream commit `db52e28` (v1.0.6). It lets
you call Codex from a Claude Code session to review code or hand off a task.
Upstream's own documentation is kept unchanged in [`UPSTREAM_README.md`](UPSTREAM_README.md).

## What you get

| Command | What it does |
|---|---|
| `/codex:setup` | Checks that the Codex CLI is installed and signed in; can install it with npm; turns the stop-time review gate on or off |
| `/codex:review` | Read-only Codex review of the working tree or of the branch against a base ref |
| `/codex:adversarial-review` | Review that questions the design, tradeoffs and assumptions, not just defects |
| `/codex:rescue` | Hands an investigation or fix to the `codex:codex-rescue` subagent, which forwards it to Codex |
| `/codex:transfer` | Turns the current Claude Code session into a Codex thread you can resume with `codex resume` |
| `/codex:status` · `/codex:result` · `/codex:cancel` | Manage background Codex jobs |

It also includes 3 internal skills (not user-invocable), the `codex-rescue` agent, and 3 hooks:
- `SessionStart` exports the session ID and transcript path.
- `SessionEnd` shuts down the session's broker and background jobs.
- `Stop` runs the opt-in review gate.

## Requirements

- **Node.js 18.18 or later.**
- **The Codex CLI** (`npm install -g @openai/codex`), signed in with `codex login`. A ChatGPT account (the free tier works) or an OpenAI API key is enough, so the plugin follows the repo's free-tier/BYOK rule. Usage counts against your Codex limits.

## Install

```bash
/plugin marketplace add alirezarezvani/claude-skills
/plugin install codex@claude-code-skills
/reload-plugins
/codex:setup
```

## Before you turn it on

- **Your code goes to OpenAI.** Every review, rescue, and transfer sends repository content to Codex. `/codex:transfer` also sends the full Claude Code session transcript.
- **The stop-time review gate is off by default** (`stopReviewGate: false`). If you turn it on with `/codex:setup --enable-review-gate`, every time Claude stops, Codex reviews that turn. The review can block the stop and can take up to 15 minutes (the hook's timeout is 900 s).
- **Rescue can edit files.** `/codex:rescue` lets Codex run with write access in your workspace, so read its output before you trust it.

## Exceptions to this repo's conventions

This plugin breaks two rules in the root `CLAUDE.md`. Both breaks are deliberate and documented:

1. **Scripts are Node, not stdlib Python.** The runtime is about 5.3k lines of `.mjs` that talk to the Codex app-server protocol, and rewriting it in Python would mean forking upstream. The scripts use no npm dependencies at runtime, only Node built-ins. The `python_tools` counter does not count them.
2. **The scripts call a model.** The plugin exists to call Codex. This is the second documented exception to the "no LLM calls in scripts" anti-pattern, after `engineering/skillopt-sleep`. Like that one, it is not a precedent for analysis or reference skills.

**Security audit.** `skill_security_auditor.py` passes all 3 skills cleanly. On the whole plugin folder it reports 5 CRITICAL `CMD-INJECT` findings and 8 HIGH. Every CRITICAL finding is a `node:child_process` import. All of them spawn `codex`, `git` and `node` with argument arrays, and none of them use a shell, except on Windows (`shell: process.platform === "win32"`). The CI security workflow does not scan this folder because it only audits directories that contain a `SKILL.md`, which is the same situation as `skillopt-sleep`.

## Deviations from upstream

This numbered list is the authoritative record. `.claude-plugin/authoring-notes.json` only summarizes it.

1. `.claude-plugin/plugin.json` gained the `homepage`, `repository`, `license`, `skills` (`"./skills"`) and `author.url` fields, which `scripts/check_plugin_json.py` requires. `name` (`codex`) and `version` (`1.0.6`) did not change.

Everything else (scripts, hooks, skills, agent, commands, prompts, schemas, `LICENSE`, `NOTICE`, `CHANGELOG.md`) is byte-for-byte identical to upstream. Upstream's repo-level `README.md` is kept as `UPSTREAM_README.md`; its demo-video link points to a file upstream never shipped in the plugin folder. Upstream's tests, build tooling and TypeScript config were left out because the plugin does not need them at runtime.

**The plugin name must stay `codex`.** `commands/rescue.md` hard-codes the subagent type `codex:codex-rescue`, so renaming the plugin would break `/codex:rescue`.

**To re-vendor:**
1. Clone upstream fresh.
2. Copy `plugins/codex/` over this folder.
3. Keep this `README.md` and `.claude-plugin/authoring-notes.json`.
4. Re-apply deviation 1.
5. Refresh `UPSTREAM_README.md`.

## License

Apache-2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE) (© 2026 OpenAI). The changes made in this repo are listed under "Deviations from upstream" above, as Apache-2.0 §4(b) requires.
