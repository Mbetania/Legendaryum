var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { randomInRange } from '../utils/positionGeneration';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
export const getCoin = (coinId) => __awaiter(void 0, void 0, void 0, function* () {
    const coin = yield redisClient.get(coinId);
    if (!coin) {
        throw new Error(`Coin with id ${coinId} does not exist`);
    }
    return JSON.parse(coin);
});
//generar coins
export const generateAndStoreCoins = (room, coinsAmount, area) => __awaiter(void 0, void 0, void 0, function* () {
    const coins = [];
    for (let i = 0; i < coinsAmount; i++) {
        const coin = {
            id: uuidv4(),
            position: {
                x: randomInRange(area.xmin, area.xmax),
                y: randomInRange(area.ymin, area.ymax),
                z: randomInRange(area.zmin, area.zmax),
            },
            ttl: 60 * 60,
        };
        coins.push(coin);
    }
    yield storeCoins(room, coins);
});
//almacena coins en redis
export const storeCoins = (room, coins) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `coins:${room}`;
    const value = JSON.stringify(coins);
    yield redisClient.set(key, value, 'EX', 60 * 60); // TTL de 1 hora
});
export const getCoinsInRoom = (room) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `coins:${room}`;
    const coinsString = yield redisClient.get(key);
    if (!coinsString) {
        throw new Error(`No coins found in room ${room}`);
    }
    const coins = JSON.parse(coinsString);
    console.log(`Retrieved ${coins.length} coins from room ${room}`);
    return coins;
});
export const getUserCoins = (userId, client) => __awaiter(void 0, void 0, void 0, function* () {
    return client.smembers(`user:${userId}:coins`);
});
export const isCoinAssociatedToUser = (userId, coinId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const isMember = yield client.sismember(`user:${userId}:coins`, coinId);
    return isMember === 1;
});
export const associateCoinToUser = (userId, coinId, client) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.sadd(`user:${userId}:coins`, coinId);
});
