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
import usersRouter from './router/usersRouter';
import { socketHandler } from "./sockets/socketHandler";
import roomsRouter from "./router/roomsRouter";
const app = express();
const port = 3000;
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer);
app.use('/users', usersRouter);
// app.use('/', usersRouter);
app.use('/rooms', roomsRouter);
socketHandler(io);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        httpServer.listen(port, () => {
            console.log(`Server running on port: ${port}`);
        });
    });
}
init();
