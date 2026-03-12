/**
 * MongoDB Atlas 512MB Free Tier Capacity Analysis
 * Checks current database size and projects 10-day usage.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function analyzeCapacity() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('═══════════════════════════════════════════');
    console.log('  MongoDB Atlas 512MB Capacity Analysis');
    console.log('═══════════════════════════════════════════\n');

    // 1. Database stats
    const dbStats = await db.command({ dbStats: 1, scale: 1024 }); // KB
    const dataSizeKB = dbStats.dataSize;
    const storageSizeKB = dbStats.storageSize;
    const indexSizeKB = dbStats.indexSize;
    const totalKB = storageSizeKB + indexSizeKB;
    const totalMB = totalKB / 1024;

    console.log('📊 Current Database Size:');
    console.log(`   Data Size:    ${(dataSizeKB / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(storageSizeKB / 1024).toFixed(2)} MB`);
    console.log(`   Index Size:   ${(indexSizeKB / 1024).toFixed(2)} MB`);
    console.log(`   Total:        ${totalMB.toFixed(2)} MB / 512 MB`);
    console.log(`   Usage:        ${((totalMB / 512) * 100).toFixed(1)}%\n`);

    // 2. Collection-level breakdown
    const collections = await db.listCollections().toArray();
    console.log('📋 Collection Breakdown:');
    let collDetails = [];
    for (const col of collections) {
        const stats = await db.command({ collStats: col.name, scale: 1024 });
        collDetails.push({
            name: col.name,
            docs: stats.count,
            dataMB: (stats.size / 1024).toFixed(3),
            storageMB: (stats.storageSize / 1024).toFixed(3),
            indexMB: (stats.totalIndexSize / 1024).toFixed(3),
        });
    }
    collDetails.sort((a, b) => parseFloat(b.storageMB) - parseFloat(a.storageMB));
    for (const c of collDetails) {
        console.log(`   ${c.name.padEnd(22)} ${String(c.docs).padStart(5)} docs  | data: ${c.dataMB.padStart(7)} MB | storage: ${c.storageMB.padStart(7)} MB | idx: ${c.indexMB.padStart(7)} MB`);
    }

    // 3. Projection for 10-day event
    console.log('\n📈 10-Day Event Projection:');
    // Estimate daily additions:
    // - ~20 matches/day (200 total for 10 days)
    // - 3 highlights/day (30 total)
    // - ~20 point log entries/day (200 total)
    // - ~5 live console updates/day (50 total)
    // Average match doc ~2KB, highlight ~1KB, pointlog ~0.5KB
    const dailyMatchesKB = 20 * 2;     // 40KB
    const dailyHighlightsKB = 3 * 1;   // 3KB
    const dailyPointLogsKB = 20 * 0.5; // 10KB
    const dailyTotalKB = dailyMatchesKB + dailyHighlightsKB + dailyPointLogsKB;
    const tenDayGrowthMB = (dailyTotalKB * 10) / 1024;
    const projectedTotalMB = totalMB + tenDayGrowthMB;

    console.log(`   Daily data growth:    ~${(dailyTotalKB / 1024 * 1000).toFixed(0)} KB/day`);
    console.log(`   10-day growth:        ~${tenDayGrowthMB.toFixed(2)} MB`);
    console.log(`   Projected total:      ${projectedTotalMB.toFixed(2)} MB / 512 MB`);
    console.log(`   Projected usage:      ${((projectedTotalMB / 512) * 100).toFixed(1)}%`);
    console.log(`   Remaining headroom:   ${(512 - projectedTotalMB).toFixed(2)} MB`);

    // 4. Verdict
    console.log('\n═══════════════════════════════════════════');
    if (projectedTotalMB < 256) {
        console.log('  ✅ VERDICT: Plenty of room! Under 50% even after 10 days.');
    } else if (projectedTotalMB < 400) {
        console.log('  ✅ VERDICT: Good — comfortably within 512MB limit.');
    } else if (projectedTotalMB < 480) {
        console.log('  ⚠️  VERDICT: Tight but feasible. Monitor closely.');
    } else {
        console.log('  ❌ VERDICT: May exceed 512MB! Consider cleanup or upgrade.');
    }
    console.log('═══════════════════════════════════════════\n');

    // NOTE: Images are stored on disk (server/uploads/), NOT in MongoDB.
    // Only metadata paths are in DB. So images don't count toward 512MB.
    console.log('💡 Note: Council photos & dept logos are on disk (server/uploads/),');
    console.log('   NOT stored in MongoDB. Only file paths are in the DB.\n');

    await mongoose.disconnect();
}

analyzeCapacity().catch(err => { console.error(err); process.exit(1); });
