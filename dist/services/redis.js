import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
    password: process.env.REDIS_PASSWORD,
});
export default redisClient;
