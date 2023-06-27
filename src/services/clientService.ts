import redisClient from "../models/redis";
import { Client, ClientStatus } from "../types/users";
import { generateToken } from "./authService";

export const createClient = async (client: Client): Promise<void> => {
  await redisClient.set(`user:${client.username}`, JSON.stringify(client));
};

export const removeClient = async (client: Client): Promise<void> => {
  await redisClient.del(`user:${client.username}`);
};

export const getClientById = async(userId: string): Promise<Client | null> => {
  const clientData = await redisClient.get(`user:${userId}`);
  return clientData ? JSON.parse(clientData) : null;
}

export const authenticateClientById = async(username: string, userId: string): Promise<Client> =>{
  let user = await getClientById(userId)

  if(!user){
    const newClient: Client = {
      id: userId,
      username: username,
      status: ClientStatus.PENDING,
      token: generateToken({ id: userId, username: username}),
      coins: [],
    };
    await createClient(newClient);
    user = newClient
  }

  return user;
}