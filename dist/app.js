var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { associateCoinToUser, generateAndStoreCoins, isCoinAssociatedToUser, storeCoins } from './models/coins';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import coinsInRoomRouter from './api/coins/readCoins';
import usersRouter from './api/users/postController';
import coinAmountUsersRouter from './api/users/getControllers';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;
const redis = new Redis();
const httpServer = createServer(app);
const io = new Server(httpServer);
const rawData = readFileSync(join(__dirname, '../src/roomConfig.json'), 'utf-8');
const config = JSON.parse(rawData);
app.use('/', usersRouter);
app.use('/users', coinAmountUsersRouter);
app.use('/rooms', coinsInRoomRouter);
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`A user Connected with id ${socket.id}`);
    // When a client joins a room, send them all the available coins in that room
    socket.on('join', (room) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const coinsString = yield redis.get(`coins:${room}`);
            const coins = coinsString ? JSON.parse(coinsString) : [];
            socket.emit('coins', coins);
        }
        catch (error) {
            console.error('Error fetching coins:', error);
        }
    }));
    // When a client grabs a coin, remove it from Redis and notify all clients in the room
    socket.on('grabCoin', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, room, userId } = data;
        try {
            // Verifica si la moneda ya está asociada a un usuario
            const isAssociated = yield isCoinAssociatedToUser(userId, id, redis);
            if (!isAssociated) {
                // Asociar la moneda al usuario
                yield associateCoinToUser(userId, id, redis);
                const coinsString = yield redis.get(`coins:${room}`);
                const coins = coinsString ? JSON.parse(coinsString) : [];
                const remainingCoins = coins.filter((coin) => coin.id !== id);
                yield storeCoins(room, remainingCoins);
                io.to(room).emit('coinUnavailable', id);
            }
        }
        catch (error) {
            console.error('Error grabbing coin:', error);
        }
    }));
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });
}));
// Function to initialize the server
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const room in config) {
            const pickedRoom = config[room];
            const { coinsAmount, area } = pickedRoom;
            yield generateAndStoreCoins(room, coinsAmount, area);
        }
        httpServer.listen(port, () => {
            console.log(`Server running on port: ${port}`);
        });
    });
}
init();
