import { Server, Socket } from 'socket.io';
import { createRoom, getRoomById, joinRoom } from '../services/roomService';
import { authenticateClientById, getClientById } from '../services/clientService';
import { grabCoin, isCoinAssociatedToUser } from '../services/coinService';
import { v4 as uuidv4 } from 'uuid';

export let socketToClientMap: { [socketId: string]: string } = {};

export const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected with id', socket.id);

    socket.on('authenticate', async (data: { clientId: string }) => {
      const clientId = data.clientId || uuidv4();
      const client = await authenticateClientById(clientId);
      socketToClientMap[socket.id] = client.id;
      socket.emit('authenticated', { token: client.token, clientId: client.id });
    });

    socket.on('get client data', async (clientId: string) => {
      const clientData = await getClientById(clientId);
      socket.emit('client data', clientData);
    });

    socket.on('create room', async (roomData) => {
      const room = {
        ...roomData,
      };

      const createdRoom = await createRoom(room);
      io.emit('room created', createdRoom); // Cambiado a enviar toda la sala creada
    });

    socket.on('join room', async (data: { roomId: string, clientId: string }) => {
      const client = await getClientById(data.clientId);
      if (client) {
        try {
          const room = await joinRoom(data.roomId, client.id);
          io.to(data.roomId).emit('client joined', { clientId: client?.id });
          console.log(`User ${socket.id} joined room ${room?.id}`);
          socket.emit('joined room', room); // Cambiado a enviar toda la sala unida

          if (room && room.isActive && room.coins) {
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
      console.log(`User ${clientId} grabbed coin ${coinId} in room ${roomId}`);
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

        // Comprobación adicional: si no quedan monedas, termina el juego.
        if (updatedRoom && (!updatedRoom.coins || updatedRoom.coins.length === 0)) {
          io.to(roomId).emit('end game');
        }
      } catch (error) {
        console.error('Error in grab coin: ', error);
        socket.emit('error', { message: 'Unable to grab coin' });
      }
    });
  });
}
