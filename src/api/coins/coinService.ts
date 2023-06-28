import { Redis } from 'ioredis';
import { getCoin, getUserCoins, isCoinAssociatedToUser, associateCoinToUser } from '../../models/coins';
import { Coin } from '../../types/coin';

export const getCoinsOfUser = async (userId: string) => {
  const redis = new Redis();
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
  redis.disconnect();
  return coins;
};

export const associateCoinWithUser = async (userId: string, coinId: string, room: string) => {
  let redis;
  try {
    redis = new Redis();
    const isAssociated = await isCoinAssociatedToUser(userId, coinId, redis);
    if (isAssociated) {
      throw new Error('The coin is already associated with a user');
    }

    await associateCoinToUser(userId, coinId, room, redis);
  } catch (error) {
    throw error;
  } finally {
    if (redis) {
      redis.disconnect();
    }
};
}