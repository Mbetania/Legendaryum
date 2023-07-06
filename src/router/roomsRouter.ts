import express from 'express';
import * as roomController from '../api/rooms/controller';


const roomsRouter = express.Router();
//* trae roomData(client,scala,capacidad, coins(position), isAct, name y psw)
roomsRouter.get('/:roomId', roomController.getRoomById);
//! error createRoom
//* crea con dtos por default
roomsRouter.post('/', roomController.createRoom);
//! error joinRoom
roomsRouter.patch('/:roomId/join', roomController.joinRoom);
//* dudo de su funcionalidad
roomsRouter.patch('/:roomId/reset', roomController.resetRoom);


export default roomsRouter;
