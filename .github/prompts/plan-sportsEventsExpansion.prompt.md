# VNIT IG App — Full Sports & Events System Expansion Plan

## Overview

Expand from 10 hardcoded sports to the full ~80 IG event roster. This requires:

- **(A)** Expanding the existing Match system from 10→21 team-vs-team sports (16 traditional sports + 5 e-sports)
- **(B)** Creating a new `Event` model + public Events page for non-1v1 competitions (athletics, endurance, cultural, literary, art, indoor)
- **(C)** Building a centralized sports/events registry to eliminate the 6-place hardcoding problem

The 21 match-type sports keep the existing MatchCard live experience; the ~60 other events get a new public Events page with category tabs, results cards, and admin integration.

---

## Full Event Roster (from official IG images)

### TYPE: MATCH (1v1 Department vs Department) — 21 sports

#### Traditional Sports (16)
| # | Sport ID | Label | Scoring Type | Icon |
|---|----------|-------|-------------|------|
| 1 | `BADMINTON` | Badminton | SET_BASED | `racquet` |
| 2 | `BASKETBALL_BOYS` | Basketball (Boys) | GOAL_BASED | `circle-dot` |
| 3 | `BASKETBALL_GIRLS` | Basketball (Girls) | GOAL_BASED | `circle-dot` |
| 4 | `CRICKET_BOYS` | Cricket (Boys) | CRICKET | `bat` |
| 5 | `CRICKET_GIRLS` | Cricket (Girls) | CRICKET | `bat` |
| 6 | `FOOTBALL` | Football | GOAL_BASED | `football` |
| 7 | `LAWN_TENNIS` | Lawn Tennis | SET_BASED | `racquet` |
| 8 | `TABLE_TENNIS` | Table Tennis | SET_BASED | `table-tennis` |
| 9 | `VOLLEYBALL_BOYS` | Volleyball (Boys) | SET_BASED | `volleyball` |
| 10 | `THROWBALL_GIRLS` | Throwball (Girls) | SET_BASED | `volleyball` |
| 11 | `KHOKHO_BOYS` | Kho-Kho (Boys) | GOAL_BASED | `timer` |
| 12 | `KHOKHO_GIRLS` | Kho-Kho (Girls) | GOAL_BASED | `timer` |
| 13 | `TUG_OF_WAR` | Tug of War | SIMPLE | `grip-horizontal` |
| 14 | `KABADDI_BOYS` | Kabaddi (Boys) | GOAL_BASED | `shield` |
| 15 | `HANDBALL_BOYS` | Handball (Boys) | GOAL_BASED | `hand` |
| 16 | `HANDBALL_GIRLS` | Handball (Girls) | GOAL_BASED | `hand` |

#### E-Sports (5) — also department vs department bracket format
| # | Sport ID | Label | Scoring Type | Icon |
|---|----------|-------|-------------|------|
| 17 | `COUNTER_STRIKE` | Counter Strike 2 | SIMPLE | `crosshair` |
| 18 | `FIFA` | FIFA | GOAL_BASED | `gamepad-2` |
| 19 | `VALORANT` | Valorant | SIMPLE | `crosshair` |
| 20 | `BGMI` | BGMI | SIMPLE | `gamepad-2` |
| 21 | `CODM` | CODM | SIMPLE | `gamepad-2` |

### TYPE: EVENT (Non-1v1, Results-Based) — ~60 events

#### Athletics — Track (9)
| # | Event ID | Label | Metric |
|---|----------|-------|--------|
| 1 | `100M_BOYS` | 100m (Boys) | seconds |
| 2 | `100M_GIRLS` | 100m (Girls) | seconds |
| 3 | `400M_BOYS` | 400m (Boys) | seconds |
| 4 | `400M_GIRLS` | 400m (Girls) | seconds |
| 5 | `800M_BOYS` | 800m (Boys) | seconds |
| 6 | `800M_GIRLS` | 800m (Girls) | seconds |
| 7 | `4X100M_RELAY_BOYS` | 4×100m Relay (Boys) | seconds |
| 8 | `4X100M_RELAY_GIRLS` | 4×100m Relay (Girls) | seconds |
| 9 | `4X100M_RELAY_MIXED` | 4×100m Relay (Mixed) | seconds |

