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
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';
import clientRouter from './router/clientRouter';
import { socketHandler } from "./sockets/socketHandler";
import roomsRouter from "./router/roomsRouter";
import coinRouter from "./router/coinsRouter";
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use('/api', clientRouter);
app.use('/api', roomsRouter);
app.use('/api', coinRouter);
socketHandler(io);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        httpServer.listen(port, () => {
            console.log(`Server running on port: ${port}`);
        });
    });
}
init();
