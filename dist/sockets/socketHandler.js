var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createRoom, joinRoom } from '../services/roomService';
import { authenticateClientById, getClientById } from '../services/clientService';
import { grabCoin, isCoinAssociatedToUser } from '../services/coinService';
import { v4 as uuidv4 } from 'uuid';
export let socketToClientMap = {};
export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected with id', socket.id);
        socket.on('authenticate', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const clientId = data.clientId || uuidv4();
            const client = yield authenticateClientById(clientId);
            socketToClientMap[socket.id] = client.id;
            socket.emit('authenticated', { token: client.token, clientId: client.id });
        }));
        socket.on('get client data', (clientId) => __awaiter(void 0, void 0, void 0, function* () {
            const clientData = yield getClientById(clientId);
            socket.emit('client data', clientData);
        }));
        socket.on('create room', (roomData) => __awaiter(void 0, void 0, void 0, function* () {
            const room = Object.assign({}, roomData);
            const createdRoom = yield createRoom(room);
            io.emit('room created', { id: createdRoom.id });
        }));
        socket.on('join room', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const client = yield getClientById(data.clientId);
            if (client) {
                try {
                    const room = yield joinRoom(data.roomId, client.id);
                    io.to(data.roomId).emit('client joined', { clientId: client === null || client === void 0 ? void 0 : client.id });
                    console.log(`User ${socket.id} joined room ${room === null || room === void 0 ? void 0 : room.id}`);
                    socket.emit('joined room', { roomId: room === null || room === void 0 ? void 0 : room.id });
                    if (room && room.isActive && room.coins) {
                        io.to(data.roomId).emit('coins generated', { coins: room.coins });
                    }
                }
                catch (error) {
                    console.error('Error in joinRoom:', error);
                    socket.emit('error', { message: 'Unable to join room. Room is full.' });
                }
            }
            else {
                socket.emit('error', { message: 'Unable to join room. Client not found' });
            }
        }));
        socket.on('grab coin', ({ roomId, clientId, coinId }) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`User ${clientId} grabbed coin ${coinId} in room ${roomId}`);
            try {
                const coinGrabbed = yield isCoinAssociatedToUser(clientId, coinId);
                if (!coinGrabbed) {
                    yield grabCoin(roomId, clientId, coinId);
                    io.to(roomId).emit('coinUnaVailable', coinId);
                    io.to(roomId).emit('coin grabbed', { coinId: coinId, clientId: clientId });
                    // Enviar un evento 'end game' a todos los clientes de la sala
                    io.to(roomId).emit('end game');
                }
            }
            catch (error) {
                console.error('Error in grab coin: ', error);
                socket.emit('error', { message: 'Unable to grab coin' });
            }
        }));
    });
};
