import { io, Socket } from 'socket.io-client';
import { Coin } from './types/coin';
import { Room } from './types/room';

const URL = 'http://localhost:3000';
let sockets: Socket[] = [];
let clientIds: string[] = ['client1', 'client2'];  // Creas dos clientIds únicos

let clientRooms: { [clientId: string]: Room } = {}; // Almacena la sala actual de cada cliente

const main = async () => {
  for (let i = 0; i < 2; i++) {
    let socket = io(URL);
    sockets.push(socket);
    let clientId = clientIds[i];

    socket.on('connect', () => {
      console.log('Conectado al servidor.');

      const authData = { clientId: clientId, username: 'testuser' };
      socket.emit('authenticate', authData);

      socket.on('authenticated', (data) => {
        console.log('Autenticado: ', data);
        clientId = data.clientId;

        socket.emit('get client data', clientId);

        socket.on('client data', (clientData) => {
          console.log('Datos del cliente recibidos: ', clientData);

          // Sólo el primer cliente crea la sala.
          if (i === 0) {
            const roomData = { name: 'testroom', password: 'testpassword' };
            socket.emit('create room', roomData);
          }

          socket.on('room created', (room: Room) => {
            console.log('Sala creada: ', room);
            clientRooms[clientId] = room;  // Actualiza la sala en el estado del cliente

            const joinData = { roomId: room.id, clientId: clientId };
            socket.emit('join room', joinData);
          });

          socket.on('joined room', (joinedRoom: Room) => {
            console.log('Unido a la sala: ', joinedRoom);
            clientRooms[clientId] = joinedRoom; // Actualiza la sala en el estado del cliente

            joinRoomAndGrabCoin(socket, joinedRoom, clientId);
          });
        });
      });

      socket.on('room updated', (updatedRoom: Room) => {
        console.log('La sala ha sido actualizada: ', updatedRoom);

        // Actualiza la sala en el estado del cliente
        clientRooms[clientId] = updatedRoom;
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

function joinRoomAndGrabCoin(socket: Socket, room: Room, clientId: string) {
  let coins: Coin[] = [];

  socket.on('joined room', (joinedRoom) => {
    console.log('Unido a la sala: ', joinedRoom);
  });

  socket.on('coins generated', (data: { coins: Coin[] }) => {
    console.log('Monedas generadas: ', data);
    coins = data.coins;

    if (coins.length > 0) {
      const coinToGrab = coins[0];
      const grabCoinData = {
        coinId: coinToGrab.id,
        roomId: room.id,
        clientId: clientId,
      };
      socket.emit('grab coin', grabCoinData);
    }
  });

  socket.on('coinUnaVailable', (coinId) => {
    console.log(`Moneda recogida por otro cliente: ${coinId}`);
    coins = coins.filter(coin => coin.id !== coinId); // Actualiza la lista de monedas
  });
}

main();
