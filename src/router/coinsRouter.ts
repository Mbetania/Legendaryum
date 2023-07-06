import express from 'express';
import * as coinController from '../api/coins/controllers'

const coinRouter = express.Router();

coinRouter.get('/client/:clientId/coins', coinController.getCoinsOfUser);
coinRouter.get('/:coinId', coinController.getCoinById);
coinRouter.get('/room/:roomId/coins', coinController.getCoinsInRoom);

coinRouter.post('/room/:roomId/coins', coinController.generateCoins);

coinRouter.patch('/room/:roomId/client/:clientId', coinController.grabCoin);


coinRouter.delete('/room/:roomId/coin/:coinId', coinController.removeCoinFromRoom);



export default coinRouter;
