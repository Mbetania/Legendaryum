import express from 'express';
import { associateCoinToUser, generateAndStoreCoins, getCoin, isCoinAssociatedToUser, storeCoins } from './models/coins';
import {createServer} from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { Coin } from './types/coin';
import { GlobalConfig, RoomConfig } from './types/room';
import  coinControllersRouter  from './api/coins/coinControllers';
import usersRouter from './api/users/postController'
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

const connectedClients: { [socketId: string]: string } = {};
let roomIndex = 0;
io.on('connection', async(socket) => {
  console.log(`A user Connected with id ${socket.id}`);
  connectedClients[socket.id] = "";

  const clientsKeys = Object.keys(connectedClients);

  if (clientsKeys.length === 4) {
    if (roomIndex >= Object.keys(config).length) {
      console.log('No more room configuration available');
      return;
    }
    const room = Object.keys(config)[roomIndex];
    const { coinsAmount, area } = config[room];
    await generateAndStoreCoins(room, coinsAmount, area);
    for (let i = 0; i < 4; i++) {
      connectedClients[clientsKeys[i]] = room;
      io.to(clientsKeys[i]).emit('roomAvailable', { room, coins: coinsAmount });
    }
    clientsKeys.splice(0, 4);
    roomIndex++;
  }

  socket.on('join', async(room) => {
    if (connectedClients[socket.id] !== room) {
      console.error(`Client ${socket.id} tried to join room ${room} but was assigned to room ${connectedClients[socket.id]}`);
      return;
    }
    try {
      const coinIds = await redis.smembers(`coins:${room}`);
      const coins: Coin[] = [];
      for (let coinId of coinIds) {
        const coin = await getCoin(coinId, redis);
        if (coin) {
          coins.push(coin);
        } else {
          console.warn(`Coin with id ${coinId} does not exist`);
        }
      }
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
        await associateCoinToUser(userId, id, room, redis);
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
    delete connectedClients[socket.id];
  });
});

// Function to initialize the server
async function init() {
  httpServer.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}

init();