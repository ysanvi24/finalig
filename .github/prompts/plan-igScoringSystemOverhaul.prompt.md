## Plan: IG Scoring System Overhaul — 78 Events with Auto-Leaderboard

The current system has 3 disconnected scoring paths (match presets with win/loss/draw, manual event points, and a judge's console) — none of which match the official IG rules. This plan replaces all of that with a **single unified scoring table** of 78 events, split into two flows: **Bracket events (1–19)** using QF→SF→LM→Final elimination across 7 matches, and **Group/Rank events (20–78)** where an admin assigns positions 1–8. Both flows auto-award position-based points (P1–P8 from the official table) to the leaderboard via `PointLog`.

---

### Step 1 — Create the Official Scoring Table (config + seed)

- Create a new file `server/config/scoringTable.js` exporting an array of all 78 events, each with: `eventNumber`, `name`, `sportId` (mapped to existing registry IDs), `type` ("BRACKET" for 1–19, "GROUP" for 20–78), `venue`, and `positions: { 1: P1, 2: P2, ..., 8: P8 }` with the exact point values from the attached images.
- Special cases: Event 61 (Flash Mob) = flat 30 pts per rule book, Event 69 (Reel-Pic) = only P1=15, Event 72 (Mascot) = all 8 get 20 pts each.
- This replaces the manual `ScoringPreset` model as the source of truth. The old `ScoringPreset` model/routes/controller stay but become unused (or removed).

### Step 2 — Refactor the `ScoringPreset` model into an `OfficialEvent` model

- Create `server/models/OfficialEvent.js` with schema: `eventNumber` (unique 1–78), `name`, `sportId`, `type` (enum: BRACKET, GROUP), `venue`, `positions` (Map of Number→Number for P1–P8), `isActive`.
- Create a seed script `server/scripts/seedOfficialEvents.js` that loads from the scoring table config and upserts all 78 events into MongoDB.
- Expose a read-only `GET /api/official-events` route so the frontend can display the full event catalog with point tables.
- **Remove or deprecate** the old `ScoringPreset` CRUD routes and admin page — presets are no longer manually editable.

### Step 3 — Add Bracket Tournament logic for 1v1 events (1–19)

- Add new fields to `server/models/Match.js`: `officialEvent` (ObjectId ref to `OfficialEvent`), `bracketRound` (enum: `QF`, `SF`, `LM`, `FINAL`), `bracketSlot` (Number 1–4).
- Create `server/controllers/bracketController.js` with:
  - **`startBracket(eventNumber)`** — Validates all 8 departments exist, creates 4 QF matches (randomised or seeded pairings), returns the bracket.
  - **`completeMatch(matchId, winner)`** — Marks match COMPLETED, then: if all QF done → auto-generate 2 SF matches from QF winners; if both SF done → auto-generate 1 LM (from SF losers) + 1 Final (from SF winners); if LM + Final both done → **determine all 8 positions** and call `awardBracketPoints()`.
  - **`awardBracketPoints(eventNumber)`** — Maps final positions (Final winner=1st, Final loser=2nd, LM winner=3rd, LM loser=4th, QF losers=5th–8th), looks up `OfficialEvent.positions`, creates `PointLog` entries, sets `pointsAwarded` on all 7 matches, emits socket `leaderboardUpdate`.
  - **`getBracket(eventNumber)`** — Returns full bracket tree (all matches with results) for the frontend visualisation.
- Add routes in `server/routes/bracketRoutes.js`: `POST /api/brackets/:eventNumber/start`, `POST /api/brackets/match/:matchId/complete`, `GET /api/brackets/:eventNumber`.

### Step 4 — Refactor Group/Rank event flow (events 20–78)

- Modify `server/controllers/eventController.js` `awardEventPoints`:
  - When admin enters results for a group event and hits "Award Points", **auto-populate `result.points`** from `OfficialEvent.positions[result.position]` instead of using the manually-typed value.
  - Admin only picks department → position (rank 1–8); the system fills in the points.
- Add a convenience endpoint `POST /api/events/:id/assign-ranks` that accepts `[{ department: ObjectId, position: 1–8 }]`, auto-fills points from the scoring table, saves results, and awards to leaderboard in one step.
- Emit socket `leaderboardUpdate` after awarding.

### Step 5 — Leaderboard controller cleanup

- In `server/controllers/leaderboardController.js`, **remove `awardMatchPoints`** (the old ScoringPreset-based win/loss/draw calculation) — bracket events now use `awardBracketPoints` from Step 3 instead.
- Keep `awardPoints` (Judge's Console) for edge cases/corrections.
- Keep `getLeaderboard`, `getDetailedLeaderboard`, `getDepartmentHistory`, `undoLastAward`, `resetLeaderboard` as-is.
- Ensure `getLeaderboard` returns department-level totals that **include all PointLogs** from both bracket awards and group event awards.

### Step 6 — Frontend: Replace Scoring Presets page with Official Events catalog

- Replace `client/src/pages/admin/ScoringPresets.jsx` with a read-only "Official Events & Scoring" page showing all 78 events in a table/grid grouped by type (Bracket vs Group), with P1–P8 columns matching the attached images.
- Add a category filter (Sports, Cultural, Art, Literary, E-Sports, etc.) and search.

### Step 7 — Frontend: Bracket Manager for 1v1 events

- Create a new admin page `client/src/pages/admin/BracketManager.jsx`:
  - Dropdown to select a bracket event (1–19).
  - "Start Bracket" button → calls `POST /api/brackets/:eventNumber/start` → displays QF matchups.
  - Visual bracket tree (QF→SF→LM→Final) showing teams, scores, winners.
  - For each match: admin sets winner (+ optional scores) → calls `POST /api/brackets/match/:matchId/complete` → next round auto-appears.
  - When Final + LM complete → shows "Points Awarded ✅" with a breakdown of P1–P8 per department.
  - Real-time socket updates for live bracket progression.

### Step 8 — Frontend: Group Event rank assignment

- Modify `client/src/pages/admin/EventManager.jsx`:
  - For group events (20–78): replace the manual "points" input with an auto-filled value from the scoring table.
  - Admin only assigns rank (1–8) per department → points column auto-populates.
  - "Award & Update Leaderboard" button → one-click flow.

### Step 9 — Validate & test end-to-end

- Create a test script `server/scripts/testScoringE2E.js` that:
  - Seeds all 78 official events.
  - Runs a full bracket for event #1 (Badminton) with all 8 departments (including ARCH and CHEMINE) through QF→SF→LM→Final, verifies leaderboard gets P1=35, P2=25, P3=15, P4=5, P5–P8=0.
  - Runs a group rank assignment for event #20 (Triathlon) with 8 departments ranked 1–8, verifies leaderboard gets 50, 35, 20, 10, 0, 0, 0, 0.
  - Runs edge cases: event #72 (Mascot, all 8 get 20 pts), event #61 (Flash Mob, flat 30), event #63 (Peace Rally, all 8 positions have points: 75, 65, 55, 50, 45, 40, 35, 30).
  - Verifies cumulative leaderboard totals after multiple events.
- Update `e2e/app.spec.js` Playwright tests for the new bracket and scoring flows.

---

### Further Considerations

1. **QF loser ordering (P5–P8):** For events where P5–P8 are all 0 this doesn't matter, but for events like Peace Rally (P5=45, P6=40, P7=35, P8=30) — should QF losers be ranked by their match scores, or assigned randomly? **Recommendation:** Let admin order QF losers by score margin, or treat them as tied at equal points.

2. **Bracket seeding vs random draw:** Should QF matchups be randomised or should admin pick pairings? **Recommendation:** Let admin choose pairings (drag-and-drop) with a "Randomise" shortcut button.

3. **Mid-bracket corrections:** What if admin enters a wrong winner mid-bracket? We'd need an "undo last bracket match" that rolls back auto-generated next-round matches. This adds complexity — should we support this in v1 or require bracket reset? **Recommendation:** Support full bracket reset + redo for v1; granular undo in v2.
