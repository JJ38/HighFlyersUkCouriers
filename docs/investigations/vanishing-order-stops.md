# Investigation: order stops disappearing from runs

Status: **unresolved / paused** — picked back up whenever it next occurs on the
main site. This doc exists so the next session doesn't need a fresh
explanation of how the app works or what's already been ruled out.

**This is not specific to any one run.** The occurrence traced below happened
to involve a run named "South Coast", but there's no evidence the bug (if
there is one, distinct from the normal/expected behavior found so far — see
below) is tied to that run in particular. Treat "South Coast" in this doc as
"whichever run it was that time," not as a lead in itself.

## The report

Client (dispatcher) reported, more than once, that several bookings
"disappeared" off a run after being visibly present. Quote from the original
report (the run named here was South Coast on this occasion):

> 4 bookings have disappeared off the south coast run again, same person as
> last time. I thought it was me so added them back in and saw with my own
> eyes they were there but now they have gone!

Example order IDs from the one occurrence that's been traced in detail:
`49417`, `49400`, `49399`, `49325` (Firestore doc IDs: `76Jkid8s6lBa5Ugh632U`,
`2ALPr3d5kfg22qseFgLM`, `Z6iUGJ20n20jrfgCqdL7`, `ULaOfhby11g3bICiZJa4`).

## App model, for context

- **ShipmentsLogisticsManager** (`public/js/ShipmentsLogisticsManager/{Model,Controller,Components}.js`)
  is the admin/dispatcher tool. One shipment is selected at a time (e.g.
  "COLLECTION WEEK 36" or "DELIVERY WEEK 36" — collection and delivery for
  the same week are **separate shipments**, each with their own set of
  **runs**. Any given run name (e.g. "South Coast", "North East", ...)
  exists as a separate Firestore `Runs` document per shipment it appears in
  — so the same name can refer to two or more different documents at once.
  This is by design, not a bug — but it means a bare run **name** is
  ambiguous without knowing which shipment it belongs to.
- A shipment has a special run with `runName == null`, referred to as
  "Unassigned" — the holding pool for stops not currently on a named run.
- A **stop** = one leg (`collection` or `delivery`) of one order. An order
  normally has two stops, one per shipment.
- Workflow as described by the client: admin manages/calculates runs →
  assigns runs to staff → staff (via a **separate mobile app, not in this
  repo**) call customers and make changes if needed → staff finish calling →
  admin goes back to managing/recalculating to accommodate any changes.
  Only **one admin** manages runs at a time; up to 3 staff are calling
  concurrently via the mobile app.
- Sentry logging (`public/js/Sentry.js`) is called from `Model.js` on:
  `Assigned stops` (moving a stop between two runs), `Adding/Removing stops
  to/from shipment` (moving in/out of the Unassigned pool at the shipment
  level), and `Calculated route` / `Attempting to calculate route` (route
  optimisation). The **staff mobile app is not instrumented with this
  Sentry project** — its writes to Firestore are invisible to these logs.

## Theories ruled out (or de-prioritized)

1. **Two dispatchers racing on the same run.** Ruled out by the client:
   only one admin manages runs at a time, and the workflow is sequential
   (staff call, *then* admin recalculates), so the window for a genuine
   two-writer collision is small.
2. **`assignStopsToRun` / `assignStopsToShipment` / `removeStopsFromShipment`
   are not transactional** (`Model.js:1039`, `:667`, `:964` — they do a
   plain `getDocument()` read then a `writeBatch()` write, no
   compare-and-swap). This is a real, confirmed lost-update risk *in
   principle* against any concurrent writer to the same run doc — including
   the staff mobile app's own writes (e.g. it auto-unassigns a stop when an
   address changes). Given the single-admin, sequential workflow, this is
   judged **unlikely to be the frequent cause**, but it's still a latent
   risk worth hardening independently of this investigation (convert those
   three functions to `runTransaction`, matching the pattern already used
   elsewhere for similar operations).

## What the Sentry logs actually showed for the one occurrence traced (week of 2026-09-05 to 09-09)

Traced the 4 order IDs above end-to-end for that week (raw JSONL export,
`SentryLogs/sept5th-sept9th_all_columns_javascript_logs.jsonl` — the
CSV export of the same data is *not* useful, it only has `timestamp,message`
with no structured attributes).

- **2026-09-07 18:15:48** — all 4 orders' **collection** stops correctly
  assigned to the run in question (in `COLLECTION WEEK 36`). This part of
  the trace is solid (full before/after arrays present in the log).
