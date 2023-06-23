import { Coin } from '../types/coin';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';

export const createCoin = async (): Promise<string> => {
  const coinId = uuidv4();
  const position = {
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 100
  };

  const coin: Coin = {
    id: coinId,
    position,
    ttl: 3600
  }

  await redisClient.set(coinId, JSON.stringify(coin));
  await redisClient.expire(coinId, coin.ttl)

  return coinId;
}
