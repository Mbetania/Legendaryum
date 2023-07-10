import { Server, Socket } from 'socket.io';
import { createRoom, getRoomById, joinRoom } from '../services/roomService';
import { authenticateClientById, getClientById } from '../services/clientService';
import { generateCoins, grabCoin, isCoinAssociatedToUser } from '../services/coinService';
import { v4 as uuidv4 } from 'uuid';
import { Room } from '../types/room';

export let clientList: { [socketId: string]: { clientId: string, roomId?: string } } = {};

export const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected with id', socket.id);

    socket.on('authenticate', async (data: { clientId: string }) => {
      let clientId = data.clientId || uuidv4();
      const client = await authenticateClientById(clientId);
      clientList[socket.id] = { clientId: client.id };
      socket.emit('authenticated', { token: client.token, clientId: client.id });
    });

    socket.on('get client data', async (clientId: string) => {
      const clientData = await getClientById(clientId);
      socket.emit('client data', clientData);
    });

    socket.on('create room', async (roomData) => {

      const createdRoom = await createRoom(roomData);

      const clientInfo = clientList[socket.id];

      if (clientInfo && clientInfo.clientId) {
        try {
          const joinedRoom = await joinRoom(createdRoom.id, clientInfo.clientId);
          if (joinedRoom && joinedRoom.id) {
            clientInfo.roomId = joinedRoom.id;
          } else {
            throw new Error('Error: the joined room is undefined or null');
          }

          socket.emit('joined room', joinedRoom);


          io.emit('room created', createdRoom);

        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Error joining room:' });
        }
      }
    });


    socket.on('join room', async (data: { roomId: string, clientId: string }) => {
      const client = await getClientById(data.clientId);
      if (client) {
        try {
          const room: Room | null = await getRoomById(data.roomId);
          if (room) {
            if (room.clients?.includes(client.id)) {
              console.log(`User ${client.id} is already in the room ${room.id}`);
              return;
            }
            const joinedRoom = await joinRoom(room.id, client.id);
            if (joinedRoom && joinedRoom.id) {
              clientList[socket.id].roomId = joinedRoom.id;
            }
          }

          io.to(data.roomId).emit('client joined', { clientId: client?.id });
          console.log(`User ${socket.id} joined room ${room?.id}`);
          socket.emit('joined room', room);

          if (room && !room.isActive && !room.coins) {
            room.isActive = true;
            room.coins = await generateCoins(room);

            io.to(data.roomId).emit('coins generated', { coins: room.coins });
          }
        } catch (error) {
          console.error('Error in joinRoom:', error);
          socket.emit('error', { message: 'Unable to join room. Room is full.' });
        }
      } else {
        socket.emit('error', { message: 'Unable to join room. Client not found' });
      }
    });

    socket.on('grab coin', async ({ roomId, clientId, coinId }) => {
      try {
        const coinGrabbed = await isCoinAssociatedToUser(clientId, coinId);
        if (coinGrabbed) {
          socket.emit('error', { message: 'Coin has already been grabbed' });
          return;
        }

        await grabCoin(roomId, clientId, coinId);
        io.to(roomId).emit('coinUnaVailable', coinId);
        io.to(roomId).emit('coin grabbed', { coinId: coinId, clientId: clientId });

        const updatedRoom = await getRoomById(roomId);
        io.to(roomId).emit('room updated', updatedRoom);

        if (updatedRoom && (!updatedRoom.coins || updatedRoom.coins.length === 0)) {
          io.to(roomId).emit('end game');
        }
      } catch (error) {
        console.error('Error in grab coin: ', error);
        socket.emit('error', { message: 'Unable to grab coin' });
      }

    });
    socket.on('disconnect', () => {
      console.log('A user has disconnected:', socket.id);
      delete clientList[socket.id];
    });
  });
}
