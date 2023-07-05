var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { io } from 'socket.io-client';
const URL = 'http://localhost:3000';
let sockets = [];
let clientIds = ['client1', 'client2'];
let room = null;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < 2; i++) {
        let socket = io(URL);
        sockets.push(socket);
        let clientId = clientIds[i];
        socket.on('connect', () => {
            console.log('Conectado al servidor.');
            socket.on('authenticated', (data) => {
                console.log('Autenticado: ', data);
                clientId = data.clientId;
                socket.on('room created', (createdRoom) => {
                    console.log('Cliente:', clientId, 'recibió evento "room created"');
                    console.log('Sala creada: ', createdRoom);
                    room = createdRoom;
                    const joinData = { roomId: room.id, clientId: clientId };
                    socket.emit('join room', joinData);
                });
                socket.on('joined room', (joinedRoom) => {
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
            socket.on('room updated', (updatedRoom) => {
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
});
function joinRoomAndGrabCoin(socket, joinedRoom, clientId) {
    let coins = [];
    socket.on('coins generated', (data) => {
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
