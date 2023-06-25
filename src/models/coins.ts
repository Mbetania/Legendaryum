import { Coin } from '../types/coin';
import { randomInRange } from '../utils/positionGeneration';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
import { Area } from '../types/room';
import { Redis } from 'ioredis'; // Importar `Redis` en lugar de `RedisClient`

export const getCoin = async (coinId: string): Promise<Coin> => {
  const coin = await redisClient.get(coinId);

  if (!coin) {
    throw new Error(`Coin with id ${coinId} does not exist`);
  }

  return JSON.parse(coin);
};

//generar coins
export const generateAndStoreCoins = async (room: string, coinsAmount: number, area: Area): Promise<void> => {
  const coins: Coin[] = [];
  for (let i = 0; i < coinsAmount; i++) {
    const coin: Coin = {
      id: uuidv4(),
      position: {
        x: randomInRange(area.xmin, area.xmax),
        y: randomInRange(area.ymin, area.ymax),
        z: randomInRange(area.zmin, area.zmax),
      },
      ttl: 60 * 60,
    };
    coins.push(coin);
  }
  await storeCoins(room, coins);
}

//almacena coins en redis
export const storeCoins = async(room: string, coins: Coin[]): Promise<void> => {
  const key = `coins:${room}`;
  const value = JSON.stringify(coins);
  await redisClient.set(key, value, 'EX', 60 * 60); // TTL de 1 hora
}

export const getCoinsInRoom = async (room: string): Promise<Coin[]> => {
  const key = `coins:${room}`;
  const coinsString = await redisClient.get(key);

  if (!coinsString) {
    throw new Error(`No coins found in room ${room}`);
  }

  const coins = JSON.parse(coinsString);
  console.log(`Retrieved ${coins.length} coins from room ${room}`);
  return coins;
};

export const getUserCoins = async (userId: string, client: Redis): Promise<string[]> => {
  return client.smembers(`user:${userId}:coins`);
};

export const isCoinAssociatedToUser = async (userId: string, coinId: string, client: Redis): Promise<boolean> => {
  const isMember = await client.sismember(`user:${userId}:coins`, coinId);
  return isMember === 1;
};

export const associateCoinToUser = async (userId: string, coinId: string, client: Redis): Promise<void> => {
  await client.sadd(`user:${userId}:coins`, coinId);
};
