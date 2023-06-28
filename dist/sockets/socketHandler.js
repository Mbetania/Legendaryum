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
import { associateCoinToUser } from '../models/coins';
import { Redis } from 'ioredis';
import { createRoom, joinRoom } from '../services/roomService';
import { authenticateClientById, getClientById } from '../services/clientService';
export const socketHandler = (io) => {
    const redis = new Redis();
    io.on('connection', (socket) => {
        console.log('A user connected with id', socket.id);
        socket.on('authenticate', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const client = yield authenticateClientById(data.userId, data.username);
            socket.emit('authenticated', { token: client.token });
        }));
        socket.on('get client data', (userId) => __awaiter(void 0, void 0, void 0, function* () {
            const clientData = yield getClientById(userId);
            socket.emit('client data', clientData);
        }));
        socket.on('create room', (roomData) => __awaiter(void 0, void 0, void 0, function* () {
            // Genera un ID único para la sala
            const roomId = uuidv4();
            const room = Object.assign({ id: roomId }, roomData);
            yield createRoom(room);
            socket.emit('room created', { id: roomId });
        }));
        // When a client joins a room
        socket.on('join room', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const client = yield getClientById(data.userId);
            if (client) {
                try {
                    const room = yield joinRoom(data.roomId, client.id);
                    socket.to(data.roomId).emit('client joined', { clientId: client === null || client === void 0 ? void 0 : client.id });
                    console.log(`User ${socket.id} joined room ${room}`);
                    socket.emit('joined room', { roomId: room === null || room === void 0 ? void 0 : room.id });
                }
                catch (error) {
                    // Enviar un mensaje de error al cliente
                    socket.emit('error', { message: 'Unable to join room. Room is full.' });
                }
            }
            else {
                socket.emit('error', { message: 'Unable to join room. Client not found' });
            }
        }));
        // When a client grabs a coin
        socket.on('grabCoin', ({ id: coinId, room }) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`User ${socket.id} grabbed coin ${coinId} in room ${room}`);
            // Associate the coin with the user
            yield associateCoinToUser(socket.id, coinId, room, redis);
            // Emit coinUnavailable event to all other clients in the room
            socket.to(room).emit('coinUnavailable', coinId);
        }));
        // When a client disconnects
        socket.on('disconnect', () => {
            console.log('A user disconnected', socket.id);
        });
    });
};
