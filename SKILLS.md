# Installed Design & Quality Skills

This file documents the installed AI agent skills, their pinned versions, repository sources, and a pre-installation security & capability audit covering code downloads, network access, and non-UI scope.

---

## 1. Pinned Skill Manifest

| Skill | Repository | Pinned Commit / Version | Local Target Paths | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **`frontend-design`** | [`anthropics/skills`](https://github.com/anthropics/skills) | Commit: [`dbd4588`](https://github.com/anthropics/skills/commit/dbd4588f9e1033efb41dad4bef2f7947c8993d44) | `.agents/skills/frontend-design`<br>`.claude/skills/frontend-design` | Aesthetic direction, typography, purposeful layout, anti-template |
| **`ui-ux-pro-max`** | [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Commit: [`28b3b8d`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/commit/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03) | `.agents/skills/ui-ux-pro-max`<br>`.claude/skills/ui-ux-pro-max` | Searchable local UI/UX database (palettes, fonts, UX guidelines, stacks) |
| **`impeccable`** | [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) | Commit: [`3fd443d`](https://github.com/pbakaus/impeccable/commit/3fd443d6828c8b9fefed4021e2d10528f6d7ee93)<br>Version: `4.8.0` | `.agents/skills/impeccable`<br>`.claude/skills/impeccable` | Craft floor, design audit, surface modes, refinement playbooks |
| **`deslop-ui`** | [`kmaida/deslop-skills`](https://github.com/kmaida/deslop-skills) | Commit: [`70237e1`](https://github.com/kmaida/deslop-skills/commit/70237e1ae0dfbf7bc9ab5e6e3de52c092586ca9b) | `.agents/skills/deslop-ui`<br>`.claude/skills/deslop-ui` | Context-aware catalog of AI visual tells, clichés, and fixes |

---

## 2. Pre-Installation Audit (Security, Network & Scope)

### A. `frontend-design` (Anthropic)
* **Code Download Commands:** **None.** Contains only `SKILL.md` and `LICENSE.txt`.
* **Network Access:** **Zero.** Operates purely as prompt-level guidance.
* **Non-UI Elements:** Focuses exclusively on visual hierarchy, typography, spatial composition, and UI copywriting (active voice, button verbs, empty-state direction).

### B. `ui-ux-pro-max` (Next Level Builder)
* **Code Download Commands:** **None.** Contains local Python search utilities (`scripts/search.py`, `core.py`, `design_system.py`) that query local offline CSV files in `data/`.
* **Network Access:** **Zero.** All 192 palettes, 74 font pairings, and 119 UX guidelines are stored locally in `.csv` and `.json` tables.
* **Non-UI Elements:** Includes stack-specific technical notes for 22 frameworks (e.g. Next.js bundle streaming, Flutter widget lifecycles, React re-render optimization) and layout performance budgets (CLS, main-thread jank).

### C. `impeccable` (Paul Bakaus)
* **Code Download Commands:** 
  * ⚠️ **Attention:** Section `## Setup` (line 17) references `<skill-base-dir>/scripts/impeccable context`. The documentation states: *"The launcher runs a self-contained binary that ships next to it or is downloaded once on first run; no Node or other runtime is required."*
  * **Offline Fallback:** If the launcher is blocked or network access is restricted, `SKILL.md` specifies an explicit fallback protocol: *"Launcher unavailable: On refusal or failure, send a separate message before the next tool call: 'Context loading did not run; I’ll read the existing project context directly.' Then read existing PRODUCT.md and DESIGN.md without inventing missing context."*
* **Network Access:** May attempt a one-time binary download for the launcher CLI if executed. In this project, direct file inspection of `DESIGN.md` and `PRODUCT.md` is preferred to maintain zero external network dependencies.
* **Non-UI Elements:** Includes project configuration commands (`init`, `document`, `hooks`, `doctor`) for project context synchronization and git hook triggers.

### D. `deslop-ui` (K Maida)
* **Code Download Commands:** **None.** Pure Markdown instruction files (`SKILL.md` and `reference/tells.md`).
* **Network Access:** **Zero.**
* **Non-UI Elements:** Strictly dedicated to auditing and eliminating AI UI clichés (unearned gradient text, announcement badge pills, glowing orbs, decorative pulsing dots, nested container cards).

---

## 3. Conflict Resolution & Precedence

Per project directives in `CLAUDE.md`:
> **Conflicts between a skill's advice and `DESIGN.md` or Teman Siap design rules: our rules win.**
