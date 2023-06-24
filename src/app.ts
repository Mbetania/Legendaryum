import express from 'express';
import { generateAndStoreCoins, storeCoins } from './models/coins';
import {createServer} from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { Coin } from './types/coin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GlobalConfig, RoomConfig } from './types/room';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const redis = new Redis();
const httpServer = createServer(app);
const io = new Server(httpServer);
const rawData = readFileSync(join(__dirname, 'roomConfig.json'), 'utf-8');
const config: GlobalConfig = JSON.parse(rawData);

for (const room in config) { // Changed from configRooms to config
  const pickedRoom: RoomConfig = config[room];
  const { coinsAmount, area} = pickedRoom;
  generateAndStoreCoins(room, coinsAmount, area);
}


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
    const { id, room } = data;
    try {
      const coinsString = await redis.get(`coins:${room}`);
      const coins: Coin[] = coinsString ? JSON.parse(coinsString) : [];
      const remainingCoins = coins.filter((coin: Coin) => coin.id !== id);
      await storeCoins(room, remainingCoins, redis);
      io.to(room).emit('coinUnavailable', id);
    } catch (error) {
      console.error('Error grabbing coin:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

httpServer.listen(port, () =>{
  console.log(`Server running on port: ${port}`)
});
