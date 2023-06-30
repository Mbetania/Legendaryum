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
import { getClientById } from "./clientService";
import { generateCoins } from "../models/coins";
import config from '../utils/readJSONConfig';
export const createRoom = (room) => __awaiter(void 0, void 0, void 0, function* () {
    room.id = uuidv4();
    room.coinsAmount = config.coinsAmount;
    room.scale = config.scale;
    room.capacity = config.capacity;
    room.clients = [];
    room.coins = [];
    room.isActive = false;
    const roomData = JSON.stringify(room);
    yield redisClient.set(`room:${room.id}`, roomData);
    return room;
});
export const getRoomById = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const roomData = yield redisClient.get(`room:${roomId}`);
    if (!roomData) {
        return null;
    }
    let room = JSON.parse(roomData);
    // We get the full client data using the stored client IDs
    if (room.clients) {
        const clients = [];
        for (let clientId of room.clients) {
            const clientData = yield getClientById(clientId);
            if (clientData) {
                clients.push(clientData);
            }
        }
        room.clients = clients;
    }
    return room;
});
// Unir a un cliente a una sala
export const joinRoom = (roomId, clientId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const roomData = yield redisClient.get(`room:${roomId}`);
    if (!roomData) {
        return null;
    }
    const room = JSON.parse(roomData);
    // Verifica si el cliente ya está en la sala
    if ((_a = room.clients) === null || _a === void 0 ? void 0 : _a.includes(clientId)) {
        throw new Error('Client is already in the room');
    }
    // Verifica si la sala ha alcanzado su capacidad
    if (((_b = room.clients) === null || _b === void 0 ? void 0 : _b.length) === room.capacity) {
        throw new Error('Room is full');
    }
    // Instead of storing the full client object, we just store the client ID
    (_c = room.clients) === null || _c === void 0 ? void 0 : _c.push(clientId);
    // Generar y asignar monedas inmediatamente después de que un cliente se une a la sala
    if (((_d = room.clients) === null || _d === void 0 ? void 0 : _d.length) === room.capacity) {
        room.coins = generateCoins(room); //mapeamos a un arrays de ids de coins
        room.isActive = true; // The game starts now that all clients have joined and the coins have been generated
    }
    yield redisClient.set(`room:${roomId}`, JSON.stringify(room));
    return room;
});
export const generateCoinForRoom = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const roomData = yield redisClient.get(`room:${roomId}`);
    if (!roomData) {
        return null;
    }
    const room = JSON.parse(roomData);
    if (((_e = room.clients) === null || _e === void 0 ? void 0 : _e.length) === room.capacity) {
        // All clients have joined, so we can now generate and assign coins
        room.coins = generateCoins(room);
        room.isActive = true; // The game starts now that all clients have joined and the coins have been generated
    }
    yield redisClient.set(`room:${roomId}`, JSON.stringify(room));
    return room;
});
// Resetear una sala después de un juego
export const resetRoom = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    let roomData = yield redisClient.get(`room:${roomId}`);
    let room = roomData ? JSON.parse(roomData) : null;
    if (room) {
        // Aquí puedes restablecer los campos que necesitas, como el estado de la sala y las monedas
        room.isActive = false;
        room.clients = [];
        room.coins = [];
        yield redisClient.set(`room:${roomId}`, JSON.stringify(room));
    }
    return room;
});
