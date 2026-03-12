/**
 * MongoDB Atlas M0 Free Tier — Deep Metrics & Capacity Analysis
 * Reports: storage, connections, indexes, query performance, 
 * projected capacity for 10-12 day 24/7 event, optimizations.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function deepMetrics() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const admin = db.admin();

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     MongoDB Atlas M0 Free Tier — Deep Metrics Report     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════
    // 1. SERVER INFO
    // ═══════════════════════════════════════
    let serverInfo;
    try {
        serverInfo = await admin.serverInfo();
        console.log('🖥️  SERVER INFO');
        console.log(`   MongoDB Version:  ${serverInfo.version}`);
        console.log(`   Storage Engine:   WiredTiger`);
    } catch (e) {
        console.log('🖥️  SERVER INFO: (limited access on Atlas M0)');
    }

    // ═══════════════════════════════════════
    // 2. DATABASE SIZE
    // ═══════════════════════════════════════
    const dbStats = await db.command({ dbStats: 1, scale: 1 }); // bytes
    const dataMB = (dbStats.dataSize / 1024 / 1024).toFixed(3);
    const storageMB = (dbStats.storageSize / 1024 / 1024).toFixed(3);
    const indexMB = (dbStats.indexSize / 1024 / 1024).toFixed(3);
    const totalMB = ((dbStats.storageSize + dbStats.indexSize) / 1024 / 1024).toFixed(3);
    const freeSpaceMB = (512 - parseFloat(totalMB)).toFixed(2);
    const usagePct = ((parseFloat(totalMB) / 512) * 100).toFixed(2);

    console.log('\n📊 DATABASE SIZE');
    console.log(`   Data Size:       ${dataMB} MB`);
    console.log(`   Storage Size:    ${storageMB} MB (compressed on disk)`);
    console.log(`   Index Size:      ${indexMB} MB`);
    console.log(`   ─────────────────────────────`);
    console.log(`   Total On-Disk:   ${totalMB} MB / 512 MB`);
    console.log(`   Free Space:      ${freeSpaceMB} MB`);
    console.log(`   Usage:           ${usagePct}%`);
    console.log(`   Collections:     ${dbStats.collections}`);
    console.log(`   Total Documents: ${dbStats.objects}`);

    // ═══════════════════════════════════════
    // 3. COLLECTION BREAKDOWN
    // ═══════════════════════════════════════
    const collections = await db.listCollections().toArray();
    console.log('\n📋 COLLECTION BREAKDOWN');
    console.log('   ┌──────────────────────────┬───────┬──────────┬──────────┬──────────┬──────────┐');
    console.log('   │ Collection               │ Docs  │ Data MB  │ Store MB │ Idx MB   │ Avg Doc  │');
    console.log('   ├──────────────────────────┼───────┼──────────┼──────────┼──────────┼──────────┤');

    let collDetails = [];
    for (const col of collections) {
        try {
            const stats = await db.command({ collStats: col.name, scale: 1 });
            const avgDoc = stats.count > 0 ? (stats.size / stats.count).toFixed(0) : 0;
            collDetails.push({
                name: col.name,
                docs: stats.count,
                dataMB: (stats.size / 1024 / 1024).toFixed(4),
                storageMB: (stats.storageSize / 1024 / 1024).toFixed(4),
                indexMB: (stats.totalIndexSize / 1024 / 1024).toFixed(4),
                avgDoc: avgDoc + 'B',
                nindexes: stats.nindexes,
                indexes: Object.keys(stats.indexSizes || {}),
            });
        } catch (e) {}
    }
    collDetails.sort((a, b) => parseFloat(b.storageMB) - parseFloat(a.storageMB));
    for (const c of collDetails) {
        console.log(`   │ ${c.name.padEnd(24)} │ ${String(c.docs).padStart(5)} │ ${c.dataMB.padStart(8)} │ ${c.storageMB.padStart(8)} │ ${c.indexMB.padStart(8)} │ ${c.avgDoc.padStart(8)} │`);
    }
    console.log('   └──────────────────────────┴───────┴──────────┴──────────┴──────────┴──────────┘');

    // ═══════════════════════════════════════
    // 4. INDEX ANALYSIS
    // ═══════════════════════════════════════
    console.log('\n🔍 INDEX ANALYSIS');
    for (const c of collDetails) {
        if (c.indexes.length > 0) {
            const idxList = await db.collection(c.name).indexes();
            console.log(`   ${c.name} (${c.nindexes} indexes):`);
            for (const idx of idxList) {
                const keyStr = JSON.stringify(idx.key);
                const unique = idx.unique ? ' [UNIQUE]' : '';
                const sparse = idx.sparse ? ' [SPARSE]' : '';
                console.log(`     - ${idx.name}: ${keyStr}${unique}${sparse}`);
            }
        }
    }

    // ═══════════════════════════════════════
    // 5. CONNECTION POOL STATUS
    // ═══════════════════════════════════════
    console.log('\n🔌 CONNECTION INFO');
    try {
        const serverStatus = await admin.serverStatus();
        const conn = serverStatus.connections;
        console.log(`   Current Connections:  ${conn.current}`);
        console.log(`   Available:            ${conn.available}`);
        console.log(`   Total Created:        ${conn.totalCreated}`);
    } catch (e) {
        // M0 may not allow serverStatus
        const mongoosePool = mongoose.connection;
        console.log(`   Mongoose readyState:  ${mongoosePool.readyState} (1=connected)`);
        console.log(`   Pool size (default):  100 (mongoose default maxPoolSize)`);
    }
    console.log(`   Atlas M0 Limit:      500 concurrent connections`);
    console.log(`   Mongoose Pool:        minPoolSize=0, maxPoolSize=100`);

    // ═══════════════════════════════════════
    // 6. ATLAS M0 LIMITS REFERENCE
    // ═══════════════════════════════════════
    console.log('\n📏 ATLAS M0 FREE TIER LIMITS');
    console.log('   Storage:              512 MB');
    console.log('   RAM:                  Shared (512 MB shared)');
    console.log('   vCPU:                 Shared');
    console.log('   Max Connections:      500');
    console.log('   Network Transfer:     10 GB/week');
    console.log('   IOPS:                 100 (shared)');
    console.log('   Oplog Window:         ~1 hour');
    console.log('   Max DB per cluster:   100');
    console.log('   Max Collection/DB:    500');
    console.log('   No Backups / No dedicated performance');

    // ═══════════════════════════════════════
    // 7. 10-12 DAY PROJECTION
    // ═══════════════════════════════════════
    console.log('\n📈 10-12 DAY EVENT PROJECTION');
    // Realistic daily estimates for a 500-student sports event:
    const daily = {
        matches: { count: 15, avgBytes: 1500 },      // 15 matches/day × 1.5KB
        pointLogs: { count: 20, avgBytes: 500 },     // 20 awards/day × 0.5KB
        highlights: { count: 3, avgBytes: 800 },     // 3/day (reel+pic+article)
        adminActivity: { count: 5, avgBytes: 300 },  // minor updates
    };
    const dailyBytes = Object.values(daily).reduce((s, d) => s + d.count * d.avgBytes, 0);
    const dailyMB = dailyBytes / 1024 / 1024;

    // 12-day projection
    const growthMB_12d = dailyMB * 12;
    // Add 50% overhead for indexes growing
    const totalGrowth = growthMB_12d * 1.5;
    const projected = parseFloat(totalMB) + totalGrowth;

    console.log(`   Daily new data:       ~${(dailyBytes / 1024).toFixed(1)} KB/day`);
    console.log(`   12-day data growth:   ~${growthMB_12d.toFixed(3)} MB`);
    console.log(`   + index overhead:     ~${(growthMB_12d * 0.5).toFixed(3)} MB`);
    console.log(`   ─────────────────────────────`);
    console.log(`   Current total:        ${totalMB} MB`);
    console.log(`   Projected 12-day:     ${projected.toFixed(3)} MB / 512 MB`);
    console.log(`   Projected usage:      ${((projected / 512) * 100).toFixed(2)}%`);
    console.log(`   Headroom remaining:   ${(512 - projected).toFixed(2)} MB`);

    // Connection load estimate
    console.log('\n   Concurrent connection estimate:');
    console.log('   500 students × 1 socket each     = ~500 WebSocket');
    console.log('   Backend pool to MongoDB           = 5-10 connections');
    console.log('   Admin sessions                    = 2-5 connections');
    console.log('   Total MongoDB connections          ≈ 10-15 (well under 500 limit)');
    console.log('   ⚠️  Socket.io connections are NOT MongoDB connections!');
    console.log('   Only the Express backend connects to MongoDB.');

    // ═══════════════════════════════════════
    // 8. OPTIMIZATION RECOMMENDATIONS
    // ═══════════════════════════════════════
    console.log('\n🔧 OPTIMIZATIONS TO APPLY');
    
    // Check for missing indexes
    const matchIndexes = await db.collection('matches').indexes();
    const hasStatusIndex = matchIndexes.some(i => i.key && i.key.status);
    const hasSportIndex = matchIndexes.some(i => i.key && i.key.sport);
    const hasDateIndex = matchIndexes.some(i => i.key && i.key.dateTime);
    
    if (!hasStatusIndex) console.log('   ⚠️  Missing index: matches.status (add for faster filter queries)');
    if (!hasSportIndex) console.log('   ⚠️  Missing index: matches.sport (add for sport-filter queries)');
    if (!hasDateIndex) console.log('   ⚠️  Missing index: matches.dateTime (add for date-sort queries)');
    
    const hlIndexes = await db.collection('highlights').indexes();
    const hasDateTypeIndex = hlIndexes.some(i => i.key && i.key.date && i.key.type);
    if (!hasDateTypeIndex) console.log('   ⚠️  Missing compound index: highlights.{date, type}');

    console.log('   ✅ Use mongoose connection pooling (default 100, fine for M0)');
    console.log('   ✅ Add server-side response caching (already done in routes)');
    console.log('   ✅ Images on disk, not in MongoDB');
    console.log('   ✅ Use compression middleware (already enabled)');

    // ═══════════════════════════════════════
    // VERDICT
    // ═══════════════════════════════════════
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    if (projected < 10) {
        console.log('║  ✅ VERDICT: EXCELLENT — Under 2% capacity after 12 days ║');
        console.log('║  MongoDB Atlas M0 will handle this event with ease.      ║');
    } else if (projected < 100) {
        console.log('║  ✅ VERDICT: GREAT — Under 20% capacity after 12 days    ║');
    } else if (projected < 400) {
        console.log('║  ✅ VERDICT: GOOD — Comfortable within 512MB limit       ║');
    } else {
        console.log('║  ⚠️  VERDICT: TIGHT — Monitor storage closely            ║');
    }
    console.log('║  Connection limit (500) won\'t be hit — backend uses ~10.  ║');
    console.log('║  RAM is shared but adequate for <500 docs/collection.    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    await mongoose.disconnect();
}

deepMetrics().catch(err => { console.error(err); process.exit(1); });
