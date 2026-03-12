/**
 * VNIT IG '26 — Centralized Sports & Events Registry (Server)
 * Single source of truth for all ~80 sports and events.
 * Consumed by Match model validation, ScoringPreset model, and Event model.
 */

const MATCH_SPORTS = [
  // ─── Traditional Team Sports (16) ───
  { id: 'BADMINTON',        label: 'Badminton',           shortCode: 'BD',  category: 'TEAM_SPORT', type: 'MATCH', gender: 'OPEN',  icon: 'badminton-racket', accentColor: '#06b6d4', scoringType: 'SET_BASED',  metric: null },
  { id: 'BASKETBALL_BOYS',  label: 'Basketball (Boys)',   shortCode: 'BBB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'circle-dot',       accentColor: '#f59e0b', scoringType: 'GOAL_BASED', metric: null },
  { id: 'BASKETBALL_GIRLS', label: 'Basketball (Girls)',  shortCode: 'BBG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'circle-dot',       accentColor: '#f59e0b', scoringType: 'GOAL_BASED', metric: null },
  { id: 'CRICKET_BOYS',     label: 'Cricket (Boys)',      shortCode: 'CRB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'swords',           accentColor: '#22c55e', scoringType: 'CRICKET',    metric: null },
  { id: 'CRICKET_GIRLS',    label: 'Cricket (Girls)',     shortCode: 'CRG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'swords',           accentColor: '#22c55e', scoringType: 'CRICKET',    metric: null },
  { id: 'FOOTBALL',         label: 'Football',            shortCode: 'FB',  category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'goal',             accentColor: '#3b82f6', scoringType: 'GOAL_BASED', metric: null },
  { id: 'LAWN_TENNIS',      label: 'Lawn Tennis',         shortCode: 'LT',  category: 'TEAM_SPORT', type: 'MATCH', gender: 'OPEN',  icon: 'tennis-ball',      accentColor: '#84cc16', scoringType: 'SET_BASED',  metric: null },
  { id: 'TABLE_TENNIS',     label: 'Table Tennis',        shortCode: 'TT',  category: 'TEAM_SPORT', type: 'MATCH', gender: 'OPEN',  icon: 'disc-3',           accentColor: '#ef4444', scoringType: 'SET_BASED',  metric: null },
  { id: 'VOLLEYBALL_BOYS',  label: 'Volleyball (Boys)',   shortCode: 'VBB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'hexagon',          accentColor: '#eab308', scoringType: 'SET_BASED',  metric: null },
  { id: 'THROWBALL_GIRLS',  label: 'Throwball (Girls)',   shortCode: 'TBG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'hexagon',          accentColor: '#ec4899', scoringType: 'SET_BASED',  metric: null },
  { id: 'KHOKHO_BOYS',      label: 'Kho-Kho (Boys)',     shortCode: 'KKB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'zap',              accentColor: '#14b8a6', scoringType: 'GOAL_BASED', metric: null },
  { id: 'KHOKHO_GIRLS',     label: 'Kho-Kho (Girls)',    shortCode: 'KKG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'zap',              accentColor: '#14b8a6', scoringType: 'GOAL_BASED', metric: null },
  { id: 'TUG_OF_WAR',       label: 'Tug of War',         shortCode: 'TOW', category: 'TEAM_SPORT', type: 'MATCH', gender: 'MIXED', icon: 'grip-horizontal',  accentColor: '#a855f7', scoringType: 'SIMPLE',     metric: null },
  { id: 'KABADDI_BOYS',     label: 'Kabaddi (Boys)',      shortCode: 'KBB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'shield',           accentColor: '#a855f7', scoringType: 'GOAL_BASED', metric: null },
  { id: 'HANDBALL_BOYS',    label: 'Handball (Boys)',     shortCode: 'HBB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'hand',             accentColor: '#f97316', scoringType: 'GOAL_BASED', metric: null },
  { id: 'HANDBALL_GIRLS',   label: 'Handball (Girls)',    shortCode: 'HBG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'hand',             accentColor: '#f97316', scoringType: 'GOAL_BASED', metric: null },
  { id: 'FUTSAL_GIRLS',     label: 'Futsal (Girls)',      shortCode: 'FSG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'goal',             accentColor: '#ec4899', scoringType: 'GOAL_BASED', metric: null },
  { id: 'VOLLEYBALL_GIRLS', label: 'Volleyball (Girls)',  shortCode: 'VBG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'hexagon',          accentColor: '#ec4899', scoringType: 'SET_BASED',  metric: null },
  { id: 'KABADDI_GIRLS',    label: 'Kabaddi (Girls)',     shortCode: 'KBG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'shield',           accentColor: '#ec4899', scoringType: 'GOAL_BASED', metric: null },

  // ─── E-Sports (6) — bracket/tournament format ───
  { id: 'COUNTER_STRIKE',   label: 'Counter Strike 2',   shortCode: 'CS2', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'crosshair',   accentColor: '#f97316', scoringType: 'SIMPLE',     metric: null },
  { id: 'FIFA',             label: 'FIFA',               shortCode: 'FIF', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'gamepad-2',   accentColor: '#3b82f6', scoringType: 'GOAL_BASED', metric: null },
  { id: 'VALORANT',         label: 'Valorant',           shortCode: 'VAL', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'crosshair',   accentColor: '#ef4444', scoringType: 'SIMPLE',     metric: null },
  { id: 'BGMI',             label: 'BGMI',               shortCode: 'BGM', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'gamepad-2',   accentColor: '#22c55e', scoringType: 'SIMPLE',     metric: null },
  { id: 'CODM',             label: 'CODM',               shortCode: 'COD', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'gamepad-2',   accentColor: '#eab308', scoringType: 'SIMPLE',     metric: null },
  { id: 'CLASH_ROYALE',     label: 'Clash Royale',       shortCode: 'CLR', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'sword',       accentColor: '#a855f7', scoringType: 'SIMPLE',     metric: null },
];

// Backward compat aliases — old IDs → new IDs
const SPORT_ALIASES = {
  'CRICKET': 'CRICKET_BOYS',
  'BASKETBALL': 'BASKETBALL_BOYS',
  'HOCKEY': 'FOOTBALL',        // Hockey wasn't in final roster, map to Football
  'VOLLEYBALL': 'VOLLEYBALL_BOYS',
  'KHOKHO': 'KHOKHO_BOYS',
  'KABADDI': 'KABADDI_BOYS',
  // CHESS is in EVENT_SPORTS (indoor), no alias needed
};

const EVENT_SPORTS = [
  // ─── Athletics — Track (9) ───
  { id: '100M_BOYS',             label: '100m (Boys)',              shortCode: '1HB', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'BOYS',  icon: 'timer',       accentColor: '#ef4444', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '100M_GIRLS',            label: '100m (Girls)',             shortCode: '1HG', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'GIRLS', icon: 'timer',       accentColor: '#ef4444', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '400M_BOYS',             label: '400m (Boys)',              shortCode: '4HB', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'BOYS',  icon: 'timer',       accentColor: '#f59e0b', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '400M_GIRLS',            label: '400m (Girls)',             shortCode: '4HG', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'GIRLS', icon: 'timer',       accentColor: '#f59e0b', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '800M_BOYS',             label: '800m (Boys)',              shortCode: '8HB', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'BOYS',  icon: 'timer',       accentColor: '#3b82f6', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '800M_GIRLS',            label: '800m (Girls)',             shortCode: '8HG', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'GIRLS', icon: 'timer',       accentColor: '#3b82f6', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '4X100M_RELAY_BOYS',     label: '4×100m Relay (Boys)',      shortCode: 'RLB', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'BOYS',  icon: 'repeat',      accentColor: '#a855f7', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '4X100M_RELAY_GIRLS',    label: '4×100m Relay (Girls)',     shortCode: 'RLG', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'GIRLS', icon: 'repeat',      accentColor: '#a855f7', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '4X100M_RELAY_MIXED',    label: '4×100m Relay (Mixed)',     shortCode: 'RLM', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'MIXED', icon: 'repeat',      accentColor: '#a855f7', scoringType: 'TIMED',  metric: 'seconds' },

  // ─── Athletics — Field (8) ───
  { id: 'SHOT_PUT_BOYS',         label: 'Shot Put (Boys)',          shortCode: 'SPB', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'BOYS',  icon: 'circle',      accentColor: '#f97316', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'SHOT_PUT_GIRLS',        label: 'Shot Put (Girls)',         shortCode: 'SPG', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'GIRLS', icon: 'circle',      accentColor: '#f97316', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'DISCUS_BOYS',           label: 'Discus Throw (Boys)',      shortCode: 'DSB', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'BOYS',  icon: 'disc',        accentColor: '#14b8a6', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'DISCUS_GIRLS',          label: 'Discus Throw (Girls)',     shortCode: 'DSG', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'GIRLS', icon: 'disc',        accentColor: '#14b8a6', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'JAVELIN_BOYS',          label: 'Javelin Throw (Boys)',     shortCode: 'JVB', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'BOYS',  icon: 'move-right',  accentColor: '#84cc16', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'JAVELIN_GIRLS',         label: 'Javelin Throw (Girls)',    shortCode: 'JVG', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'GIRLS', icon: 'move-right',  accentColor: '#84cc16', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'LONG_JUMP_BOYS',        label: 'Long Jump (Boys)',         shortCode: 'LJB', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'BOYS',  icon: 'move-up-right', accentColor: '#22c55e', scoringType: 'TIMED', metric: 'meters' },
  { id: 'LONG_JUMP_GIRLS',       label: 'Long Jump (Girls)',        shortCode: 'LJG', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'GIRLS', icon: 'move-up-right', accentColor: '#22c55e', scoringType: 'TIMED', metric: 'meters' },

  // ─── Aquatics (2) ───
  { id: 'SWIMMING_50M_BOYS',     label: 'Swimming 50m (Boys)',      shortCode: 'SWB', category: 'AQUATICS',         type: 'EVENT', gender: 'BOYS',  icon: 'waves',       accentColor: '#06b6d4', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'SWIMMING_50M_GIRLS',    label: 'Swimming 50m (Girls)',     shortCode: 'SWG', category: 'AQUATICS',         type: 'EVENT', gender: 'GIRLS', icon: 'waves',       accentColor: '#06b6d4', scoringType: 'TIMED',  metric: 'seconds' },

  // ─── Endurance (5) ───
  { id: 'TRIATHLON',              label: 'Triathlon',                shortCode: 'TRI', category: 'ENDURANCE',        type: 'EVENT', gender: 'OPEN',  icon: 'bike',        accentColor: '#f59e0b', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'MARATHON_BOYS',          label: 'Marathon (Boys)',          shortCode: 'MRB', category: 'ENDURANCE',        type: 'EVENT', gender: 'BOYS',  icon: 'footprints',  accentColor: '#ef4444', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'MARATHON_GIRLS',         label: 'Marathon (Girls)',         shortCode: 'MRG', category: 'ENDURANCE',        type: 'EVENT', gender: 'GIRLS', icon: 'footprints',  accentColor: '#ef4444', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'CYCLING',                label: 'Cycling',                 shortCode: 'CYC', category: 'ENDURANCE',        type: 'EVENT', gender: 'OPEN',  icon: 'bike',        accentColor: '#3b82f6', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'SLOW_CYCLING',           label: 'Slow Cycling',            shortCode: 'SLC', category: 'ENDURANCE',        type: 'EVENT', gender: 'OPEN',  icon: 'bike',        accentColor: '#84cc16', scoringType: 'TIMED',  metric: 'seconds' },

  // ─── Indoor / Mind Sports (9) ───
  { id: 'POWERLIFTING_BELOW_70',  label: 'Powerlifting (<70kg)',     shortCode: 'PL1', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'dumbbell',    accentColor: '#ef4444', scoringType: 'RANKED', metric: 'kg' },
  { id: 'POWERLIFTING_ABOVE_70',  label: 'Powerlifting (>70kg)',     shortCode: 'PL2', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'dumbbell',    accentColor: '#ef4444', scoringType: 'RANKED', metric: 'kg' },
  { id: 'CHESS',                  label: 'Chess',                   shortCode: 'CHS', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'crown',       accentColor: '#94a3b8', scoringType: 'RANKED', metric: 'rank' },
  { id: 'CARROM',                 label: 'Carrom',                  shortCode: 'CRM', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'target',      accentColor: '#f59e0b', scoringType: 'RANKED', metric: 'rank' },
  { id: 'DARTS_BOYS',             label: 'Darts (Boys)',            shortCode: 'DRB', category: 'INDOOR',           type: 'EVENT', gender: 'BOYS',  icon: 'target',      accentColor: '#3b82f6', scoringType: 'RANKED', metric: 'points' },
  { id: 'DARTS_GIRLS',            label: 'Darts (Girls)',           shortCode: 'DRG', category: 'INDOOR',           type: 'EVENT', gender: 'GIRLS', icon: 'target',      accentColor: '#ec4899', scoringType: 'RANKED', metric: 'points' },
  { id: 'POKER',                  label: 'Poker',                   shortCode: 'PKR', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'spade',       accentColor: '#22c55e', scoringType: 'RANKED', metric: 'rank' },
  { id: 'YOGA_BOYS',              label: 'Yoga (Boys)',             shortCode: 'YGB', category: 'INDOOR',           type: 'EVENT', gender: 'BOYS',  icon: 'heart',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'rank' },
  { id: 'YOGA_GIRLS',             label: 'Yoga (Girls)',            shortCode: 'YGG', category: 'INDOOR',           type: 'EVENT', gender: 'GIRLS', icon: 'heart',       accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'rank' },

  // ─── Cultural (11) ───
  { id: 'DRAMATICS_STAGE',        label: 'Dramatics Stage',         shortCode: 'DRS', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'drama',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'DRAMATICS_STREET',       label: 'Dramatics Street',        shortCode: 'DRT', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'drama',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'VIDEO',                  label: 'Video',                   shortCode: 'VID', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'video',       accentColor: '#3b82f6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'RALLY',                  label: 'Rally',                   shortCode: 'RLY', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'megaphone',   accentColor: '#f97316', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'STAGE_DANCE',            label: 'Stage Dance',             shortCode: 'SDN', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'music',       accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'BAND',                   label: 'Band',                    shortCode: 'BND', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'music-2',     accentColor: '#14b8a6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'ANTAKSHARI',             label: 'Antakshari',              shortCode: 'ANT', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'mic',         accentColor: '#eab308', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'MANNEQUIN_CHALLENGE',    label: 'Mannequin Challenge',     shortCode: 'MNC', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'camera',      accentColor: '#06b6d4', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'MERI_MARZI_PROFESSOR',   label: 'Meri Marzi (Professor)',  shortCode: 'MMP', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'star',        accentColor: '#f59e0b', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'FLASH_MOB',              label: 'Flash Mob',               shortCode: 'FLM', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'music',       accentColor: '#ef4444', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'DANCE_FACE_OFF',         label: 'Dance Face Off',          shortCode: 'DFO', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'music',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'IMPROMPTU',              label: 'Impromptu',               shortCode: 'IMP', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'mic',         accentColor: '#f59e0b', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'MIME',                   label: 'Mime',                    shortCode: 'MME', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'theater',     accentColor: '#94a3b8', scoringType: 'JUDGED', metric: 'judged' },

  // ─── Art (7) ───
  { id: 'CLOTH_PAINTING',         label: 'Cloth Painting',          shortCode: 'CLP', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'palette',     accentColor: '#f97316', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'RANGOLI',                label: 'Rangoli',                 shortCode: 'RNG', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'flower-2',    accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'FACE_PAINTING',          label: 'Face Painting',           shortCode: 'FCP', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'smile',       accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'COLLAGE',                label: 'Collage',                 shortCode: 'CLG', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'layout-grid', accentColor: '#3b82f6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'CAMPUS_DECOR',           label: 'Campus Décor',            shortCode: 'CDR', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'sparkles',    accentColor: '#22c55e', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'CARICATURE_DESIGNING',   label: 'Caricature Designing',    shortCode: 'CCD', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'pencil',      accentColor: '#f59e0b', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'MASCOT',                 label: 'Mascot',                  shortCode: 'MSC', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'smile',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },

  // ─── Literary (6) ───
  { id: 'JAM',                    label: 'JAM',                     shortCode: 'JAM', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'message-circle', accentColor: '#3b82f6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'CREATIVE_WRITING',       label: 'Creative Writing',        shortCode: 'CRW', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'pen-tool',       accentColor: '#14b8a6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'DEBATE',                 label: 'Debate',                  shortCode: 'DBT', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'message-square', accentColor: '#f97316', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'POETRY',                 label: 'Poetry',                  shortCode: 'PTY', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'book-open',      accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'QUIZ',                   label: 'Quiz',                    shortCode: 'QIZ', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'help-circle',    accentColor: '#eab308', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'NEWSLETTER_DESIGN',      label: 'Newsletter Design',       shortCode: 'NLD', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'newspaper',      accentColor: '#06b6d4', scoringType: 'JUDGED', metric: 'judged' },

  // ─── Social Media / Other (5) ───
  { id: 'PIC_OF_THE_DAY',         label: 'Pic of the Day',          shortCode: 'POD', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'camera',         accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'REEL_OF_THE_DAY',        label: 'Reel of the Day',         shortCode: 'ROD', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'film',           accentColor: '#ef4444', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'LETTER_DESIGN',          label: 'Letter Design',           shortCode: 'LTD', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'mail',           accentColor: '#3b82f6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'ZEROTH_EVENT',           label: 'Zeroth Event',            shortCode: 'ZRO', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'zap',            accentColor: '#f59e0b', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'POWER_PREDICTOR',        label: 'Power Predictor',         shortCode: 'PWP', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'bar-chart-2',    accentColor: '#22c55e', scoringType: 'JUDGED', metric: 'judged' },
];

// ── All entries combined ──
const ALL_ENTRIES = [...MATCH_SPORTS, ...EVENT_SPORTS];

// ── Lookup maps (built once) ──
const matchSportIds = new Set(MATCH_SPORTS.map(s => s.id));
const eventSportIds = new Set(EVENT_SPORTS.map(s => s.id));
const allSportIds = new Set(ALL_ENTRIES.map(s => s.id));
const entryById = Object.fromEntries(ALL_ENTRIES.map(e => [e.id, e]));

// ── Event categories (for filters) ──
const EVENT_CATEGORIES = [
  { id: 'ATHLETICS_TRACK',  label: 'Athletics - Track',  icon: 'timer',         accent: '#ef4444' },
  { id: 'ATHLETICS_FIELD',  label: 'Athletics - Field',  icon: 'target',        accent: '#f97316' },
  { id: 'AQUATICS',         label: 'Aquatics',           icon: 'waves',         accent: '#06b6d4' },
  { id: 'ENDURANCE',        label: 'Endurance',          icon: 'bike',          accent: '#f59e0b' },
  { id: 'INDOOR',           label: 'Indoor / Mind',      icon: 'brain',         accent: '#a855f7' },
  { id: 'CULTURAL',         label: 'Cultural',           icon: 'drama',         accent: '#ec4899' },
  { id: 'ART',              label: 'Art',                icon: 'palette',       accent: '#f97316' },
  { id: 'LITERARY',         label: 'Literary',           icon: 'book-open',     accent: '#3b82f6' },
  { id: 'OTHER',            label: 'Other',              icon: 'sparkles',      accent: '#22c55e' },
];

// ── Helper functions ──
/** Get all match-type sport IDs (for Match model validation) */
function getMatchSportIds() {
  // Include old IDs for backward compat
  return [...matchSportIds, ...Object.keys(SPORT_ALIASES)];
}

/** Get all event-type sport IDs */
function getEventSportIds() {
  return [...eventSportIds];
}

/** Get all sport IDs (deduplicated) */
function getAllSportIds() {
  return [...new Set([...allSportIds, ...Object.keys(SPORT_ALIASES)])];
}

/** Resolve old sport ID aliases */
function resolveAlias(sportId) {
  return SPORT_ALIASES[sportId] || sportId;
}

/** Get entry by ID (supports aliases) */
function getEntry(id) {
  return entryById[id] || entryById[SPORT_ALIASES[id]] || null;
}

/** Get all match sports (full objects) */
function getMatchSports() {
  return MATCH_SPORTS;
}

/** Get all event sports (full objects) */
function getEventSports() {
  return EVENT_SPORTS;
}

/** Get events by category */
function getEventsByCategory(category) {
  return EVENT_SPORTS.filter(e => e.category === category);
}

/** Check if sport ID is a valid match sport */
function isMatchSport(id) {
  return matchSportIds.has(id) || matchSportIds.has(SPORT_ALIASES[id]);
}

/** Check if sport ID is a valid event sport */
function isEventSport(id) {
  return eventSportIds.has(id);
}

module.exports = {
  MATCH_SPORTS,
  EVENT_SPORTS,
  ALL_ENTRIES,
  EVENT_CATEGORIES,
  SPORT_ALIASES,
  getMatchSportIds,
  getEventSportIds,
  getAllSportIds,
  resolveAlias,
  getEntry,
  getMatchSports,
  getEventSports,
  getEventsByCategory,
  isMatchSport,
  isEventSport,
};
