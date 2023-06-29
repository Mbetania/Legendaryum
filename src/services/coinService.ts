import { getCoin } from "../models/coins";
import { Coin } from "../types/coin";
import redisClient from "./redis";

export const getCoinsInRoom = async (room: string): Promise<Coin[]> => {
  const key = `room:${room}:coins`;
  const coinIds = await redisClient.smembers(key);

  if (!coinIds.length) {
    throw new Error(`No coins found in room ${room}`);
  }

  const coins = await Promise.all(coinIds.map(coinId => getCoin(coinId, redisClient)));

  console.log(`Retrieved ${coins.length} coins from room ${room}`);
  return coins;
};
