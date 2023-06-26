import redisClient from "../models/redis";
import { Client } from "../types/users";

export const createClient = async (client: Client): Promise<void> => {
  await redisClient.sadd(`user:${client.socket}`, JSON.stringify(client));
};

export const removeClient = async (client: Client): Promise<void> => {
  await redisClient.srem(`user:${client.socket}`);
};
