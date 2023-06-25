import express from 'express';
import { associateCoinToUser, generateAndStoreCoins, isCoinAssociatedToUser, storeCoins } from './models/coins';
import {createServer} from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { Coin } from './types/coin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GlobalConfig, RoomConfig } from './types/room';
import coinsInRoomRouter from './api/coins/readCoins'
import usersRouter from './api/users/postController'
import coinAmountUsersRouter from './api/users/getControllers';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const redis = new Redis();
const httpServer = createServer(app);
const io = new Server(httpServer);
const rawData = readFileSync(join(__dirname, '../src/roomConfig.json'), 'utf-8');

const config: GlobalConfig = JSON.parse(rawData);

app.use('/', usersRouter);
app.use('/users', coinAmountUsersRouter)
app.use('/rooms', coinsInRoomRouter)
io.on('connection', async(socket) => {
  console.log(`A user Connected with id ${socket.id}`);

  // When a client joins a room, send them all the available coins in that room
  socket.on('join', async(room) => {
    try {
      const coinsString = await redis.get(`coins:${room}`);
      const coins: Coin[] = coinsString ? JSON.parse(coinsString) : [];
      socket.emit('coins', coins);
    } catch (error) {
      console.error('Error fetching coins:', error);
    }
  });

  // When a client grabs a coin, remove it from Redis and notify all clients in the room
  socket.on('grabCoin', async(data) => {
    const { id, room, userId } = data;
    try {
      // Verifica si la moneda ya está asociada a un usuario
      const isAssociated = await isCoinAssociatedToUser(userId, id, redis);
      if (!isAssociated) {
        // Asociar la moneda al usuario
        await associateCoinToUser(userId, id, redis);
        const coinsString = await redis.get(`coins:${room}`);
        const coins: Coin[] = coinsString ? JSON.parse(coinsString) : [];
        const remainingCoins = coins.filter((coin: Coin) => coin.id !== id);
        await storeCoins(room, remainingCoins);
        io.to(room).emit('coinUnavailable', id);
      }
    } catch (error) {
      console.error('Error grabbing coin:', error);
    }
  });
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// Function to initialize the server
async function init() {
  for (const room in config) {
    const pickedRoom: RoomConfig = config[room];
    const { coinsAmount, area} = pickedRoom;
    await generateAndStoreCoins(room, coinsAmount, area);
  }

  httpServer.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}

init();
