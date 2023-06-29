var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v4 as uuidv4 } from 'uuid';
export const getCoin = (coinId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const coin = yield client.get(`coin:${coinId}`);
    if (!coin) {
        throw new Error(`Coin with id ${coinId} does not exist`);
    }
    return JSON.parse(coin);
});
// Genera una serie de monedas para una sala específica.
export const generateCoins = (room) => {
    const coins = [];
    for (let i = 0; i < room.coinsAmount; i++) {
        const coin = {
            id: uuidv4(),
            position: {
                x: Math.random() * room.scale.x,
                y: Math.random() * room.scale.y,
                z: Math.random() * room.scale.z,
            },
            ttl: 60 * 60,
            isCollected: false
        };
        coins.push(coin);
    }
    return coins;
};
export const getUserCoins = (userId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const coinIds = yield client.smembers(`user:${userId}:coins`);
    return coinIds;
});
export const isCoinAssociatedToUser = (userId, coinId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const isMember = yield client.sismember(`user:${userId}:coins`, coinId);
    return isMember === 1;
});
