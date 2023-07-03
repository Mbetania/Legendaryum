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
            // Aquí obtenemos el clientId asociado con el socket actual
            const clientId = socketToClientMap[socket.id];
            if (clientId) {
                // Aquí intentamos unir al cliente a la sala que acaba de crear
                try {
                    const joinedRoom = yield joinRoom(createdRoom.id, clientId);
                    // Emitir el evento 'joined room' al cliente que creó la sala
                    socket.emit('joined room', joinedRoom);
                    // Ahora se activa la sala y se generan las monedas
                    if (joinedRoom && !joinedRoom.isActive && !joinedRoom.coins) {
                        joinedRoom.isActive = true;
                        joinedRoom.coins = yield generateCoins(joinedRoom);
                        io.to(createdRoom.id).emit('coins generated', { coins: joinedRoom.coins });
                    }
                    // Emitir el evento 'room created' a todos los otros clientes
                    io.emit('room created', createdRoom);
                    console.log('Servidor: emitido evento "room created"');
                }
                catch (error) {
                    console.error('Error al unir a la sala:', error);
                    socket.emit('error', { message: 'No se puede unir a la sala.' });
                }
            }
        }));
        socket.on('join room', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const client = yield getClientById(data.clientId);
            if (client) {
                try {
                    const room = yield joinRoom(data.roomId, client.id);
                    io.to(data.roomId).emit('client joined', { clientId: client === null || client === void 0 ? void 0 : client.id });
                    console.log(`User ${socket.id} joined room ${room === null || room === void 0 ? void 0 : room.id}`);
                    socket.emit('joined room', room);
                    console.log(`Servidor: emitido evento "joined room" para el socket ${socket.id}`);
                    // La sala se activa y se generan las monedas cuando se ha unido el último cliente
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
        }));
    });
};
