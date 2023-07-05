import { Request, Response } from "express";
import * as clientService from "../../services/clientService";
import { HTTP_STATUS } from "../../types/http";

//* GET
export const getClientById = async (req: Request, res: Response) => {
  const clientId = req.params.clientId;
  const client = await clientService.getClientById(clientId)
  if (client) {
    try {
      res.json(client)
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).send('Client not found')
    }
  }
};

//* POST
export const createClient = async (req: Request, res: Response) => {
  const client = req.body;
  await clientService.createClient(client);
  res.status(HTTP_STATUS.CREATED).send('Client created')
};

export const authenticateClientById = async (req: Request, res: Response) => {
  const clientId = req.params.clientId;
  const client = await clientService.authenticateClientById(clientId)
  res.json(client);
};

//* DELETE
export const removeClientById = async (req: Request, res: Response) => {
  const clientId = req.params.clientId;
  const client = await clientService.getClientById(clientId);
  if (client) {
    await clientService.removeClient(client);
    res.send('Client removed');
  } else {
    res.status(HTTP_STATUS.NOT_FOUND).send('Client not found')
  }
};