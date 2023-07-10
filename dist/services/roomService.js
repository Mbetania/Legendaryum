var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import redisClient from "./redis";
import { v4 as uuidv4 } from 'uuid';
import config from '../utils/readJSONConfig';
import { generateCoins } from "./coinService";
export const createRoom = (roomData) => __awaiter(void 0, void 0, void 0, function* () {
    const room = Object.assign({ id: uuidv4(), coinsAmount: config.coinsAmount, scale: config.scale, capacity: config.capacity, clients: [], coins: [], isActive: false }, roomData);
    const roomString = JSON.stringify(room);
    yield redisClient.set(`room:${room.id}`, roomString);
    return room;
});
export const getRoomById = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const roomData = yield redisClient.get(`room:${roomId}`);
    if (!roomData) {
        throw new Error('Room not found');
    }
    let room;
    try {
        room = JSON.parse(roomData);
    }
    catch (error) {
        console.error('Error parsing roomData: ', error);
        throw error;
    }
    return room;
});
export const joinRoom = (roomId, clientId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const roomData = yield redisClient.get(`room:${roomId}`);
    if (!roomData) {
        throw new Error("room not found");
    }
    const room = JSON.parse(roomData);
    if ((_a = room.clients) === null || _a === void 0 ? void 0 : _a.includes(clientId)) {
        console.log('Cliento in room');
    }
    room.clients = room.clients || [];
    const capacity = room.capacity || 0;
    if (room.clients.length >= capacity) {
        throw new Error('Room is full');
    }
    room.clients.push(clientId);
    if (room.clients.length === capacity) {
        room.coins = yield generateCoins(room);
        room.isActive = true;
    }
    yield redisClient.set(`room:${roomId}`, JSON.stringify(room));
    return room;
});
export const resetRoom = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    let roomData = yield redisClient.get(`room:${roomId}`);
    let room = roomData ? JSON.parse(roomData) : null;
    if (room) {
        room.isActive = false;
        room.clients = [];
        room.coins = [];
        yield redisClient.set(`room:${roomId}`, JSON.stringify(room));
    }
    return room;
});