#### Athletics — Field (8)
| # | Event ID | Label | Metric |
|---|----------|-------|--------|
| 10 | `SHOT_PUT_BOYS` | Shot Put (Boys) | meters |
| 11 | `SHOT_PUT_GIRLS` | Shot Put (Girls) | meters |
| 12 | `DISCUS_BOYS` | Discus Throw (Boys) | meters |
| 13 | `DISCUS_GIRLS` | Discus Throw (Girls) | meters |
| 14 | `JAVELIN_BOYS` | Javelin Throw (Boys) | meters |
| 15 | `JAVELIN_GIRLS` | Javelin Throw (Girls) | meters |
| 16 | `LONG_JUMP_BOYS` | Long Jump (Boys) | meters |
| 17 | `LONG_JUMP_GIRLS` | Long Jump (Girls) | meters |

#### Athletics — Aquatics (2)
| 18 | `SWIMMING_50M_BOYS` | Swimming 50m (Boys) | seconds |
| 19 | `SWIMMING_50M_GIRLS` | Swimming 50m (Girls) | seconds |

#### Endurance (5)
| # | Event ID | Label | Metric |
|---|----------|-------|--------|
| 20 | `TRIATHLON` | Triathlon | seconds |
| 21 | `MARATHON_BOYS` | Marathon (Boys) | seconds |
| 22 | `MARATHON_GIRLS` | Marathon (Girls) | seconds |
| 23 | `CYCLING` | Cycling | seconds |
| 24 | `SLOW_CYCLING` | Slow Cycling | seconds |

#### Indoor / Mind Sports (9)
| # | Event ID | Label | Metric |
|---|----------|-------|--------|
| 25 | `POWERLIFTING_BELOW_70` | Powerlifting (below 70kg) | kg |
| 26 | `POWERLIFTING_ABOVE_70` | Powerlifting (above 70kg) | kg |
| 27 | `CHESS` | Chess | rank |
| 28 | `CARROM` | Carrom | rank |
| 29 | `DARTS_BOYS` | Darts (Boys) | points |
| 30 | `DARTS_GIRLS` | Darts (Girls) | points |
| 31 | `POKER` | Poker | rank |
| 32 | `YOGA_BOYS` | Yoga (Boys) | rank |
| 33 | `YOGA_GIRLS` | Yoga (Girls) | rank |

#### Cultural (11)
| # | Event ID | Label | Metric |
|---|----------|-------|--------|
| 34 | `DRAMATICS_STAGE` | Dramatics Stage | judged |
| 35 | `DRAMATICS_STREET` | Dramatics Street | judged |
| 36 | `VIDEO` | Video | judged |
| 37 | `RALLY` | Rally | judged |
| 38 | `STAGE_DANCE` | Stage Dance | judged |
| 39 | `BAND` | Band | judged |
| 40 | `ANTAKSHARI` | Antakshari | judged |
| 41 | `MANNEQUIN_CHALLENGE` | Mannequin Challenge | judged |
| 42 | `MERI_MARZI_PROFESSOR` | Meri Marzi (Professor) | judged |
| 43 | `FLASH_MOB` | Flash Mob | judged |
| 44 | `DANCE_FACE_OFF` | Dance Face Off | judged |

#### Art (6)
| # | Event ID | Label | Metric |
|---|----------|-------|--------|
| 45 | `CLOTH_PAINTING` | Cloth Painting | judged |
| 46 | `RANGOLI` | Rangoli | judged |
| 47 | `COLLAGE` | Collage | judged |
| 48 | `CAMPUS_DECOR` | Campus Décor | judged |
| 49 | `CARICATURE_DESIGNING` | Caricature Designing | judged |
| 50 | `MASCOT` | Mascot | judged |

#### Literary (6)
| # | Event ID | Label | Metric |
|---|----------|-------|--------|
| 51 | `JAM` | JAM | judged |
| 52 | `CREATIVE_WRITING` | Creative Writing (*4) | judged |
| 53 | `DEBATE` | Debate (*3) | judged |
| 54 | `POETRY` | Poetry (*3) | judged |
| 55 | `QUIZ` | Quiz | judged |
| 56 | `NEWSLETTER_DESIGN` | Newsletter Design | judged |

