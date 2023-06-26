import express from 'express';
import { associateCoinToUser, generateAndStoreCoins, getCoin, isCoinAssociatedToUser, storeCoins } from './models/coins';
import {createServer} from 'http';
import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { Coin } from './types/coin';
import  { Room }   from './types/room';
import  coinControllersRouter  from './api/coins/coinControllers';
import usersRouter from './api/users/postController'
import coinAmountUsersRouter from './api/users/getControllers';
import config from './utils/readJSONConfig';
import { Client, User } from './types/users';
import { v4 as uuidv4 } from 'uuid';
import { removeClient } from './services/clientService';


const app = express();
const port = 3000;
const redis = new Redis();
const httpServer = createServer(app);
const io = new Server(httpServer);


app.use('/', usersRouter);
app.use('/users', coinAmountUsersRouter);
app.use('/rooms', coinControllersRouter);

let users: User[] = [];
let rooms: { [key: string]: User[] } = {};
let connectedClients : { [key: string]: Client } = {};
const roomCapacity: number = (config.room as Room).capacity;

io.on("connection", (socket: Socket) => {
  socket.on("join server", (username: string) => {
    const user: User = {
      username,
      id: socket.id,
    };
    users.push(user);

    let roomName: string;
    const lastRoom: string = Object.keys(rooms).slice(-1)[0];

    if (lastRoom && rooms[lastRoom].length < roomCapacity) {
      roomName = lastRoom;
    } else {
      roomName = `room-${uuidv4()}`;
      rooms[roomName] = [];
    }

    rooms[roomName].push(user);
    socket.join(roomName);

    if (rooms[roomName].length === roomCapacity) {
      const { coinsAmount, scale } = config.room;
      generateAndStoreCoins(roomName, coinsAmount, scale).then((coinIds) => {
        io.to(roomName).emit("coins available", coinIds);
      });
    }

    io.emit("new user", user.username);
  });


  // When a client grabs a coin, remove it from Redis and notify all clients in the room
  socket.on("grab coin", async (coinId, roomId) => {
    try {
      const userId = socket.id;
      // Verifica si la moneda ya está asociada a un usuario
      const isAssociated = await isCoinAssociatedToUser(userId, coinId, redis);
      if (!isAssociated) {
        // Asociar la moneda al usuario
        await associateCoinToUser(userId, coinId, roomId, redis);

        const coinsString = await redis.get(`coins:${roomId}`);
        const coins: Coin[] = coinsString ? JSON.parse(coinsString) : [];
        const remainingCoins = coins.filter((coin: Coin) => coin.id !== coinId);

        await storeCoins(roomId, remainingCoins);

        // Aquí necesitarías implementar una función para asociar una moneda a un usuario en tu base de datos.
        io.to(roomId).emit("coin grabbed", { coinId, userId });
      }
    } catch (error) {
      console.error("Error grabbing coin:", error);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`User ${socket.id} disconnected`);
    await removeClient(connectedClients[socket.id])
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