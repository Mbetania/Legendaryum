import { Coin } from '../types/coin';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { Room } from '../types/room';

export const getCoin = async (coinId: string, client: Redis): Promise<Coin> => {
  const coin = await client.get(`coin:${coinId}`);

  if (!coin) {
    throw new Error(`Coin with id ${coinId} does not exist`);
  }

  return JSON.parse(coin);
};

// Genera una serie de monedas para una sala específica.
export const generateCoins = (room: Room): Coin[] => {
  const coins: Coin[] = [];
  for (let i = 0; i < room.coinsAmount; i++) {
    const coin: Coin = {
      id: uuidv4(),
      position: {
        x: Math.random() * room.scale.x,
        y: Math.random() * room.scale.y,
        z: Math.random() * room.scale.z,
      },
      ttl: 60 * 60,
      isCollected: false
    };
    coins.push(coin);
  }
  return coins;
}



export const getUserCoins = async (userId: string, client: Redis): Promise<string[]> => {
  const coinIds = await client.smembers(`user:${userId}:coins`);
  return coinIds;
};


export const isCoinAssociatedToUser = async (userId: string, coinId: string, client: Redis): Promise<boolean> => {
  const isMember = await client.sismember(`user:${userId}:coins`, coinId);
  return isMember === 1;
};
