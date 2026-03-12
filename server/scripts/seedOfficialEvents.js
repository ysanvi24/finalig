/**
 * seedOfficialEvents.js
 * Upserts all 78 official IG events into MongoDB from scoringTable.js.
 * Safe to run multiple times — uses eventNumber as the unique key.
 *
 * Usage:  node server/scripts/seedOfficialEvents.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const OfficialEvent = require('../models/OfficialEvent');
const { SCORING_TABLE } = require('../config/scoringTable');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  let created = 0, updated = 0;

  for (const entry of SCORING_TABLE) {
    const doc = {
      eventNumber: entry.eventNumber,
      name: entry.name,
      sportId: entry.sportId,
      type: entry.type,
      venue: entry.venue || '',
      category: entry.category || '',
      notes: entry.notes || '',
      positions: new Map(Object.entries(entry.positions).map(([k, v]) => [String(k), v])),
      isActive: true,
    };

    const result = await OfficialEvent.findOneAndUpdate(
      { eventNumber: entry.eventNumber },
      { $set: doc },
      { upsert: true, new: true }
    );
    if (result.isNew !== undefined ? result.isNew : false) created++;
    else updated++;
  }

  console.log(`✅ Seed complete: ${created} created, ${updated} updated — total: ${SCORING_TABLE.length} events`);

  // Quick verification
  const total = await OfficialEvent.countDocuments();
  const bracketCount = await OfficialEvent.countDocuments({ type: 'BRACKET' });
  const groupCount = await OfficialEvent.countDocuments({ type: 'GROUP' });
  console.log(`📊 DB totals — all: ${total}, BRACKET: ${bracketCount}, GROUP: ${groupCount}`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
