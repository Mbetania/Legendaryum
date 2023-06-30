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
const createClient = (username) => __awaiter(void 0, void 0, void 0, function* () {
    let socket = io(URL);
    let clientId;
    socket.on('connect', () => {
        console.log('Conectado al servidor.');
        const authData = { clientId: '', username: username };
        socket.emit('authenticate', authData);
        socket.on('authenticated', (data) => {
            console.log('Autenticado: ', data);
            clientId = data.clientId;
            socket.emit('get client data', clientId);
            socket.on('client data', (clientData) => {
                console.log('Datos del cliente recibidos: ', clientData);
                const roomData = { name: 'testroom', password: 'testpassword' };
                socket.emit('create room', roomData);
                socket.on('room created', (room) => {
                    console.log('Sala creada: ', room);
                    const joinData = { roomId: room.id, clientId: clientId };
                    socket.emit('join room', joinData);
                    let coins = [];
                    socket.on('joined room', (joinedRoom) => {
                        console.log('Unido a la sala: ', joinedRoom);
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
                                socket.on('coin grabbed', (data) => {
                                    console.log(`Moneda agarrada: ${data.coinId} por el cliente: ${data.clientId}`);
                                });
                            }
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
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    createClient('testuser1');
    createClient('testuser2');
});
main();
