import express from 'express';
import * as coinController from '../api/coins/controllers'

const coinRouter = express.Router();

coinRouter.get('/coins', coinController.getCoinsOfUserController);

export default coinRouter;
