import { Request, Response } from "express";
import * as clientService from "../../services/clientService";
import { HTTP_STATUS } from "../../types/http";
import redisClient from "../../services/redis";
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from "../../services/authService";
import { ClientStatus } from "../../types/client";


//* GET
export const getClientById = async (req: Request, res: Response) => {
  const clientId = req.params.clientId;
  try {
    const client = await clientService.getClientById(clientId)
    res.json(client)
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).send('Client not found')
  }
};


//* POST
export const createClient = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const client = {
      id: id,
      status: ClientStatus.PENDING,
      token: generateToken(id),
      coins: [],
    };
    await redisClient.set(`client:${client.id}`, JSON.stringify(client));
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};


export const authenticateClientById = async (req: Request, res: Response) => {
  const clientId = req.body.clientId;
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