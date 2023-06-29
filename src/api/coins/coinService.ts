import { Redis } from 'ioredis';
import { generateAndStoreCoins, getCoin, getUserCoins, isCoinAssociatedToUser } from '../../models/coins';
import { Coin } from '../../types/coin';
import redisClient from '../../services/redis';

export const getCoinsOfUser = async (userId: string) => {
  const client = new Redis();
  const coinIds = await getUserCoins(userId, redis);
  const coins: Coin[] = [];
  for (let id of coinIds) {
    const coin = await getCoin(id, redis);
    if (!coin) {
      console.error(`Coin with id ${id} does not exist`);
      continue;
    }
    coins.push(coin);
  }
  client.disconnect();
  return coins;
};

// Asigna un número de monedas a una sala
export const assignCoinsToRoom = async (roomId: string, numCoins: number): Promise<void> => {
  const pipeline = redisClient.pipeline();

  for (let i = 0; i < numCoins; i++) {
    const coinId = await generateAndStoreCoins(redisClient, numCoins); // Función que crea un ID único para una moneda
    pipeline.sadd(`room:${roomId}:coins`, coinId);
  }

  await pipeline.exec();
};

// Un usuario recoje una moneda de una sala
export const collectCoin = async (userId: string, coinId: string, roomId: string): Promise<void> => {
  const pipeline = redisClient.pipeline();

  pipeline.srem(`room:${roomId}:coins`, coinId);
  pipeline.sadd(`user:${userId}:coins`, coinId);

  await pipeline.exec();
};

export const associateCoinWithUser = async (userId: string, coinId: string, room: string) => {
  let redis;
  try {
    redis = new Redis();
    const isAssociated = await isCoinAssociatedToUser(userId, coinId, redis);
    if (isAssociated) {
      throw new Error('The coin is already associated with a user');
    }

    await collectCoin(userId, coinId, room, redis);
  } catch (error) {
    throw error;
  } finally {
    if (redis) {
      redis.disconnect();
    }
  };
}
