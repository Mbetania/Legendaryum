import express from 'express';
import coinControllersRouter from '../api/coins/controllers/coinControllers';

const coinRouter = express.Router();

coinRouter.use('/coins', coinControllersRouter);

export default coinRouter;