#### Social Media / Other (5)
| # | Event ID | Label | Metric |
|---|----------|-------|--------|
| 57 | `PIC_OF_THE_DAY` | Pic of the Day | judged |
| 58 | `REEL_OF_THE_DAY` | Reel of the Day | judged |
| 59 | `LETTER_DESIGN` | Letter Design | judged |
| 60 | `ZEROTH_EVENT` | Zeroth Event | judged |
| 61 | `POWER_PREDICTOR` | Power Predictor | judged |

---

## Architecture — Step by Step

### Step 1: Centralized Sports & Events Registry (Single Source of Truth)

**Create** `client/src/config/sportsRegistry.js` AND `server/config/sportsRegistry.js` (shared data, two entry points).

Each entry:
```js
{
  id: 'BASKETBALL_BOYS',
  label: 'Basketball (Boys)',
  shortCode: 'BBB',
  category: 'TEAM_SPORT',       // TEAM_SPORT | ATHLETICS | ENDURANCE | ESPORTS | INDOOR | CULTURAL | ART | LITERARY | OTHER
  type: 'MATCH',                // MATCH (1v1 dept) | EVENT (multi-dept/individual results)
  gender: 'BOYS',               // BOYS | GIRLS | MIXED | OPEN
  icon: 'trophy',               // Lucide icon name
  accentColor: '#f59e0b',
  scoringType: 'GOAL_BASED',    // GOAL_BASED | SET_BASED | CRICKET | SIMPLE | TIMED | RANKED | JUDGED
  metric: null,                 // 'seconds' | 'meters' | 'kg' | 'points' | 'judged' | null
}
```

**Eliminates hardcoding from 6 locations:**
- `server/models/Match.js` → validate against `registry.getMatchSports()`
- `client/src/components/SportBadge.jsx` → lookup from registry
- `client/src/pages/admin/ScheduleMatch.jsx` → populate from registry
- `client/src/pages/admin/LiveConsole.jsx` → populate from registry
- `client/src/config/themeConfig.js` → remove sport colors (use registry)
- `client/src/config/adminTheme.js` → remove sport themes (use registry)
- `server/models/ScoringPreset.js` → validate against registry

---

### Step 2: Expand Match Model — 10 → 21 Team Sports

**Modify** `server/models/Match.js`:
- Replace hardcoded `SPORTS` enum with dynamic validation from registry
- Sport field becomes `{ type: String, validate: fn }` instead of `enum: [...]`
- Add `gender` display field (derived from registry for filtering)

**Modify** `client/src/components/SportBadge.jsx`:
- Replace `SPORT_CONFIG` object with registry lookup
- Add fallback icon/color for unknown sports

**Modify** `client/src/pages/admin/ScheduleMatch.jsx`:
- Replace local `SPORTS` array with `registry.getMatchSports()`
- Add category grouping in the dropdown (Traditional → E-Sports)

**Modify** `client/src/pages/admin/LiveConsole.jsx`:
- Replace local sports array with registry import

**Modify** `client/src/pages/Home.jsx`:
- Replace `SPORTS_LIST` usage with `registry.getMatchSports()`
- Group filter pills by category (Sports | E-Sports)

**Modify** `client/src/pages/MatchDetail.jsx`:
- Colors/icons now from registry (no change to layout)

**Create** default `ScoringPreset` seed entries for all 21 match sports.

---

### Step 3: Create Event Model (New Backend)

**Create** `server/models/Event.js`:
```js
{
  name: String,                          // "100m Boys", "Cloth Painting"
  sport: String,                         // From registry (EVENT type only)
  category: enum [ATHLETICS, ENDURANCE, ESPORTS, INDOOR, CULTURAL, ART, LITERARY, OTHER],
  season: ObjectId → Season,
  status: enum [UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED],
  date: Date,
  venue: String,
  description: String,                   // Rules, format info

  // Results — flexible for all event types
  results: [{
    position: Number,                    // 1, 2, 3...
    department: ObjectId → Department,
    participant: String,                 // Individual name (for athletics/literary)
    score: String,                       // "10.43s", "45.2m", "Gold", "Best Paper"
    points: Number,                      // Leaderboard points to award
  }],

  // For athletics: timing/measurement
  metric: String,                        // "seconds", "meters", "kg", null for judged

  judges: [ObjectId → Admin],
  pointsAwarded: Boolean,
  notes: String,
  createdBy: ObjectId → Admin,
}
```

