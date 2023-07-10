import { io, Socket } from 'socket.io-client';
import { Coin } from './types/coin';
import { Room } from './types/room';
import { v4 as uuidv4 } from 'uuid';

const URL = 'http://localhost:3000';
let clientIds: string[] = [uuidv4(), uuidv4()];

const main = async () => {
  for (let i = 0; i < 2; i++) {
    let socket = io(URL);
    let clientId = clientIds[i];

    socket.on('connect', () => {
      console.log('Connected to the server.');

      socket.on('authenticated', (data) => {
        console.log('Authenticated: ', data);
        console.log('Emitted "authenticate" event with data:', authData);
        clientId = data.clientId;
        console.log('Emitted 2 "authenticate" event with data:', authData);

        socket.on('room created', (createdRoom: Room) => {
          console.log('Client:', clientId, 'received event "room created"');
          console.log('Create room', createdRoom);

          const joinData = { roomId: createdRoom.id, clientId: clientId };
          socket.emit('join room', joinData);
        });

        socket.on('joined room', (joinedRoom: Room) => {
          console.log('Client:', clientId, 'received "joined room" event');
          console.log('Connected to the room', JSON.stringify(joinedRoom, null, 2));


          socket.once('coins generated', (data: { coins: Coin[] }) => {
            console.log('Coins generated: ', data);
            const coins = data.coins;

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
        });

        if (i === 0) {
          const roomData = { name: 'testroom', password: 'testpassword' };
          socket.emit('create room', roomData);
        }
      });

      const authData = { clientId: clientId, username: 'testuser' };
      socket.emit('authenticate', authData);

      socket.on('client data', (clientData) => {
        console.log('Customer data received: ', clientData);
      });

      socket.on('room updated', (updatedRoom: Room) => {
        console.log('The room has been updated: ', updatedRoom);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server.');
      });

      socket.on('error', (error) => {
        console.error('Error: ', error);
      });
    });
  }
};

main();
