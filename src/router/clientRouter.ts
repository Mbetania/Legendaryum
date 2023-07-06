import express, { Router } from 'express';
import * as clientController from '../api/clients/controller';

const clientRouter = express.Router();

clientRouter.get('/:clientId', clientController.getClientById);
//! error createClient
clientRouter.post('/', clientController.createClient);
clientRouter.post('/authenticate/:clientId', clientController.authenticateClientById);


clientRouter.delete('/:clientId', clientController.removeClientById)


export default clientRouter;