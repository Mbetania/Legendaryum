var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createRoom, getRoomById, joinRoom } from '../services/roomService';
import { authenticateClientById, getClientById } from '../services/clientService';
import { generateCoins, grabCoin, isCoinAssociatedToUser } from '../services/coinService';
import { v4 as uuidv4 } from 'uuid';
export let clientList = {};
export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected with id', socket.id);
        socket.on('authenticate', (data) => __awaiter(void 0, void 0, void 0, function* () {
            let clientId = data.clientId || uuidv4();
            const client = yield authenticateClientById(clientId);
            clientList[socket.id] = { clientId: client.id };
            socket.emit('authenticated', { token: client.token, clientId: client.id });
        }));
        socket.on('get client data', (clientId) => __awaiter(void 0, void 0, void 0, function* () {
            const clientData = yield getClientById(clientId);
            socket.emit('client data', clientData);
        }));
        socket.on('create room', (roomData) => __awaiter(void 0, void 0, void 0, function* () {
            const createdRoom = yield createRoom(roomData);
            const clientInfo = clientList[socket.id];
            if (clientInfo && clientInfo.clientId) {
                try {
                    const joinedRoom = yield joinRoom(createdRoom.id, clientInfo.clientId);
                    if (joinedRoom && joinedRoom.id) {
                        clientInfo.roomId = joinedRoom.id;
                    }
                    else {
                        throw new Error('Error: the joined room is undefined or null');
                    }
                    socket.emit('joined room', joinedRoom);
                    io.emit('room created', createdRoom);
                    console.log('Server: emitted "room created" event');
                }
                catch (error) {
                    console.error('Error joining room:', error);
                    socket.emit('error', { message: 'Error joining room:' });
                }
            }
        }));
        socket.on('join room', (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const client = yield getClientById(data.clientId);
            if (client) {
                try {
                    const room = yield getRoomById(data.roomId);
                    if (room) {
                        if ((_a = room.clients) === null || _a === void 0 ? void 0 : _a.includes(client.id)) {
                            console.log(`User ${client.id} is already in the room ${room.id}`);
                            return;
                        }
                        const joinedRoom = yield joinRoom(room.id, client.id);
                        if (joinedRoom && joinedRoom.id) {
                            clientList[socket.id].roomId = joinedRoom.id;
                        }
                    }
                    io.to(data.roomId).emit('client joined', { clientId: client === null || client === void 0 ? void 0 : client.id });
                    console.log(`User ${socket.id} joined room ${room === null || room === void 0 ? void 0 : room.id}`);
                    console.log(`Emitted "client joined" event for client ${client === null || client === void 0 ? void 0 : client.id} in room ${data.roomId}`);
                    socket.emit('joined room', room);
                    console.log(`Server: Emitted "joined room" event for socket ${socket.id}`);
                    if (room && !room.isActive && !room.coins) {
                        room.isActive = true;
                        room.coins = yield generateCoins(room);
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
                if (coinGrabbed) {
                    socket.emit('error', { message: 'Coin has already been grabbed' });
                    return;
                }
                console.log(`User ${clientId} is trying to grab coin ${coinId} in room ${roomId}`);
                yield grabCoin(roomId, clientId, coinId);
                io.to(roomId).emit('coinUnaVailable', coinId);
                io.to(roomId).emit('coin grabbed', { coinId: coinId, clientId: clientId });
                const updatedRoom = yield getRoomById(roomId);
                io.to(roomId).emit('room updated', updatedRoom);
                if (updatedRoom && (!updatedRoom.coins || updatedRoom.coins.length === 0)) {
                    io.to(roomId).emit('end game');
                }
            }
            catch (error) {
                console.error('Error in grab coin: ', error);
                socket.emit('error', { message: 'Unable to grab coin' });
            }
            console.log(`User ${clientId} is trying to grab coin ${coinId} in room ${roomId}`);
        }));
        socket.on('disconnect', () => {
            console.log('A user has disconnected:', socket.id);
            delete clientList[socket.id];
        });
    });
};
