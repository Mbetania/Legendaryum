import { generateToken } from "../services/authService";
import { createClient } from "../services/clientService";
import { Client, ClientStatus, User } from '../types/users'
import { v4 as uuidv4 } from 'uuid';


export const createUser = async (username: string): Promise<Client> => {
  const user: User = {id: uuidv4(), username}
  const token = generateToken(user)

  const client: Client = {
    id: user.id,
    username: user.username,
    status: ClientStatus.PENDING,
    token,
    coins: []
  };
  await createClient(client);

  return client;
}