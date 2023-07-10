import express from 'express';
import * as roomController from '../api/rooms/controller';
const roomsRouter = express.Router();
roomsRouter.get('/:roomId', roomController.getRoomById);
roomsRouter.post('/', roomController.createRoom);
roomsRouter.patch('/:roomId/join', roomController.joinRoom);
roomsRouter.patch('/:roomId/reset', roomController.resetRoom);
export default roomsRouter;
