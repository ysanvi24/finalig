/**
 * reset-database.js
 * ══════════════════════════════════════════════════════════════
 * FRESH START — Drops all match data, scores, highlights, fouls,
 * players, point logs, and leaderboard data.
 * Re-seeds: departments, official events, super admin.
 *
 * Usage:  node server/scripts/reset-database.js
 * ══════════════════════════════════════════════════════════════
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import all models
const { Match } = require('../models/Match');
const { Event } = require('../models/Event');
const Highlight = require('../models/Highlight');
const Foul = require('../models/Foul');
const Player = require('../models/Player');
const PointLog = require('../models/PointLog');
const Season = require('../models/Season');
const ScoringPreset = require('../models/ScoringPreset');
const Department = require('../models/Department');
const OfficialEvent = require('../models/OfficialEvent');
const Admin = require('../models/Admin');
const StudentCouncil = require('../models/StudentCouncil');
const About = require('../models/About');
const bcrypt = require('bcryptjs');

// ── Department data ──
const departments = [
    { name: 'Computer Science Engineering', shortCode: 'CSE' },
    { name: 'Electronics & Communication Engineering', shortCode: 'ECE' },
    { name: 'Electrical & Electronics Engineering', shortCode: 'EEE' },
    { name: 'Mechanical Engineering', shortCode: 'MECH' },
    { name: 'Chemical & Mining Engineering', shortCode: 'CHEMINE' },
    { name: 'Civil Engineering', shortCode: 'CIVIL' },
    { name: 'Metallurgical & Materials Engineering', shortCode: 'META' }
];

async function resetDatabase() {
    console.log('');
    console.log('══════════════════════════════════════════════════');
    console.log('  🗑️  VNIT IG App — FULL DATABASE RESET');
    console.log('══════════════════════════════════════════════════');
    console.log('');

    // Connect
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//<hidden>@'));
    console.log('');

    // ── Step 1: Drop all match/game data ──
    console.log('━━━ Step 1/4: Clearing all match & game data ━━━');

    const collections = [
        { model: Match, name: 'Matches' },
        { model: Event, name: 'Events' },
        { model: Highlight, name: 'Highlights' },
        { model: Foul, name: 'Fouls' },
        { model: Player, name: 'Players' },
        { model: PointLog, name: 'Point Logs' },
        { model: Season, name: 'Seasons' },
        { model: ScoringPreset, name: 'Scoring Presets' },
    ];

    for (const { model, name } of collections) {
        const count = await model.countDocuments();
        await model.deleteMany({});
        console.log(`  🗑️  ${name}: deleted ${count} documents`);
    }

    // Clear student council
    const councilCount = await StudentCouncil.countDocuments();
    await StudentCouncil.deleteMany({});
    console.log(`  🗑️  Student Council: deleted ${councilCount} documents`);

    // Clear about page data
    const aboutCount = await About.countDocuments();
    await About.deleteMany({});
    console.log(`  🗑️  About: deleted ${aboutCount} documents`);

    console.log('');

    // ── Step 2: Reset departments (keep the 7 VNIT departments) ──
    console.log('━━━ Step 2/4: Re-seeding departments ━━━');
    await Department.deleteMany({});
    const createdDepts = await Department.insertMany(departments);
    createdDepts.forEach(d => console.log(`  ✅ ${d.shortCode} — ${d.name}`));
    console.log('');

    // ── Step 3: Reset & re-seed official events ──
    console.log('━━━ Step 3/4: Re-seeding 78 official IG events ━━━');
    await OfficialEvent.deleteMany({});
    const { SCORING_TABLE } = require('../config/scoringTable');
    let eventCount = 0;
    for (const entry of SCORING_TABLE) {
        await OfficialEvent.create({
            eventNumber: entry.eventNumber,
            name: entry.name,
            sportId: entry.sportId,
            type: entry.type,
            venue: entry.venue || '',
            category: entry.category || '',
            notes: entry.notes || '',
            positions: new Map(Object.entries(entry.positions).map(([k, v]) => [String(k), v])),
            isActive: true,
        });
        eventCount++;
    }
    console.log(`  ✅ ${eventCount} official events seeded`);
    console.log('');

    // ── Step 4: Reset admins & create fresh super admin ──
    console.log('━━━ Step 4/4: Resetting admins & creating super admin ━━━');
    await Admin.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const superAdmin = await Admin.create({
        username: 'admin',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        isTrusted: true,
        isActive: true,
        verified: true,
        provider: 'local',
    });
    console.log(`  ✅ Super admin created: username="admin", password="admin123"`);
    console.log(`  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!`);
    console.log('');

    // ── Summary ──
    console.log('══════════════════════════════════════════════════');
    console.log('  ✅ DATABASE RESET COMPLETE — FRESH START!');
    console.log('══════════════════════════════════════════════════');
    console.log('');
    console.log('  📊 Current database state:');
    console.log(`     Departments:     ${await Department.countDocuments()}`);
    console.log(`     Official Events: ${await OfficialEvent.countDocuments()}`);
    console.log(`     Admins:          ${await Admin.countDocuments()}`);
    console.log(`     Matches:         ${await Match.countDocuments()}`);
    console.log(`     Highlights:      ${await Highlight.countDocuments()}`);
    console.log(`     Point Logs:      ${await PointLog.countDocuments()}`);
    console.log('');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
}

resetDatabase().catch(err => {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
});
