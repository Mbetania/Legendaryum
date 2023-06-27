var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import redisClient from './redis';
export const getCoin = (coinId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const coin = yield client.get(`coin:${coinId}`);
    if (!coin) {
        throw new Error(`Coin with id ${coinId} does not exist`);
    }
    return JSON.parse(coin);
});
// //generar coins
// export const generateAndStoreCoins = async (room: string, coinsAmount: number, area: Area): Promise<void> => {
//   const coins: Coin[] = [];
//   for (let i = 0; i < coinsAmount; i++) {
//     const coin: Coin = {
//       id: uuidv4(),
//       position: {
//         x: randomInRange(area.xmin, area.xmax),
//         y: randomInRange(area.ymin, area.ymax),
//         z: randomInRange(area.zmin, area.zmax),
//       },
//       ttl: 60 * 60,
//     };
//     coins.push(coin);
//   }
//   await storeCoins(room, coins);
// }
//almacena coins en redis
export const storeCoins = (room, coins) => __awaiter(void 0, void 0, void 0, function* () {
    for (const coin of coins) {
        const key = `coin:${coin.id}`;
        const value = JSON.stringify(coin);
        yield redisClient.set(key, value, 'EX', 60 * 60); // TTL de 1 hora
        yield redisClient.sadd(`coins:${room}`, coin.id); // Add coinId to room's coin set
    }
});
export const getCoinsInRoom = (room) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `coins:${room}`;
    const coinIds = yield redisClient.smembers(key);
    if (!coinIds.length) {
        throw new Error(`No coins found in room ${room}`);
    }
    const coins = [];
    for (const coinId of coinIds) {
        const coin = yield getCoin(coinId, redisClient);
        coins.push(coin);
    }
    console.log(`Retrieved ${coins.length} coins from room ${room}`);
    return coins;
});
export const getUserCoins = (userId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const coinIds = yield client.smembers(`user:${userId}:coins`);
    return coinIds;
});
export const isCoinAssociatedToUser = (userId, coinId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const isMember = yield client.sismember(`user:${userId}:coins`, coinId);
    return isMember === 1;
});
export const associateCoinToUser = (userId, coinId, room, client) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.srem(`room:${room}:coins`, coinId);
    yield client.sadd(`user:${userId}:coins`, coinId);
});
