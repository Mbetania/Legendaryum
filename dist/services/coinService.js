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
import redisClient from "./redis";
import { getClientById } from './clientService';
import { getRoomById } from './roomService';
export const getCoinsOfUser = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const coinIds = yield getUserCoins(clientId, redisClient);
    const coins = [];
    for (let id of coinIds) {
        const coin = yield getCoin(id, redisClient);
        if (!coin) {
            console.error(`Coin with id ${id} does not exist`);
            continue;
        }
        coins.push(coin);
    }
    return coins;
});
export const getCoinById = (coinId) => __awaiter(void 0, void 0, void 0, function* () {
    const coinData = yield redisClient.get(`coins:${coinId}`);
    if (coinData) {
        const coin = JSON.parse(coinData);
        return coin;
    }
    return null;
});
export const getCoinsInRoom = (room) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `room:${room}:coins`;
    const coinIds = yield redisClient.smembers(key);
    if (!coinIds.length) {
        throw new Error(`No coins found in room ${room}`);
    }
    const coins = yield Promise.all(coinIds.map(coinId => getCoin(coinId, redisClient)));
    console.log(`Retrieved ${coins.length} coins from room ${room}`);
    return coins;
});
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
export const getUserCoins = (clientId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const coinIds = yield client.smembers(`client:${clientId}:coins`);
    return coinIds;
});
export const isCoinAssociatedToUser = (clientId, coinId, client) => __awaiter(void 0, void 0, void 0, function* () {
    const isMember = yield client.sismember(`client:${clientId}:coins`, coinId);
    return isMember === 1;
});
export const grabCoin = (roomId, clientId, coinId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const coin = yield getCoinById(coinId);
        const room = yield getRoomById(roomId);
        const client = yield getClientById(clientId);
        if (!coin || !room || !client) {
            console.log(roomId, coinId, clientId);
            throw new Error('Coin, room o client not found');
        }
        //associate coin with user
        if (client.coins) {
            client.coins = [];
        }
        client.coins.push(coin);
        yield redisClient.set(`client:${clientId}`, JSON.stringify(client));
        room.coins = (_a = room.coins) === null || _a === void 0 ? void 0 : _a.filter(coin => coin.id !== coinId);
        yield redisClient.set(`room:${roomId}`, JSON.stringify(room));
    }
    catch (error) {
        console.error('Error in grabCoin: ', error);
        throw error;
    }
});
