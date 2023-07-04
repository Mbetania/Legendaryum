import express, { Router } from 'express';
import * as clientController from '../api/clients/controller';

const clientRouter = express.Router();

clientRouter.get('/:clientId', clientController.getClientById);
clientRouter.post('/', clientController.createClient)

export default clientRouter;