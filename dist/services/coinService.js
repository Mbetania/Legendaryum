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
    throw new Error('Coin not found');
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
        yield redisClient.set(`coins:${coin.id}`, JSON.stringify(coin), 'EX', coin.ttl);
        yield redisClient.sadd(`room:${room.id}:coins`, coin.id);
    }
    room.coins = coins.map(coin => ({ id: coin.id, position: coin.position, ttl: coin.ttl, isCollected: coin.isCollected }));
    yield redisClient.set(`room:${room.id}`, JSON.stringify(room));
    return coins;
});
export const isCoinAssociatedToUser = (clientId, coinId) => __awaiter(void 0, void 0, void 0, function* () {
    const isMember = yield redisClient.sismember(`client:${clientId}:coins`, coinId);
    return isMember === 1;
});
export const grabCoin = (roomId, clientId, coinId) => __awaiter(void 0, void 0, void 0, function* () {
    const roomCoinsKey = `room:${roomId}:coins`;
    const clientCoinsKey = `client:${clientId}:coins`;
    const coinExistsInRoom = yield redisClient.sismember(roomCoinsKey, coinId);
    if (!coinExistsInRoom) {
        throw new Error('Coin does not exist in this room');
    }
    const coin = yield getCoinById(coinId);
    if (!coin) {
        throw new Error('Coin does not exist');
    }
    coin.isCollected = true;
    yield redisClient.set(`coins:${coin.id}`, JSON.stringify(coin), 'EX', coin.ttl);
    const pipeline = redisClient.multi();
    pipeline.srem(roomCoinsKey, coinId);
    pipeline.sadd(clientCoinsKey, coinId);
    const results = yield pipeline.exec();
    if (!results) {
        throw new Error('Could not execute pipeline');
    }
    if (results[0][1] !== 1 || results[1][1] !== 1) {
        throw new Error('Could not grab the coin');
    }
});
export const getUserCoinsIds = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const coinIds = yield redisClient.smembers(`client:${clientId}:coins`);
    return coinIds;
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
