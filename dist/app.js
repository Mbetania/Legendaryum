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
import { associateCoinToUser, generateAndStoreCoins, getCoin, isCoinAssociatedToUser, storeCoins } from './models/coins';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import coinControllersRouter from './api/coins/coinControllers';
import usersRouter from './api/users/postController';
import coinAmountUsersRouter from './api/users/getControllers';
import config from './utils/readJSONConfig';
const app = express();
const port = 3000;
const redis = new Redis();
const httpServer = createServer(app);
const io = new Server(httpServer);
app.use('/', usersRouter);
app.use('/users', coinAmountUsersRouter);
app.use('/rooms', coinControllersRouter);
const connectedClients = [];
let roomIndex = 0;
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`A user Connected with id ${socket.id}`);
    connectedClients.push(socket.id);
    if (connectedClients.length === 4) {
        if (roomIndex >= Object.keys(config).length) {
            console.log('No more room configuration available');
            return;
        }
        const room = Object.keys(config)[roomIndex];
        const { coinsAmount, area } = config[room];
        yield generateAndStoreCoins(room, coinsAmount, area);
        for (let i = 0; i < 4; i++) {
            io.to(connectedClients[i]).emit('roomAvailable', { room, coins: coinsAmount });
        }
        connectedClients.splice(0, 4);
        roomIndex++;
    }
    socket.on('join', (room) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const coinIds = yield redis.smembers(`coins:${room}`);
            const coins = [];
            for (let coinId of coinIds) {
                const coin = yield getCoin(coinId, redis);
                if (coin) {
                    coins.push(coin);
                }
                else {
                    console.warn(`Coin with id ${coinId} does not exist`);
                }
            }
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
                yield associateCoinToUser(userId, id, room, redis);
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
        const index = connectedClients.indexOf(socket.id);
        if (index !== -1) {
            connectedClients.splice(index, 1);
        }
    });
}));
// Function to initialize the server
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        httpServer.listen(port, () => {
            console.log(`Server running on port: ${port}`);
        });
    });
}
init();
