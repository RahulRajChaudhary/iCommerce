
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_DATABASE_URI!, {
  maxRetriesPerRequest: 5, // reduce retries during testing
  connectTimeout: 5000, // 5s timeout
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('ready', () => {
  console.log('✅ Redis is ready');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

redis.on('reconnecting', () => {
  console.log('🔁 Reconnecting to Redis...');
});

(async () => {
  try {
    const pong = await redis.ping();
    console.log('Ping:', pong); // Should log 'PONG'
  } catch (err) {
    console.error('Ping failed:', err);
  }
})();

export default redis;