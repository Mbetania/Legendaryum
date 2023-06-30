import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { createRoom, generateCoinForRoom, getRoomById, joinRoom, resetRoom } from '../services/roomService';
import { authenticateClientById, getClientById } from '../services/clientService';
import redisClient from '../services/redis';

export let socketToClientMap:{[socketId: string]: string } = {};

export const socketHandler = (io: Server) => {
  const redis = new Redis();
  io.on('connection', (socket: Socket) => {
    console.log('A user connected with id', socket.id);

    socket.on('authenticate', async (data: {clientId:string, username:string}) =>{
      const client = await authenticateClientById(data.clientId, data.username);
      // Store the mapping between socket.id and client.id
      socketToClientMap[socket.id] = client.id;
      socket.emit('authenticated', { token: client.token});
    })

    socket.on('get client data', async(clientId: string) =>{
      const clientData = await getClientById(clientId)
      socket.emit('client data', clientData)
    })

    socket.on('create room', async (roomData) => {
      const room = {
        ...roomData,
      };

      const createdRoom = await createRoom(room);
      socket.emit('room created', {id: createdRoom.id});
    });

    // When a client joins a room
  socket.on('join room', async (data: {roomId: string, clientId: string}) => {
    const client = await getClientById(data.clientId);
    if(client){
      try {
        const room = await joinRoom(data.roomId, client.id);
        socket.to(data.roomId).emit('client joined', {clientId: client?.id});
        console.log(`User ${socket.id} joined room ${room?.id}`);
        socket.emit('joined room', {roomId: room?.id});

        // Check if the room is active and coins were generated
        if (room && room.isActive && room.coins) {
          // Emit the generated coins to the room
          io.to(data.roomId).emit('coins generated', { coins: room.coins });
        }
      } catch (error) {
        // Send an error message to the client
        console.error('Error in joinRoom:', error);
        socket.emit('error', {message: 'Unable to join room. Room is full.'});
      }
    } else {
      socket.emit('error', {message: 'Unable to join room. Client not found'})
    }
  });

    // When a client grabs a coin
    socket.on('grabCoin', async ({ coinId, roomId, clientId }) => {
      console.log(`User ${clientId} grabbed coin ${coinId} in room ${roomId}`);

      const client = await getClientById(clientId);
      const room = await getRoomById(roomId);

      if (client && room) {
        // Associate the coin with the user
        client.coins?.push(coinId); // Añade la moneda al cliente
        await redisClient.set(`client:${clientId}`, JSON.stringify(client)); // Almacena el cliente en Redis

        // Remove the coin from the room
        room.coins = room.coins?.filter(id => id !== coinId);
        await redisClient.set(`room:${roomId}`, JSON.stringify(room)); // Actualiza la sala en Redis

        // Emit coinUnavailable event to all other clients in the room
        socket.to(roomId).emit('coinUnavailable', coinId);
      } else {
        socket.emit('error', { message: 'Unable to grab coin. Client or room not found' });
      }
    })

      // When a client disconnects
      socket.on('disconnect', () => {
        console.log('A user disconnected', socket.id);
        delete socketToClientMap[socket.id]
      });
    });
}
