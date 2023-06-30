import express from "express";
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';
import usersRouter from './router/usersRouter'
import { socketHandler } from "./sockets/socketHandler";
import roomsRouter from "./router/roomsRouter";

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

app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);

socketHandler(io)

async function init() {
  httpServer.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}

init();
