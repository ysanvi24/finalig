// Server-side Caching Utility
// Provides in-memory caching for API responses

const NodeCache = require('node-cache');

// Create cache instance
// stdTTL: Default time-to-live in seconds (300 = 5 minutes)
// checkperiod: Period for automatic delete check in seconds
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 120,
  useClones: false // Better performance, be careful with mutable objects
});

// Middleware for caching GET requests
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Key', key);
      if (cachedResponse && typeof cachedResponse === 'object' && 'body' in cachedResponse) {
        res.status(cachedResponse.statusCode || 200);
        return res.json(cachedResponse.body);
      }

      return res.json(cachedResponse);
    }

    res.set('X-Cache', 'MISS');
    res.set('X-Cache-Key', key);
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, {
          statusCode: res.statusCode,
          body,
        }, duration);
      }

      return originalJson(body);
    };
    
    next();
  };
};

// Clear cache for specific routes or patterns
const clearCache = (pattern) => {
  if (!pattern) {
    // Clear all cache
    cache.flushAll();
    console.log('✓ All cache cleared');
    return;
  }

  const keys = cache.keys();
  let cleared = 0;
  
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
      cleared++;
    }
  });
  
  console.log(`✓ Cleared ${cleared} cache entries matching: ${pattern}`);
};

// Clear cache when data changes
const clearCacheOnUpdate = (patterns = []) => {
  return (req, res, next) => {
    // Clear cache after successful mutation
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => clearCache(pattern));
      }
    });
    next();
  };
};

// Get cache statistics
const getCacheStats = () => {
  return cache.getStats();
};

// Manual cache operations
const get = (key) => cache.get(key);
const set = (key, value, ttl) => cache.set(key, value, ttl);
const del = (key) => cache.del(key);
const has = (key) => cache.has(key);

// Clear expired cache entries
const clearExpired = () => {
  const keys = cache.keys();
  keys.forEach(key => {
    const ttl = cache.getTtl(key);
    if (ttl && ttl < Date.now()) {
      cache.del(key);
    }
  });
};

// Example usage patterns:
// 
// 1. Basic caching (5 minutes):
//    router.get('/api/leaderboard', cacheMiddleware(300), controller.getLeaderboard);
//
// 2. Short cache (1 minute):
//    router.get('/api/matches/live', cacheMiddleware(60), controller.getLiveMatches);
//
// 3. Long cache (1 hour):
//    router.get('/api/departments', cacheMiddleware(3600), controller.getDepartments);
//
// 4. Clear cache on update:
//    router.post('/api/match/score', clearCacheOnUpdate(['/api/leaderboard', '/api/matches']), controller.updateScore);

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
  clearCacheOnUpdate,
  getCacheStats,
  get,
  set,
  del,
  has,
  clearExpired
};
