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
    const coinIds = yield getUserCoinsIds(clientId);
    const coins = [];
    for (let id of coinIds) {
        const coin = yield getCoinById(id);
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
        let coin;
        try {
            coin = JSON.parse(coinData);
        }
        catch (error) {
            console.error('Error parsing coinData: ', error);
            throw error;
        }
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
    const coins = yield Promise.all(coinIds.map(coinId => getCoinById(coinId)));
    console.log(`Retrieved ${coins.length} coins from room ${room}`);
    return coins.filter((coin) => coin !== null);
});
// Genera una serie de monedas para una sala específica.
export const generateCoins = (room) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield redisClient.set(`coins:${coin.id}`, JSON.stringify(coin));
    }
    return coins;
});
export const getUserCoinsIds = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const coinIds = yield redisClient.smembers(`client:${clientId}:coins`);
    return coinIds;
});
export const isCoinAssociatedToUser = (clientId, coinId) => __awaiter(void 0, void 0, void 0, function* () {
    const isMember = yield redisClient.sismember(`client:${clientId}:coins`, coinId);
    return isMember === 1;
});
export const grabCoin = (roomId, clientId, coinId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coin = yield getCoinById(coinId);
        const room = yield getRoomById(roomId);
        const client = yield getClientById(clientId);
        if (!coin || !room || !client) {
            console.log(roomId, coinId, clientId);
            throw new Error('Coin, room or client not found');
        }
        // Mark the coin as collected
        coin.isCollected = true;
        yield redisClient.set(`coins:${coin.id}`, JSON.stringify(coin));
        // Associate coin with user
        if (!client.coins) {
            client.coins = [];
        }
        client.coins.push(coin);
        yield redisClient.set(`client:${clientId}`, JSON.stringify(client));
        // Remove coin from room
        yield removeCoinFromRoom(roomId, coin.id);
    }
    catch (error) {
        console.error('Error in grabCoin: ', error);
        throw error;
    }
});
export const removeCoinFromRoom = (roomId, coinId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const room = yield getRoomById(roomId);
    if (!room) {
        throw new Error('Room not found');
    }
    room.coins = (_a = room.coins) === null || _a === void 0 ? void 0 : _a.filter((coin) => coin.id !== coinId);
    yield redisClient.set(`room:${roomId}`, JSON.stringify(room));
});
