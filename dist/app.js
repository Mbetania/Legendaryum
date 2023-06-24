"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coins_1 = require("./models/coins");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const ioredis_1 = require("ioredis");
const roomConfig_json_1 = __importDefault(require("./roomConfig.json"));
const app = (0, express_1.default)();
const port = 3000;
const redis = new ioredis_1.Redis();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
const config = roomConfig_json_1.default;
for (const room in roomConfig_json_1.default) {
    const pickedRoom = config[room];
    const { coinsAmount, area } = pickedRoom;
    (0, coins_1.generateAndStoreCoins)(room, coinsAmount, area);
}
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
        const { id, room } = data;
        try {
            const coinsString = yield redis.get(`coins:${room}`);
            const coins = coinsString ? JSON.parse(coinsString) : [];
            const remainingCoins = coins.filter((coin) => coin.id !== id);
            yield (0, coins_1.storeCoins)(room, remainingCoins, redis);
            io.to(room).emit('coinUnavailable', id);
        }
        catch (error) {
            console.error('Error grabbing coin:', error);
        }
    }));
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });
}));
httpServer.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
