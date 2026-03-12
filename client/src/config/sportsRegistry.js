/**
 * VNIT IG '26 — Centralized Sports & Events Registry (Client)
 * Single source of truth for all ~80 sports and events.
 * Used by SportBadge, ScheduleMatch, LiveConsole, Home, Events page, etc.
 */

// ─── Match-Type Sports (21) — Department vs Department ───
export const MATCH_SPORTS = [
  // Traditional Sports (16)
  { id: 'BADMINTON',        label: 'Badminton',           shortCode: 'BD',  category: 'TEAM_SPORT', type: 'MATCH', gender: 'OPEN',  icon: 'Feather',          accentColor: '#06b6d4', scoringType: 'SET_BASED' },
  { id: 'BASKETBALL_BOYS',  label: 'Basketball (Boys)',   shortCode: 'BBB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'CircleDot',        accentColor: '#f59e0b', scoringType: 'GOAL_BASED' },
  { id: 'BASKETBALL_GIRLS', label: 'Basketball (Girls)',  shortCode: 'BBG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'CircleDot',        accentColor: '#f59e0b', scoringType: 'GOAL_BASED' },
  { id: 'CRICKET_BOYS',     label: 'Cricket (Boys)',      shortCode: 'CRB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'Swords',           accentColor: '#22c55e', scoringType: 'CRICKET' },
  { id: 'CRICKET_GIRLS',    label: 'Cricket (Girls)',     shortCode: 'CRG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'Swords',           accentColor: '#22c55e', scoringType: 'CRICKET' },
  { id: 'FOOTBALL',         label: 'Football',            shortCode: 'FB',  category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'Goal',             accentColor: '#3b82f6', scoringType: 'GOAL_BASED' },
  { id: 'LAWN_TENNIS',      label: 'Lawn Tennis',         shortCode: 'LT',  category: 'TEAM_SPORT', type: 'MATCH', gender: 'OPEN',  icon: 'Circle',           accentColor: '#84cc16', scoringType: 'SET_BASED' },
  { id: 'TABLE_TENNIS',     label: 'Table Tennis',        shortCode: 'TT',  category: 'TEAM_SPORT', type: 'MATCH', gender: 'OPEN',  icon: 'Disc3',            accentColor: '#ef4444', scoringType: 'SET_BASED' },
  { id: 'VOLLEYBALL_BOYS',  label: 'Volleyball (Boys)',   shortCode: 'VBB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'Hexagon',          accentColor: '#eab308', scoringType: 'SET_BASED' },
  { id: 'THROWBALL_GIRLS',  label: 'Throwball (Girls)',   shortCode: 'TBG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'Hexagon',          accentColor: '#ec4899', scoringType: 'SET_BASED' },
  { id: 'KHOKHO_BOYS',      label: 'Kho-Kho (Boys)',     shortCode: 'KKB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'Zap',              accentColor: '#14b8a6', scoringType: 'GOAL_BASED' },
  { id: 'KHOKHO_GIRLS',     label: 'Kho-Kho (Girls)',    shortCode: 'KKG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'Zap',              accentColor: '#14b8a6', scoringType: 'GOAL_BASED' },
  { id: 'TUG_OF_WAR',       label: 'Tug of War',         shortCode: 'TOW', category: 'TEAM_SPORT', type: 'MATCH', gender: 'MIXED', icon: 'GripHorizontal',   accentColor: '#a855f7', scoringType: 'SIMPLE' },
  { id: 'KABADDI_BOYS',     label: 'Kabaddi (Boys)',      shortCode: 'KBB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'Shield',           accentColor: '#a855f7', scoringType: 'GOAL_BASED' },
  { id: 'HANDBALL_BOYS',    label: 'Handball (Boys)',     shortCode: 'HBB', category: 'TEAM_SPORT', type: 'MATCH', gender: 'BOYS',  icon: 'Hand',             accentColor: '#f97316', scoringType: 'GOAL_BASED' },
  { id: 'HANDBALL_GIRLS',   label: 'Handball (Girls)',    shortCode: 'HBG', category: 'TEAM_SPORT', type: 'MATCH', gender: 'GIRLS', icon: 'Hand',             accentColor: '#f97316', scoringType: 'GOAL_BASED' },

  // E-Sports (5)
  { id: 'COUNTER_STRIKE',   label: 'Counter Strike 2',   shortCode: 'CS2', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'Crosshair',   accentColor: '#f97316', scoringType: 'SIMPLE' },
  { id: 'FIFA',             label: 'FIFA',               shortCode: 'FIF', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'Gamepad2',    accentColor: '#3b82f6', scoringType: 'GOAL_BASED' },
  { id: 'VALORANT',         label: 'Valorant',           shortCode: 'VAL', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'Crosshair',   accentColor: '#ef4444', scoringType: 'SIMPLE' },
  { id: 'BGMI',             label: 'BGMI',               shortCode: 'BGM', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'Gamepad2',    accentColor: '#22c55e', scoringType: 'SIMPLE' },
  { id: 'CODM',             label: 'CODM',               shortCode: 'COD', category: 'ESPORTS', type: 'MATCH', gender: 'OPEN', icon: 'Gamepad2',    accentColor: '#eab308', scoringType: 'SIMPLE' },
];

// ─── Event-Type Sports (~60) — Results-Based Competitions ───
export const EVENT_SPORTS = [
  // Athletics — Track (9)
  { id: '100M_BOYS',             label: '100m (Boys)',              shortCode: '1HB', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'BOYS',  icon: 'Timer',       accentColor: '#ef4444', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '100M_GIRLS',            label: '100m (Girls)',             shortCode: '1HG', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'GIRLS', icon: 'Timer',       accentColor: '#ef4444', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '400M_BOYS',             label: '400m (Boys)',              shortCode: '4HB', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'BOYS',  icon: 'Timer',       accentColor: '#f59e0b', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '400M_GIRLS',            label: '400m (Girls)',             shortCode: '4HG', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'GIRLS', icon: 'Timer',       accentColor: '#f59e0b', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '800M_BOYS',             label: '800m (Boys)',              shortCode: '8HB', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'BOYS',  icon: 'Timer',       accentColor: '#3b82f6', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '800M_GIRLS',            label: '800m (Girls)',             shortCode: '8HG', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'GIRLS', icon: 'Timer',       accentColor: '#3b82f6', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '4X100M_RELAY_BOYS',     label: '4×100m Relay (Boys)',      shortCode: 'RLB', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'BOYS',  icon: 'Repeat',      accentColor: '#a855f7', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '4X100M_RELAY_GIRLS',    label: '4×100m Relay (Girls)',     shortCode: 'RLG', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'GIRLS', icon: 'Repeat',      accentColor: '#a855f7', scoringType: 'TIMED',  metric: 'seconds' },
  { id: '4X100M_RELAY_MIXED',    label: '4×100m Relay (Mixed)',     shortCode: 'RLM', category: 'ATHLETICS_TRACK',  type: 'EVENT', gender: 'MIXED', icon: 'Repeat',      accentColor: '#a855f7', scoringType: 'TIMED',  metric: 'seconds' },

  // Athletics — Field (8)
  { id: 'SHOT_PUT_BOYS',         label: 'Shot Put (Boys)',          shortCode: 'SPB', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'BOYS',  icon: 'Circle',      accentColor: '#f97316', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'SHOT_PUT_GIRLS',        label: 'Shot Put (Girls)',         shortCode: 'SPG', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'GIRLS', icon: 'Circle',      accentColor: '#f97316', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'DISCUS_BOYS',           label: 'Discus Throw (Boys)',      shortCode: 'DSB', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'BOYS',  icon: 'Disc',        accentColor: '#14b8a6', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'DISCUS_GIRLS',          label: 'Discus Throw (Girls)',     shortCode: 'DSG', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'GIRLS', icon: 'Disc',        accentColor: '#14b8a6', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'JAVELIN_BOYS',          label: 'Javelin Throw (Boys)',     shortCode: 'JVB', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'BOYS',  icon: 'MoveRight',   accentColor: '#84cc16', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'JAVELIN_GIRLS',         label: 'Javelin Throw (Girls)',    shortCode: 'JVG', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'GIRLS', icon: 'MoveRight',   accentColor: '#84cc16', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'LONG_JUMP_BOYS',        label: 'Long Jump (Boys)',         shortCode: 'LJB', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'BOYS',  icon: 'MoveUpRight', accentColor: '#22c55e', scoringType: 'TIMED',  metric: 'meters' },
  { id: 'LONG_JUMP_GIRLS',       label: 'Long Jump (Girls)',        shortCode: 'LJG', category: 'ATHLETICS_FIELD',  type: 'EVENT', gender: 'GIRLS', icon: 'MoveUpRight', accentColor: '#22c55e', scoringType: 'TIMED',  metric: 'meters' },

  // Aquatics (2)
  { id: 'SWIMMING_50M_BOYS',     label: 'Swimming 50m (Boys)',      shortCode: 'SWB', category: 'AQUATICS',         type: 'EVENT', gender: 'BOYS',  icon: 'Waves',       accentColor: '#06b6d4', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'SWIMMING_50M_GIRLS',    label: 'Swimming 50m (Girls)',     shortCode: 'SWG', category: 'AQUATICS',         type: 'EVENT', gender: 'GIRLS', icon: 'Waves',       accentColor: '#06b6d4', scoringType: 'TIMED',  metric: 'seconds' },

  // Endurance (5)
  { id: 'TRIATHLON',              label: 'Triathlon',                shortCode: 'TRI', category: 'ENDURANCE',        type: 'EVENT', gender: 'OPEN',  icon: 'Bike',        accentColor: '#f59e0b', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'MARATHON_BOYS',          label: 'Marathon (Boys)',          shortCode: 'MRB', category: 'ENDURANCE',        type: 'EVENT', gender: 'BOYS',  icon: 'Footprints',  accentColor: '#ef4444', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'MARATHON_GIRLS',         label: 'Marathon (Girls)',         shortCode: 'MRG', category: 'ENDURANCE',        type: 'EVENT', gender: 'GIRLS', icon: 'Footprints',  accentColor: '#ef4444', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'CYCLING',                label: 'Cycling',                 shortCode: 'CYC', category: 'ENDURANCE',        type: 'EVENT', gender: 'OPEN',  icon: 'Bike',        accentColor: '#3b82f6', scoringType: 'TIMED',  metric: 'seconds' },
  { id: 'SLOW_CYCLING',           label: 'Slow Cycling',            shortCode: 'SLC', category: 'ENDURANCE',        type: 'EVENT', gender: 'OPEN',  icon: 'Bike',        accentColor: '#84cc16', scoringType: 'TIMED',  metric: 'seconds' },

  // Indoor / Mind Sports (9)
  { id: 'POWERLIFTING_BELOW_70',  label: 'Powerlifting (<70kg)',     shortCode: 'PL1', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'Dumbbell',    accentColor: '#ef4444', scoringType: 'RANKED', metric: 'kg' },
  { id: 'POWERLIFTING_ABOVE_70',  label: 'Powerlifting (>70kg)',     shortCode: 'PL2', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'Dumbbell',    accentColor: '#ef4444', scoringType: 'RANKED', metric: 'kg' },
  { id: 'CHESS',                  label: 'Chess',                   shortCode: 'CHS', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'Crown',       accentColor: '#94a3b8', scoringType: 'RANKED', metric: 'rank' },
  { id: 'CARROM',                 label: 'Carrom',                  shortCode: 'CRM', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'Target',      accentColor: '#f59e0b', scoringType: 'RANKED', metric: 'rank' },
  { id: 'DARTS_BOYS',             label: 'Darts (Boys)',            shortCode: 'DRB', category: 'INDOOR',           type: 'EVENT', gender: 'BOYS',  icon: 'Target',      accentColor: '#3b82f6', scoringType: 'RANKED', metric: 'points' },
  { id: 'DARTS_GIRLS',            label: 'Darts (Girls)',           shortCode: 'DRG', category: 'INDOOR',           type: 'EVENT', gender: 'GIRLS', icon: 'Target',      accentColor: '#ec4899', scoringType: 'RANKED', metric: 'points' },
  { id: 'POKER',                  label: 'Poker',                   shortCode: 'PKR', category: 'INDOOR',           type: 'EVENT', gender: 'OPEN',  icon: 'Spade',       accentColor: '#22c55e', scoringType: 'RANKED', metric: 'rank' },
  { id: 'YOGA_BOYS',              label: 'Yoga (Boys)',             shortCode: 'YGB', category: 'INDOOR',           type: 'EVENT', gender: 'BOYS',  icon: 'Heart',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'rank' },
  { id: 'YOGA_GIRLS',             label: 'Yoga (Girls)',            shortCode: 'YGG', category: 'INDOOR',           type: 'EVENT', gender: 'GIRLS', icon: 'Heart',       accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'rank' },

  // Cultural (11)
  { id: 'DRAMATICS_STAGE',        label: 'Dramatics Stage',         shortCode: 'DRS', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Drama',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'DRAMATICS_STREET',       label: 'Dramatics Street',        shortCode: 'DRT', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Drama',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'VIDEO',                  label: 'Video',                   shortCode: 'VID', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Video',       accentColor: '#3b82f6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'RALLY',                  label: 'Rally',                   shortCode: 'RLY', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Megaphone',   accentColor: '#f97316', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'STAGE_DANCE',            label: 'Stage Dance',             shortCode: 'SDN', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Music',       accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'BAND',                   label: 'Band',                    shortCode: 'BND', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Music2',      accentColor: '#14b8a6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'ANTAKSHARI',             label: 'Antakshari',              shortCode: 'ANT', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Mic',         accentColor: '#eab308', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'MANNEQUIN_CHALLENGE',    label: 'Mannequin Challenge',     shortCode: 'MNC', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Camera',      accentColor: '#06b6d4', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'MERI_MARZI_PROFESSOR',   label: 'Meri Marzi (Professor)',  shortCode: 'MMP', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Star',        accentColor: '#f59e0b', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'FLASH_MOB',              label: 'Flash Mob',               shortCode: 'FLM', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Music',       accentColor: '#ef4444', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'DANCE_FACE_OFF',         label: 'Dance Face Off',          shortCode: 'DFO', category: 'CULTURAL',          type: 'EVENT', gender: 'MIXED', icon: 'Music',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },

  // Art (6)
  { id: 'CLOTH_PAINTING',         label: 'Cloth Painting',          shortCode: 'CLP', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'Palette',     accentColor: '#f97316', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'RANGOLI',                label: 'Rangoli',                 shortCode: 'RNG', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'Flower2',     accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'COLLAGE',                label: 'Collage',                 shortCode: 'CLG', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'LayoutGrid',  accentColor: '#3b82f6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'CAMPUS_DECOR',           label: 'Campus Décor',            shortCode: 'CDR', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'Sparkles',    accentColor: '#22c55e', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'CARICATURE_DESIGNING',   label: 'Caricature Designing',    shortCode: 'CCD', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'Pencil',      accentColor: '#f59e0b', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'MASCOT',                 label: 'Mascot',                  shortCode: 'MSC', category: 'ART',               type: 'EVENT', gender: 'MIXED', icon: 'Smile',       accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },

  // Literary (6)
  { id: 'JAM',                    label: 'JAM',                     shortCode: 'JAM', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'MessageCircle', accentColor: '#3b82f6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'CREATIVE_WRITING',       label: 'Creative Writing',        shortCode: 'CRW', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'PenTool',       accentColor: '#14b8a6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'DEBATE',                 label: 'Debate',                  shortCode: 'DBT', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'MessageSquare', accentColor: '#f97316', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'POETRY',                 label: 'Poetry',                  shortCode: 'PTY', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'BookOpen',      accentColor: '#a855f7', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'QUIZ',                   label: 'Quiz',                    shortCode: 'QIZ', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'HelpCircle',    accentColor: '#eab308', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'NEWSLETTER_DESIGN',      label: 'Newsletter Design',       shortCode: 'NLD', category: 'LITERARY',           type: 'EVENT', gender: 'MIXED', icon: 'Newspaper',     accentColor: '#06b6d4', scoringType: 'JUDGED', metric: 'judged' },

  // Social Media / Other (5)
  { id: 'PIC_OF_THE_DAY',         label: 'Pic of the Day',          shortCode: 'POD', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'Camera',         accentColor: '#ec4899', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'REEL_OF_THE_DAY',        label: 'Reel of the Day',         shortCode: 'ROD', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'Film',           accentColor: '#ef4444', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'LETTER_DESIGN',          label: 'Letter Design',           shortCode: 'LTD', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'Mail',           accentColor: '#3b82f6', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'ZEROTH_EVENT',           label: 'Zeroth Event',            shortCode: 'ZRO', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'Zap',            accentColor: '#f59e0b', scoringType: 'JUDGED', metric: 'judged' },
  { id: 'POWER_PREDICTOR',        label: 'Power Predictor',         shortCode: 'PWP', category: 'OTHER',              type: 'EVENT', gender: 'MIXED', icon: 'BarChart2',      accentColor: '#22c55e', scoringType: 'JUDGED', metric: 'judged' },
];

// ── Backward compat aliases — old IDs → new IDs ──
export const SPORT_ALIASES = {
  'CRICKET':    'CRICKET_BOYS',
  'BASKETBALL': 'BASKETBALL_BOYS',
  'HOCKEY':     'FOOTBALL',
  'VOLLEYBALL': 'VOLLEYBALL_BOYS',
  'KHOKHO':     'KHOKHO_BOYS',
  'KABADDI':    'KABADDI_BOYS',
};

// ── All entries combined ──
export const ALL_ENTRIES = [...MATCH_SPORTS, ...EVENT_SPORTS];

// ── Pre-built lookup map ──
const _entryMap = Object.fromEntries(ALL_ENTRIES.map(e => [e.id, e]));

// ── Event categories (for filter tabs on Events page) ──
export const EVENT_CATEGORIES = [
  { id: 'ALL',              label: 'All Events',          icon: 'Sparkles',      accent: '#a855f7' },
  { id: 'ATHLETICS_TRACK',  label: 'Track',               icon: 'Timer',         accent: '#ef4444' },
  { id: 'ATHLETICS_FIELD',  label: 'Field',               icon: 'Target',        accent: '#f97316' },
  { id: 'AQUATICS',         label: 'Aquatics',            icon: 'Waves',         accent: '#06b6d4' },
  { id: 'ENDURANCE',        label: 'Endurance',           icon: 'Bike',          accent: '#f59e0b' },
  { id: 'INDOOR',           label: 'Indoor / Mind',       icon: 'Brain',         accent: '#a855f7' },
  { id: 'CULTURAL',         label: 'Cultural',            icon: 'Drama',         accent: '#ec4899' },
  { id: 'ART',              label: 'Art',                 icon: 'Palette',       accent: '#f97316' },
  { id: 'LITERARY',         label: 'Literary',            icon: 'BookOpen',      accent: '#3b82f6' },
  { id: 'OTHER',            label: 'Other',               icon: 'Sparkles',      accent: '#22c55e' },
];

// ── Match sport category groups (for dropdowns) ──
export const MATCH_SPORT_GROUPS = [
  { label: 'Traditional Sports', sports: MATCH_SPORTS.filter(s => s.category === 'TEAM_SPORT') },
  { label: 'E-Sports',           sports: MATCH_SPORTS.filter(s => s.category === 'ESPORTS') },
];

// ── Helper functions ──

/** Get match sports as {label, value} for select dropdowns */
export function getMatchSportsForSelect() {
  return MATCH_SPORTS.map(s => ({ label: s.label, value: s.id }));
}

/** Get all match sport IDs */
export function getMatchSportIds() {
  return MATCH_SPORTS.map(s => s.id);
}

/** Get entry by ID (supports old aliases) */
export function getEntry(id) {
  return _entryMap[id] || _entryMap[SPORT_ALIASES[id]] || null;
}

/** Get accent color for a sport */
export function getSportAccentColor(id) {
  const entry = getEntry(id);
  return entry?.accentColor || '#94a3b8';
}

/** Get label for a sport ID */
export function getSportLabel(id) {
  const entry = getEntry(id);
  return entry?.label || id?.replace(/_/g, ' ') || 'Unknown';
}

/** Get short code for a sport ID */
export function getSportShortCode(id) {
  const entry = getEntry(id);
  return entry?.shortCode || '??';
}

/** Get events filtered by category */
export function getEventsByCategory(category) {
  if (category === 'ALL') return EVENT_SPORTS;
  return EVENT_SPORTS.filter(e => e.category === category);
}
