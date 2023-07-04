import redisClient from "./redis";
import { generateToken } from "./authService";
import { v4 as uuidv4 } from 'uuid';
import { Coin } from "../types/coin";
import { Client, ClientStatus } from "../types/client";


export const createClient = async (client: Client): Promise<void> => {
  const clientData = JSON.stringify(client);
  await redisClient.set(`client:${client.id}`, clientData);
};

export const removeClient = async (client: Client): Promise<void> => {
  await redisClient.del(`client:${client.id}`);
};

export const getClientById = async (clientId: string): Promise<Client | null> => {
  const clientData = await redisClient.get(`client:${clientId}`);
  if (clientData) {
    let client;
    try {
      client = JSON.parse(clientData);
    } catch (error) {
      console.error('Error parsing client data: ', error)
    }
    if (!client.coins) {
      client.coins = []
    }
    return client;
  }
  return null;
}

export const authenticateClientById = async (clientId: string): Promise<Client> => {
  const id = clientId || uuidv4();
  let user = await getClientById(id);

  if (!user) {
    const newClient: Client = {
      id: id,
      status: ClientStatus.PENDING,
      token: generateToken(id),
      coins: [],
    };
    await createClient(newClient);
    user = newClient
  }

  return user;
}
