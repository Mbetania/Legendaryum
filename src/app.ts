import express from "express";
import {createServer} from 'http';
import { Server, Socket } from 'socket.io';
import  coinControllersRouter  from './api/coins/coinControllers';
import usersRouter from './router/usersRouter'
import coinAmountUsersRouter from './api/users/getControllers';
import { authenticateClientById, getClientById } from './services/clientService';



const app = express();
const port = 3000;

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer);

app.use('/users', usersRouter);
// app.use('/', usersRouter);
app.use('/rooms', coinControllersRouter);

io.on("connection", (socket: Socket) => {
  socket.on("authenticate", async (data: {userId: string, username: string}) => {
    const client = await authenticateClientById(data.userId, data.username);

    // Emitir el token al cliente
    socket.emit("authenticated", { token: client.token });
  });

  socket.on('get client data', async (userId: string) =>{
    const clientData = await getClientById(userId);
    socket.emit('client data', clientData)
  })
  socket.on("join room", (roomId: string) => {
    // Implementa la lógica de unión a la sala
  });

  socket.on("grab coin", async (coinId, roomId) => {
    // Implementa la lógica de agarrar la moneda
  });

  socket.on("check status", () => {
    // Implementa la lógica de consulta de estado
  });

  socket.on('disconnect', async () => {
    console.log(`User ${socket.id} disconnected`);
    // ...
  });
});

async function init() {
  httpServer.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}

init();
