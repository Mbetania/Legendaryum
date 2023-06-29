import express from "express";
import cors from "cors";
import {createServer} from 'http';
import { Server } from 'socket.io';
import  coinControllersRouter  from './api/coins/controllers/coinControllers';
import usersRouter from './router/usersRouter'
import { socketHandler } from "./sockets/socketHandler";
import roomsRouter from "./router/roomsRouter";
import debugRouter from "./router/debugRouter";

const app = express();
const port = 3000;

app.use(cors()); // habilita CORS para todas las rutas
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",  // permite todos los origenes
    methods: ["GET", "POST"] // permite métodos GET y POST
  }
});

app.use('/users', usersRouter);
// app.use('/', usersRouter);
app.use('/rooms', roomsRouter);
app.use('/debug', debugRouter);

socketHandler(io)

async function init() {
  httpServer.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}

init();
