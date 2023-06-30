var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Redis } from 'ioredis';
import { createRoom, getRoomById, joinRoom } from '../services/roomService';
import { authenticateClientById, getClientById, getCoinById } from '../services/clientService';
import redisClient from '../services/redis';
export let socketToClientMap = {};
export const socketHandler = (io) => {
    const redis = new Redis();
    io.on('connection', (socket) => {
        console.log('A user connected with id', socket.id);
        socket.on('authenticate', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const client = yield authenticateClientById(data.clientId, data.username);
            // Store the mapping between socket.id and client.id
            socketToClientMap[socket.id] = client.id;
            socket.emit('authenticated', { token: client.token });
        }));
        socket.on('get client data', (clientId) => __awaiter(void 0, void 0, void 0, function* () {
            const clientData = yield getClientById(clientId);
            socket.emit('client data', clientData);
        }));
        socket.on('create room', (roomData) => __awaiter(void 0, void 0, void 0, function* () {
            const room = Object.assign({}, roomData);
            const createdRoom = yield createRoom(room);
            socket.emit('room created', { id: createdRoom.id });
        }));
        // When a client joins a room
        socket.on('join room', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const client = yield getClientById(data.clientId);
            if (client) {
                try {
                    const room = yield joinRoom(data.roomId, client.id);
                    socket.to(data.roomId).emit('client joined', { clientId: client === null || client === void 0 ? void 0 : client.id });
                    console.log(`User ${socket.id} joined room ${room === null || room === void 0 ? void 0 : room.id}`);
                    socket.emit('joined room', { roomId: room === null || room === void 0 ? void 0 : room.id });
                    // Check if the room is active and coins were generated
                    if (room && room.isActive && room.coins) {
                        // Emit the generated coins to the room
                        io.to(data.roomId).emit('coins generated', { coins: room.coins });
                    }
                }
                catch (error) {
                    // Send an error message to the client
                    console.error('Error in joinRoom:', error);
                    socket.emit('error', { message: 'Unable to join room. Room is full.' });
                }
            }
            else {
                socket.emit('error', { message: 'Unable to join room. Client not found' });
            }
        }));
        // When a client grabs a coin
        socket.on('grabCoin', ({ coinId, roomId, clientId, position }) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            console.log(`User ${clientId} grabbed coin ${coinId} in room ${roomId}`);
            const client = yield getClientById(clientId);
            const room = yield getRoomById(roomId);
            if (client && room) {
                // Associate the coin with the user
                const { id, position } = (yield getCoinById(coinId)) || {};
                console.log(id, position);
                if (id && position) {
                    (_a = client.coins) === null || _a === void 0 ? void 0 : _a.push({ id, position }); // Añade la moneda al cliente
                }
                yield redisClient.set(`client:${clientId}`, JSON.stringify(client)); // Almacena el cliente en Redis
                // Remove the coin from the room
                room.coins = (_b = room.coins) === null || _b === void 0 ? void 0 : _b.filter(id => id !== coinId);
                yield redisClient.set(`room:${roomId}`, JSON.stringify(room)); // Actualiza la sala en Redis
                // Emit coinUnavailable event to all other clients in the room
                socket.to(roomId).emit('coinUnavailable', coinId);
            }
            else {
                socket.emit('error', { message: 'Unable to grab coin. Client or room not found' });
            }
        }));
        // When a client disconnects
        socket.on('disconnect', () => {
            console.log('A user disconnected', socket.id);
            delete socketToClientMap[socket.id];
        });
    });
};
