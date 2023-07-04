import express, { Router } from 'express';
import * as clientController from '../api/clients/controller';

const clientRouter = express.Router();

clientRouter.get('/:clientId', clientController.getClientById);

export default clientRouter;