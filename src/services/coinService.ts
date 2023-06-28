import redisClient from "./redis";
import { Room } from "../types/room";
import { v4 as uuidv4 } from 'uuid';
import { getRoomById } from "./roomService";
import { Coin } from "../types/coin";
import { getClientById } from "./clientService";
import { getCoin } from "../models/coins";

export const createCoinInRoom = async (roomId: string, coin: Coin): Promise<void> => {
  const room = await getRoomById(roomId);
  if (room) {
    room.coins?.push(coin);
    await redisClient.set(`room:${roomId}`, JSON.stringify(room));
  }
};



export const storeCoins = async(room: string, coins: Coin[]): Promise<void> => {
  for (const coin of coins) {
    const key = `coin:${coin.id}`;
    const value = JSON.stringify(coin);
    await redisClient.set(key, value, 'EX', 60 * 60); // TTL de 1 hora
    await redisClient.sadd(`coins:${room}`, coin.id); // Add coinId to room's coin set
  }
}


export const getCoinsInRoom = async (room: string): Promise<Coin[]> => {
  const key = `coins:${room}`;
  const coinIds = await redisClient.smembers(key);

  if (!coinIds.length) {
    throw new Error(`No coins found in room ${room}`);
  }

  const coins = [];
  for (const coinId of coinIds) {
    const coin = await getCoin(coinId, redisClient);
    coins.push(coin);
  }

  console.log(`Retrieved ${coins.length} coins from room ${room}`);
  return coins;
};
