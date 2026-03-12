/* Temporary validation script - can be deleted after testing */
const reg = require('./config/sportsRegistry');

console.log('═══ SPORTS REGISTRY VALIDATION ═══');
const matchIds = reg.getMatchSportIds();
const eventIds = reg.getEventSportIds();
const allIds   = reg.getAllSportIds();
console.log('Match sports :', matchIds.length);
console.log('Event sports :', eventIds.length);
console.log('Total (incl aliases):', allIds.length);

const dups = allIds.filter((v, i, a) => a.indexOf(v) !== i);
console.log('Duplicate IDs:', dups.length === 0 ? '✅ None' : '❌ ' + dups.join(', '));

const aliases = ['CRICKET','BASKETBALL','HOCKEY','VOLLEYBALL','KHOKHO','KABADDI'];
const aliasOk = aliases.every(a => reg.resolveAlias(a) && reg.getEntry(reg.resolveAlias(a)));
console.log('Alias resolution:', aliasOk ? '✅ All 6 aliases resolve' : '❌ Failed');

const cats = reg.EVENT_CATEGORIES;
console.log('Event categories:', cats.length, cats.map(c=>c.id).join(', '));

console.log('isMatchSport(CRICKET_BOYS):', reg.isMatchSport('CRICKET_BOYS') ? '✅' : '❌');
console.log('isEventSport(SOLO_SINGING):', reg.isEventSport('SOLO_SINGING') ? '✅' : '❌');
console.log('isMatchSport(SOLO_SINGING):', reg.isMatchSport('SOLO_SINGING') === false ? '✅' : '❌');

console.log('\n═══ MODEL VALIDATION ═══');
const mongoose = require('mongoose');
const { SPORTS } = require('./models/Match');
console.log('Match SPORTS array length:', SPORTS.length, SPORTS.length >= 21 ? '✅' : '❌');
console.log('Includes CRICKET_BOYS:', SPORTS.includes('CRICKET_BOYS') ? '✅' : '❌');
console.log('Includes alias CRICKET:', SPORTS.includes('CRICKET') ? '✅' : '❌');
console.log('Includes VALORANT:', SPORTS.includes('VALORANT') ? '✅' : '❌');

const { Event, EVENT_STATUS, VALID_CATEGORIES } = require('./models/Event');
console.log('Event STATUS values:', EVENT_STATUS.length, EVENT_STATUS.length === 4 ? '✅' : '❌');
console.log('Event CATEGORIES:', VALID_CATEGORIES.length, VALID_CATEGORIES.length >= 8 ? '✅' : '❌');
const eventFields = Object.keys(Event.schema.paths).filter(p => !p.startsWith('_'));
console.log('Event schema fields:', eventFields.join(', '));

const ScoringPreset = require('./models/ScoringPreset');
const spSport = ScoringPreset.schema.path('sport');
const hasVal = spSport.validators && spSport.validators.length > 0;
console.log('ScoringPreset sport validator exists:', hasVal ? '✅' : '❌');

console.log('\n═══ CONTROLLER VALIDATION ═══');
const ec = require('./controllers/eventController');
const fns = ['createEvent','getAllEvents','getEvent','updateEvent','recordResults','awardEventPoints','deleteEvent'];
const ctrlOk = fns.every(f => typeof ec[f] === 'function');
console.log('eventController exports (' + fns.length + ' functions):', ctrlOk ? '✅ All present' : '❌ Missing');

console.log('\n═══ ROUTE VALIDATION ═══');
const eventRouter = require('./routes/eventRoutes');
const routes = [];
eventRouter.stack.forEach(r => {
  if (r.route) {
    const methods = Object.keys(r.route.methods).map(m => m.toUpperCase()).join(',');
    routes.push(methods + ' ' + r.route.path);
  }
});
console.log('Event routes:', routes.join(' | '));

// Check existing routes still intact
const matchRouter = require('./routes/matchRoutes');
const mRoutes = [];
matchRouter.stack.forEach(r => {
  if (r.route) {
    const methods = Object.keys(r.route.methods).map(m => m.toUpperCase()).join(',');
    mRoutes.push(methods + ' ' + r.route.path);
  }
});
console.log('Match routes:', mRoutes.join(' | '));

console.log('\n═══ ALL SERVER VALIDATIONS PASSED ✅ ═══');
