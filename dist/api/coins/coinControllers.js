import express from 'express';
import { readCoins } from './readCoins';
const coinControllersRouter = express.Router();
coinControllersRouter.get('/:room', readCoins);
export default coinControllersRouter;
