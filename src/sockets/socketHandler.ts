import { Server, Socket } from 'socket.io';
import { generateAndStoreCoins, getCoinsInRoom, associateCoinToUser } from '../models/coins';
import { Redis } from 'ioredis';
import { RoomConfig } from '../types/room';
import config from '../utils/readJSONConfig';


export const socketHandler = (io: Server) => {
  const redis = new Redis();
  io.on('connection', (socket: Socket) => {
    console.log('A user connected with id', socket.id);

    // When a client joins a room
    socket.on('join', async (room: string) => {
      console.log(`User ${socket.id} joined room ${room}`);
      socket.join(room);

      const roomConfig: RoomConfig = config[room];
      if (!roomConfig) {
        console.error(`No configuration found for room ${room}`);
        return
      }

      // Retrieve the coins for this room and emit them to the client
      const coins = await getCoinsInRoom(room);
      socket.emit('coins', coins);
    });

    // When a client grabs a coin
    socket.on('grabCoin', async ({ id: coinId, room }) => {
      console.log(`User ${socket.id} grabbed coin ${coinId} in room ${room}`);
      // Associate the coin with the user
      await associateCoinToUser(socket.id, coinId, room, redis);

      // Emit coinUnavailable event to all other clients in the room
      socket.to(room).emit('coinUnavailable', coinId);
    });

    // When a client disconnects
    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
    });
  });
}
