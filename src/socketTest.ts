import { io, Socket } from 'socket.io-client';
import { Coin } from './types/coin';

const URL = 'http://localhost:3000';
let sockets: Socket[] = [];
let clientIds: string[] = ['client1', 'client2'];  // Creas dos clientIds únicos

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

          socket.on('room created', (room) => {
            console.log('Sala creada: ', room);

            const joinData = { roomId: room.id, clientId: clientId };
            socket.emit('join room', joinData);

            joinRoomAndGrabCoin(socket, room, clientId);
          });
        });
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

function joinRoomAndGrabCoin(socket: Socket, room: any, clientId: string) {
  let coins: Coin[] = [];

  socket.on('joined room', (joinedRoom) => {
    console.log('Unido a la sala: ', joinedRoom);
  });
  console.log()
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
    coins = coins.filter(coin => coin.id !== coinId);
  });

  socket.on('coin grabbed', (data) => {
    console.log(`Moneda agarrada: ${data.coinId} por el cliente: ${data.clientId}`);

    if (data.clientId === clientId) {
      console.log('El cliente ha agarrado una moneda. Desconectando...');
      socket.disconnect();
    }
  });
  socket.on('end game', () => {
    console.log('Juego terminado. Desconectando...');
    socket.disconnect();
  });

}

main();
