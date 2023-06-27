var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCoinsInRoom, associateCoinToUser } from '../models/coins';
import { Redis } from 'ioredis';
export const socketHandler = (io) => {
    const redis = new Redis();
    io.on('connection', (socket) => {
        console.log('A user connected with id', socket.id);
        // When a client joins a room
        socket.on('join', (room) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`User ${socket.id} joined room ${room}`);
            socket.join(room);
            // const roomConfig: Room= onfig[room];
            // if (!roomConfig) {
            //   console.error(`No configuration found for room ${room}`);
            //   return
            // }
            // Retrieve the coins for this room and emit them to the client
            const coins = yield getCoinsInRoom(room);
            socket.emit('coins', coins);
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
