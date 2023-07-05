import express from 'express';
import * as roomController from '../api/rooms/controller';


const roomsRouter = express.Router();

roomsRouter.get('/:roomId', roomController.getRoomById);
roomsRouter.post('/', roomController.createRoom);
roomsRouter.patch('/join/:roomId', roomController.joinRoom);
roomsRouter.patch('/reset/:roomId', roomController.resetRoom)

export default roomsRouter;
