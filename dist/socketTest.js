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
let socket;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    socket = io(URL);
    socket.on('connect', () => {
        console.log('Conectado al servidor.');
        const authData = { clientId: '116eedce-f8e7-4847-ab34-30132dd7a9ef', username: 'testuser' };
        socket.emit('authenticate', authData);
        socket.on('authenticated', (data) => {
            console.log('Autenticado: ', data);
            const clientId = '116eedce-f8e7-4847-ab34-30132dd7a9ef';
            socket.emit('get client data', clientId);
            socket.on('client data', (clientData) => {
                console.log('Datos del cliente recibidos: ', clientData);
                const roomData = { name: 'testroom', password: 'testpassword' };
                socket.emit('create room', roomData);
                socket.on('room created', (room) => {
                    console.log('Sala creada: ', room);
                    const joinData = { roomId: room.id, clientId: '116eedce-f8e7-4847-ab34-30132dd7a9ef' };
                    socket.emit('join room', joinData);
                    socket.on('joined room', (joinedRoom) => {
                        console.log('Unido a la sala: ', joinedRoom);
                        const grabCoinData = {
                            coinId: 'cf9ee99b-5c1a-47b8-9ae2-cca365cf3cfe',
                            roomId: room.id,
                            clientId: '116eedce-f8e7-4847-ab34-30132dd7a9ef',
                            position: { x: 10, y: 20 },
                        };
                        socket.emit('grabCoin', grabCoinData);
                    });
                });
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
main();
