import redisClient from "./redis";
import { Client, ClientStatus } from "../types/users";
import { generateToken } from "./authService";
import { v4 as uuidv4 } from 'uuid';


export const createClient = async (client: Client): Promise<void> => {
  const clientData = JSON.stringify(client);
  await redisClient.set(`client:${client.id}`, clientData);
};

export const removeClient = async (client: Client): Promise<void> => {
  await redisClient.del(`client:${client.id}`);
};

export const getClientById = async(clientId: string): Promise<Client | null> => {
  const clientData = await redisClient.get(`client:${clientId}`);
  if(clientData){
    const client = JSON.parse(clientData);
    if(!client.coins){
      client.coins = []
    }
    return client;
  }
  return null;
}

// export const getClientByUsername = async (username: string): Promise<Client | null> => {
//   const clientData = await redisClient.get(`user:${username}`);
//   return clientData ? JSON.parse(clientData) : null;
// }



export const authenticateClientById = async(username: string, clientId: string): Promise<Client> =>{
  let user = await getClientById(clientId)

  if(!user){
    const id = uuidv4();
    const newClient: Client = {
      id: id,
      username: username,
      status: ClientStatus.PENDING,
      token: generateToken({ id: id, username: username}),
      coins: [],
    };
    await createClient(newClient);
    user = newClient
  }

  return user;
}