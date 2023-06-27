var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import coinControllersRouter from './api/coins/coinControllers';
import usersRouter from './router/usersRouter';
import { authenticateClientById, getClientById } from './services/clientService';
const app = express();
const port = 3000;
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer);
app.use('/users', usersRouter);
// app.use('/', usersRouter);
app.use('/rooms', coinControllersRouter);
io.on("connection", (socket) => {
    socket.on("authenticate", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const client = yield authenticateClientById(data.userId, data.username);
        // Emitir el token al cliente
        socket.emit("authenticated", { token: client.token });
    }));
    socket.on('get client data', (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const clientData = yield getClientById(userId);
        socket.emit('client data', clientData);
    }));
    socket.on("join room", (roomId) => {
        // Implementa la lógica de unión a la sala
    });
    socket.on("grab coin", (coinId, roomId) => __awaiter(void 0, void 0, void 0, function* () {
        // Implementa la lógica de agarrar la moneda
    }));
    socket.on("check status", () => {
        // Implementa la lógica de consulta de estado
    });
    socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`User ${socket.id} disconnected`);
        // ...
    }));
});
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        httpServer.listen(port, () => {
            console.log(`Server running on port: ${port}`);
        });
    });
}
init();
