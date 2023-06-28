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
// Crea una sala al inicio del servidor
export const createRoom = (room) => __awaiter(void 0, void 0, void 0, function* () {
    room.id = uuidv4();
    room.coinsAmount = 0; // Agrega las propiedades aquí
    room.scale = { x: 0, y: 0, z: 0 }; // Agrega las propiedades aquí
    room.ttl = 0; // Agrega las propiedades aquí
    room.capacity = 4; // Agrega las propiedades aquí
    room.clients = []; // Agrega las propiedades aquí
    room.coins = []; // Agrega las propiedades aquí
    room.isActive = false; // Agrega las propiedades aquí
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
    // If clients data is not included in the serialization, we get it manually
    if (room.clients) {
        const clients = [];
        for (let clientId of room.clients) {
            const clientData = yield redisClient.get(`user:${clientId}`);
            clients.push(clientData ? JSON.parse(clientData) : null);
        }
        room.clients = clients;
    }
    return room;
});
// Unir a un cliente a una sala
export const joinRoom = (roomId, clientId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const roomData = yield redisClient.get(`room:${roomId}`);
    const clientData = yield redisClient.get(`user:${clientId}`);
    if (!roomData || !clientData) {
        return null;
    }
    const room = JSON.parse(roomData);
    const client = JSON.parse(clientData);
    (_a = room.clients) === null || _a === void 0 ? void 0 : _a.push(client);
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