**Create** `server/controllers/eventController.js`:
- `createEvent` — validate sport is EVENT type in registry
- `getAllEvents` — filter by category, status, season, date range, search. Paginated. Cached 30s.
- `getEvent` — single event with populated departments
- `updateEvent` — update details, record results
- `recordResults` — dedicated endpoint to add/update result positions
- `awardEventPoints` — calculate and create PointLogs from results (idempotent)
- `deleteEvent` — with socket emission

**Create** `server/routes/eventRoutes.js`:
```
GET    /              → getAllEvents (public)
GET    /:id           → getEvent (public)
POST   /              → createEvent (protected)
PUT    /:id           → updateEvent (protected)
PUT    /:id/results   → recordResults (protected)
POST   /:id/award     → awardEventPoints (protected)
DELETE /:id           → deleteEvent (protected)
```

**Mount** in `server/server.js`: `app.use('/api/events', eventRoutes)`

**Socket events**: `eventCreated`, `eventUpdate`, `eventDeleted`, `eventResult`

---

### Step 4: Build Public Events Page

**Create** `client/src/pages/Events.jsx`:
- Hero section: "Events & Competitions" with animated category icons
- **Category tabs** (horizontal scrollable on mobile):
  - 🏃 Athletics | 🏊 Endurance | 🎮 E-Sports | 🧠 Indoor | 🎭 Cultural | 🎨 Art | 📝 Literary | 📱 Other
- **Status filter**: All | Upcoming | In Progress | Completed
- **Search bar**: Filter by event name
- **Event cards grid** using new `EventCard.jsx` component
- **Real-time**: Socket listeners for event CRUD + results
- Fetches from `GET /api/events?category=X&status=Y`

**Create** `client/src/components/EventCard.jsx`:
- Shows: Event name, category badge, status badge (with color), date + venue
- If completed: Shows podium (🥇🥈🥉) with department names + scores
- If upcoming: Shows countdown or date
- If in_progress: Pulsing "LIVE" badge
- Click → expands inline or navigates to detail view
- Theme-aware using CSS variables

**Create** `client/src/pages/EventDetail.jsx`:
- Full results table (position, department, participant, score, points)
- Event info (description, rules, judges, venue, date)
- Real-time result updates via socket
- Share button for social media

**Add routes** to `client/src/App.jsx`:
```jsx
<Route path="/events" element={<Events />} />
<Route path="/events/:id" element={<EventDetail />} />
```

**Update navigation** (header/navbar component) to add "Events" link.

---

### Step 5: Build Admin Event Management

**Create** `client/src/pages/admin/EventManager.jsx`:
- **Create tab**: Select event from registry (EVENT type), set date/venue/description
  - Category-grouped dropdown with search
  - Bulk create: "Create all Athletics events" button
- **Manage tab**: List all events with filters (category, status)
  - Inline edit: date, venue, status, description
  - Delete with confirmation
- **Results tab**: For each completed event:
  - Podium editor: add departments to positions 1st, 2nd, 3rd, participation
  - Score entry per position (time, distance, or "judged")
  - Participant name field (for individual events)
  - "Award Points" button → calls `POST /api/events/:id/award`
  - Shows point preview before awarding
- Real-time socket updates

**Add admin route** in `client/src/App.jsx`:
```jsx
<Route path="events" element={<EventManager />} />
```

**Update admin sidebar/nav** to add "Events" menu item (with category icon).

**Update** `client/src/pages/admin/AwardPoints.jsx`:
- Add "From Event" quick-link section showing recent events with un-awarded points

---

### Step 6: Update Home Page + Leaderboard

**Modify** `client/src/pages/Home.jsx`:
- Sport filter pills → pulled from registry (21 match sports, categorized)
- Add "Events" banner/card: "60+ Events across Athletics, Cultural, Art & Literary — View All →"
- Quick stats card: add "Events" count alongside matches count