- Over the rest of 2026-09-07, that run is recalculated **8 more times**.
  Normally you could check whether the 4 stops were still present at each
  recalculation by parsing the `requestBody` attached to each `Calculated
  route` log entry (it lists every stop label sent to the optimiser).
  **All 8 of these log entries are missing that data** — they only have
  `message` + `shipmentName`, none of `stopIds` / `runID` /
  `optimisedRouteJSON` / `requestBody`, which the *current*
  `calculateRoute()` code always logs together in one call. That
  inconsistency can't be produced by the code as it exists today — it means
  those specific log lines were emitted by an **older, less-instrumented
  version of the app**. See "Backup site" below — this is now explained.
- **2026-09-08 ~19:14–19:18** — 3 of the 4 orders' **delivery** stops get
  individually unassigned from their runs (spread across three different
  named runs, one of which was the same "South Coast" run) and then
  bulk-removed from the `DELIVERY WEEK 36` shipment entirely, via
  `removeStopsFromShipment`. **The client confirmed this is expected,
  correct behavior** — these orders hadn't been collected, so there was no
  reason to keep them on a delivery run. Note for future reference:
  `removeStopsFromShipment` only detaches the stop from the shipment's
  runs; it never touches the order's `deliveryWeek` field. The order
  document is untouched, so it's a legitimate, deliberate "cancel from
  this shipment, may be rescheduled later" action, not a data-loss bug.
  (Rescheduling to a later week still requires a separate manual edit of
  the order's `deliveryWeek` field — not confirmed to be a problem here,
  but worth keeping in mind if orders ever seem to vanish permanently
  across week boundaries.)
- **Open question, not resolved:** why the orders weren't on the
  collection run by the time collection was actually due. We don't know
  the actual scheduled collection date/time for these 4 orders, so we
  couldn't narrow the log window down to just before that point — and the
  relevant collection-run recalculation logs from that week are the ones
  missing detailed data (see above).

## New context that explains the missing log data

The client confirmed there is a **separate, known bug**: a timezone issue
somewhere in the delivery-window calculation causes some stops' computed
delivery time to be *before the run even starts*. Because this would cause
staff to quote customers the wrong arrival time, whenever this crops up
the client/staff **switch to an older backup deployment of the site**
that predates whatever change introduced it. That backup build has less
complete Sentry instrumentation, which is why some log entries during an
incident window can be missing structured fields (as seen above for the
run-recalculation events on 2026-09-07).

**This means when this bug (vanishing orders) is investigated again, the
first thing to check is which site (main vs. backup) was in use at the
time** — the field set present on `Calculated route` log entries is a
reliable tell (current main-site code always logs `stopIds`, `runID`,
`optimisedRouteJSON`, and `requestBody` together; if any are missing, it's
the backup build).

## Minor things noticed along the way (not confirmed related, but real)

- **Wrong stopType into wrong shipment, self-corrected:** at 2026-09-07
  ~20:59, the same 4 orders' `_collection` stops were briefly added to the
  **`DELIVERY WEEK 36`** shipment's Unassigned pool (`Adding stops to
  shipment`), then removed again 15 seconds later. Almost certainly a
  UI slip — the "Add Stop" widget's stop-type dropdown
  (`selectAddStopsRun` in `Controller.js`) doesn't get validated against
  the currently selected shipment, so it's possible to add a `collection`
  stop to a delivery shipment (or vice versa) with no warning.
  `assignStopsToShipment` (`Model.js:667`) has no check for this. Caught
  and undone quickly here; flagging in case it's ever not caught.
- **Run names aren't unique across shipments** (see above) — and none of
  `logAssignedStops` / `logAddStopsToShipment` / `logRemoveStopsFromShipment`
  record which shipment or run ID (`Sentry.js`) they apply to, only the
  bare run name. This made reconstructing a clean timeline from logs alone
  much harder than it should be. Adding `shipmentName` (and, for
  `logAssignedStops`, the two run document IDs) to those log calls would
  make any future investigation significantly faster.

## Next steps, whenever this recurs

1. Confirm the timezone/delivery-window bug is fixed (or get its status) so
   the client is back on the main site with full logging — the backup
   site's incomplete logs were the main blocker this time.
2. When it happens again, get, as close to real-time as possible:
   - which site was in use (main vs backup)
   - the order IDs
   - the actual scheduled collection/delivery date+time for those orders
   - a full-column JSONL Sentry export (not the summary CSV) for a window
     bracketing that date/time
3. With that, repeat the trace done here: pull every log line mentioning
   each order's Firestore doc ID, and specifically check whether the stop
   survives each `Calculated route` recalculation of the run it's on by
   comparing the `requestBody.model.shipments[].label` list before/after —
   this is the exact check that was blocked this time by incomplete logs.
4. Independent of root cause, consider hardening `assignStopsToRun`,
   `assignStopsToShipment`, and `removeStopsFromShipment` (`Model.js`) to
   use `runTransaction` instead of read-then-`writeBatch`, since they're
   currently unprotected against any concurrent writer to the same run
   (including the staff mobile app). Low priority given the current
   single-admin workflow, but cheap insurance.
