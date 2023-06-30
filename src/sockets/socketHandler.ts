import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { createRoom, getRoomById, joinRoom } from '../services/roomService';
import { authenticateClientById, getClientById } from '../services/clientService';
import redisClient from '../services/redis';
import { grabCoin } from '../services/coinService';
import { v4 as uuidv4 } from 'uuid';


export let socketToClientMap: { [socketId: string]: string } = {};

export const socketHandler = (io: Server) => {
  const redis = new Redis();
  io.on('connection', (socket: Socket) => {
    console.log('A user connected with id', socket.id);

    socket.on('authenticate', async (data: { clientId: string }) => {
      // Si no se proporciona un clientId, se genera uno nuevo
      const clientId = data.clientId || uuidv4();
      const client = await authenticateClientById(clientId);
      // Store the mapping between socket.id and client.id
      socketToClientMap[socket.id] = client.id;
      socket.emit('authenticated', { token: client.token, clientId: client.id });
    })


    socket.on('get client data', async (clientId: string) => {
      const clientData = await getClientById(clientId)
      socket.emit('client data', clientData)
    })

    socket.on('create room', async (roomData) => {
      const room = {
        ...roomData,
      };

      const createdRoom = await createRoom(room);
      socket.emit('room created', { id: createdRoom.id });
    });

    // When a client joins a room
    socket.on('join room', async (data: { roomId: string, clientId: string }) => {
      const client = await getClientById(data.clientId);
      if (client) {
        try {
          const room = await joinRoom(data.roomId, client.id);
          socket.to(data.roomId).emit('client joined', { clientId: client?.id });
          console.log(`User ${socket.id} joined room ${room?.id}`);
          socket.emit('joined room', { roomId: room?.id });

          // Check if the room is active and coins were generated
          if (room && room.isActive && room.coins) {
            // Emit the generated coins to the room
            io.to(data.roomId).emit('coins generated', { coins: room.coins });
          }
        } catch (error) {
          // Send an error message to the client
          console.error('Error in joinRoom:', error);
          socket.emit('error', { message: 'Unable to join room. Room is full.' });
        }
      } else {
        socket.emit('error', { message: 'Unable to join room. Client not found' })
      }
    });

    // When a client grabs a coin
    socket.on('grab coin', async ({ roomId, clientId, coinId }) => {
      console.log(`User ${clientId} grabbed coin ${coinId} in room ${roomId}`);
      try {
        await grabCoin(roomId, clientId, coinId);
        socket.to(roomId).emit('coinUnaVailable', coinId);
      } catch (error) {
        console.error('Error in grab coin: ', error)
        socket.emit('error', { message: 'Unable to grab coin' })
      }

    })

    // When a client disconnects
    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
      delete socketToClientMap[socket.id]
    });
  });
}
