import express from 'express';
import {  socketToClientMap } from '../sockets/socketHandler'; // Aquí necesitas exportar socketToClientMap desde tu archivo socketHandler

const debugRouter = express.Router();

debugRouter.get('/socketmap', (req, res) => {
  res.json(socketToClientMap);
});

export default debugRouter;
