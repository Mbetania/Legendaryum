import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { createRoom, joinRoom, resetRoom } from '../services/roomService';
import { authenticateClientById, getClientById } from '../services/clientService';
import { collectCoin } from '../api/coins/coinService';

export let socketToClientMap:{[socketId: string]: string } = {};

export const socketHandler = (io: Server) => {
  const redis = new Redis();
  io.on('connection', (socket: Socket) => {
    console.log('A user connected with id', socket.id);

    socket.on('authenticate', async (data: {userId:string, username:string}) =>{
      const client = await authenticateClientById(data.userId, data.username);
      // Store the mapping between socket.id and client.id
      socketToClientMap[socket.id] = client.id;
      socket.emit('authenticated', { token: client.token});
    })

    socket.on('get client data', async(userId: string) =>{
      const clientData = await getClientById(userId)
      socket.emit('client data', clientData)
    })

    socket.on('create room', async (roomData) => {
      // Genera un ID único para la sala
      const roomId = uuidv4();
      const room = {
        id: roomId,
        ...roomData,
      };

      await createRoom(room);
      socket.emit('room created', {id: roomId});
    });

    // When a client joins a room
    socket.on('join room', async (data: {roomId: string, userId: string}) => {
      const client = await getClientById(data.userId);
      if(client){
        try {
          const room = await joinRoom(data.roomId, client.id);
          socket.to(data.roomId).emit('client joined', {clientId: client?.id})
          console.log(`User ${socket.id} joined room ${room}`);
          socket.emit('joined room', {roomId: room?.id});
        } catch (error) {
          // Enviar un mensaje de error al cliente
          console.error('Error in joinRoom:', error);
          socket.emit('error', {message: 'Unable to join room. Room is full.'});
        }
      }else{
        socket.emit('error', {message: 'Unable to join room. Client not found'})
      }
    });

    // When a client grabs a coin
    socket.on('grabCoin', async ({ id: coinId, room }) => {
      console.log(`User ${socket.id} grabbed coin ${coinId} in room ${room}`);
      // Associate the coin with the user
      await collectCoin(socket.id, coinId, room, redis);

      // Emit coinUnavailable event to all other clients in the room
      socket.to(room).emit('coinUnavailable', coinId);
    });

    // When a client disconnects
    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
      delete socketToClientMap[socket.id]
    });
  });
}
