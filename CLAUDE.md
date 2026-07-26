# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

High Flyers UK Couriers. PHP backend (Slim framework, Twig, Doctrine, Guzzle,
Firebase, Monolog, PHPMailer — see `vendor/`) with a JS frontend build
(Firebase SDK, Sentry — see `node_modules/`). Pricing logic includes
postcode- and species-based rate tables (`public/js/tests/testData/`).

This is a public-facing website. Treat every request handler, form, and
endpoint as reachable by untrusted users.

This file is a starting point — expand the sections below as the codebase
and its conventions become clearer (build/test commands, directory layout,
coding standards) rather than leaving them generic.

## JavaScript style guide

Follow the conventions found in `public/js/ShipmentsLogisticsManager/Model.js`
for any new or edited frontend JS:

- Blank line after every block-opening brace and before every closing
  brace: `if(...){`, `for(...){`, `function foo(){`, `try{`.
- No space before `(` in control statements or function calls/declarations:
  `if(x){`, `for(let i = 0; ...){`, `function foo(){`.
- Declare `let`/`const` at the top of a function, before the logic that
  uses them.
- Prefer plain `for(let i = 0; i < arr.length; i++)` loops over
  `for...of`/`.forEach`; array methods (`.filter`, `.find`, `.map`) are
  used for simple transforms/lookups.
- Standard error shape: `try{ ... }catch(e){ console.log(e); return
  false; }`. Functions that can fail return `false` rather than throwing.
- Named top-level `function foo(){}` declarations for standalone helpers;
  arrow functions for callbacks and simple exported one-liners.
- 2-space indentation.

## Working style

- **Stay on task.** Only do what was asked. If you notice an unrelated bug,
  smell, or improvement opportunity, mention it rather than fixing it
  unprompted. Don't expand scope mid-task.
- **Small, incremental changes.** Prefer touching the smallest possible
  surface area to satisfy the request. Don't refactor, rename, or
  reorganize code that isn't part of the task. Land one coherent change at
  a time rather than bundling unrelated edits together.
- **One layer at a time when a change spans frontend and backend.** If a
  task naturally splits into a client-side change and a server-side change
  (e.g. a UI restriction plus the matching backend/auth enforcement),
  implement and hand back only one layer first so the user can review and
  test it before the next lands. Say plainly which layer you implemented
  and which is still outstanding, and wait to be asked before doing the
  next one — don't do both because the plan mentioned both.
- **Show the plan before changing anything.** Before editing files, lay out
  the concrete steps you intend to take (which files, what kind of change,
  why) and get explicit approval before making the changes. Don't just
  narrate broadly — be specific enough that "yes, go ahead" is a real,
  informed approval.
- **Write tests where appropriate.** New logic (especially pricing/rate
  calculations, request handlers, and anything with edge cases) should come
  with tests. Match whatever test framework/style already exists in the
  repo; don't introduce a second testing approach without asking. Skip
  tests only when the change genuinely doesn't warrant one (e.g. pure
  formatting, config tweaks) and say so.
- **No unrequested extras.** No speculative abstractions, no
  backwards-compatibility shims for code that can just be changed, no
  drive-by dependency upgrades.

## Security & authentication

This is a public website, so treat access control as a first-class concern,
not an afterthought:

- Whenever adding or changing a route, endpoint, form submission, or admin
  action, explicitly check whether it should require authentication /
  authorization, and call that out in the plan before implementing.
- Never assume an endpoint is "internal" or "not worth protecting" just
  because there's no obvious current caller — public URLs are reachable by
  anyone.
- Watch for the OWASP-style basics on anything touching user input:
  injection (SQL/Doctrine queries, shell), XSS in Twig templates (avoid
  disabling autoescape), CSRF on state-changing forms, and broken access
  control (e.g. IDOR — one user able to view/edit another's data).
- Keep authentication/session logic centralized; don't duplicate ad-hoc
  auth checks across handlers if a shared mechanism already exists.
- Never weaken, bypass, or comment out an existing auth check to make a
  feature "just work" — fix the actual requirement instead.

## Safety

- Never commit or push without being asked explicitly.
- Never touch secrets/credentials files (`.env`, Firebase service account
  keys, etc.) beyond what's strictly needed, and never print their
  contents into chat.
- Flag anything that looks like a real API key, credential, or PII before
  acting on a file that contains it.

## Verification

- After making a change, run the relevant tests/linter if one exists for
  the touched area before declaring the task done.
- If a change can't be verified (no test harness, can't run the app
  locally), say so plainly instead of assuming it works.
