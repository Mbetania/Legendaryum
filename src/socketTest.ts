import { io, Socket } from 'socket.io-client';
import { Coin } from './types/coin';
import { Room } from './types/room';
import { v4 as uuidv4 } from 'uuid';

const URL = 'http://localhost:3000';
let sockets: Socket[] = [];
let clientIds: string[] = [uuidv4(), uuidv4()];
let room: Room | null = null;

const main = async () => {
  for (let i = 0; i < 2; i++) {
    let socket = io(URL);
    sockets.push(socket);
    let clientId = clientIds[i];

    socket.on('connect', () => {
      console.log('Conectado al servidor.');

      socket.on('authenticated', (data) => {
        console.log('Autenticado: ', data);
        clientId = data.clientId;

        socket.on('room created', (createdRoom: Room) => {
          console.log('Cliente:', clientId, 'recibió evento "room created"');
          console.log('Sala creada: ', createdRoom);
          room = createdRoom;

          const joinData = { roomId: room.id, clientId: clientId };
          socket.emit('join room', joinData);
        });

        socket.on('joined room', (joinedRoom: Room) => {
          console.log('Cliente:', clientId, 'recibió evento "joined room"');
          console.log('Unido a la sala: ', JSON.stringify(joinedRoom, null, 2));
          joinRoomAndGrabCoin(socket, joinedRoom, clientId);
        });

        if (i === 0) {
          const roomData = { name: 'testroom', password: 'testpassword' };
          socket.emit('create room', roomData);
        }
      });

      const authData = { clientId: clientId, username: 'testuser' };
      socket.emit('authenticate', { clientId: clientId });

      socket.on('client data', (clientData) => {
        console.log('Datos del cliente recibidos: ', clientData);
      });

      socket.on('room updated', (updatedRoom: Room) => {
        console.log('La sala ha sido actualizada: ', updatedRoom);
        room = updatedRoom;
      });

      socket.on('disconnect', () => {
        console.log('Desconectado del servidor.');
      });

      socket.on('error', (error) => {
        console.error('Error: ', error);
      });
    });

  }
};

function joinRoomAndGrabCoin(socket: Socket, joinedRoom: Room, clientId: string) {
  let coins: Coin[] = [];

  socket.on('coins generated', (data: { coins: Coin[] }) => {
    console.log('Monedas generadas: ', data);
    coins = data.coins;

    if (coins.length > 0) {
      const coinToGrab = coins[0];
      const grabCoinData = {
        coinId: coinToGrab.id,
        roomId: joinedRoom.id,
        clientId: clientId,
      };
      socket.emit('grab coin', grabCoinData);
    }
  });
}

main();