**Modify** leaderboard to show category breakdown:
- The `PointLog` model already supports categories (Sports, Cultural, Literary, Technical, Arts, Other)
- The detailed standings endpoint already aggregates by category
- Frontend leaderboard could show expandable category breakdown per department

---

### Step 7: Seed Script for Full IG

**Create** `server/scripts/seedFullIG.js`:
- Creates ScoringPresets for all 21 match sports
- Creates Event entries for all ~60 events (UPCOMING status, no results yet)
- Configurable point structures per event category:
  - Athletics: 1st→10, 2nd→7, 3rd→5, Participation→1
  - Cultural/Art/Literary: 1st→15, 2nd→10, 3rd→7, Participation→2
  - Indoor: 1st→8, 2nd→5, 3rd→3

---

## File Change Summary

### New Files to Create (12)
| File | Purpose |
|------|---------|
| `client/src/config/sportsRegistry.js` | Centralized sports + events registry (frontend) |
| `server/config/sportsRegistry.js` | Centralized sports + events registry (backend) |
| `server/models/Event.js` | Event schema for non-1v1 competitions |
| `server/controllers/eventController.js` | Event CRUD + results + point awarding |
| `server/routes/eventRoutes.js` | Event API routes |
| `client/src/pages/Events.jsx` | Public events page with category tabs |
| `client/src/components/EventCard.jsx` | Event display card component |
| `client/src/pages/EventDetail.jsx` | Single event detail + results |
| `client/src/pages/admin/EventManager.jsx` | Admin event management + results recording |
| `server/scripts/seedFullIG.js` | Seed all sports/events/presets |
| `client/src/api/eventApi.js` | Frontend API functions for events |
| `client/src/components/EventBadge.jsx` | Category badge component (like SportBadge) |

### Existing Files to Modify (12)
| File | Change |
|------|--------|
| `server/models/Match.js` | Expand sport validation from 10 → 21 (dynamic from registry) |
| `server/models/ScoringPreset.js` | Expand sport validation (dynamic from registry) |
| `server/server.js` | Mount `/api/events` routes, add socket events |
| `client/src/components/SportBadge.jsx` | Replace hardcoded SPORT_CONFIG with registry lookup |
| `client/src/pages/Home.jsx` | Use registry for filter pills, add Events banner |
| `client/src/pages/admin/ScheduleMatch.jsx` | Use registry for sport dropdown |
| `client/src/pages/admin/LiveConsole.jsx` | Use registry for sport filters |
| `client/src/pages/admin/AwardPoints.jsx` | Add "From Event" quick links |
| `client/src/App.jsx` | Add /events, /events/:id public routes + admin /events route |
| `client/src/config/themeConfig.js` | Remove hardcoded sportColors (use registry) |
| `client/src/config/adminTheme.js` | Remove hardcoded sportThemes (use registry) |
| Navigation component (header/navbar) | Add "Events" link |

---

## Key Design Decisions

1. **Gender handling**: Separate sport IDs (`BASKETBALL_BOYS`, `BASKETBALL_GIRLS`) rather than a gender field on Match — simpler queries, no migration risk, clearer admin UX.

2. **E-Sports as matches**: FIFA/Valorant/CS2/BGMI/CODM use the Match model since they're department-vs-department bracket format. They appear alongside traditional sports in the MatchCard live page.

3. **Chess dual classification**: Chess appears in both Indoor (images) and existing match system. Keep as Match sport (1v1 department) since it uses the existing SimpleMatch controller. Add `CHESS` as an EVENT too only if there's a separate tournament format.

4. **Event results flexibility**: The `results` array with `position`, `department`, `participant`, `score` handles all event types — from timed athletics to judged cultural events to ranked indoor games.

5. **Point awarding**: Events use a dedicated `awardEventPoints` endpoint that reads position→points mapping from ScoringPreset (or a default mapping). This is separate from the match-based `awardPointsFromMatch` flow.

6. **Socket.io**: Events get their own socket events (`eventCreated`, `eventUpdate`, `eventResult`, `eventDeleted`) — keeps separation from match events clean.

7. **No breaking changes**: Existing 10 sports continue to work. The registry is additive. Old match data with `CRICKET` maps to `CRICKET_BOYS` via an alias system or stays as-is with backward compatibility.
