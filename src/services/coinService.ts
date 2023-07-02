import { Coin } from '../types/coin';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { Room } from '../types/room';
import redisClient from "./redis";
import { getClientById } from './clientService';
import { getRoomById } from './roomService';

export const getCoinsOfUser = async (clientId: string) => {
  const coinIds = await getUserCoins(clientId, redisClient);
  const coins: Coin[] = [];
  for (let id of coinIds) {
    const coin = await getCoin(id, redisClient);
    if (!coin) {
      console.error(`Coin with id ${id} does not exist`);
      continue;
    }
    coins.push(coin);
  }
  return coins;
};

export const getCoinById = async (coinId: string): Promise<Coin | null> => {
  const coinData = await redisClient.get(`coins:${coinId}`);
  if (coinData) {
    const coin = JSON.parse(coinData);
    return coin;
  }
  return null
}

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

export const getCoin = async (coinId: string, client: Redis): Promise<Coin> => {
  const coin = await client.get(`coin:${coinId}`);

  if (!coin) {
    throw new Error(`Coin with id ${coinId} does not exist`);
  }

  return JSON.parse(coin);
};

// Genera una serie de monedas para una sala específica.
export const generateCoins = async (room: Room): Promise<Coin[]> => {
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

    await redisClient.set(`coins:${coin.id}`, JSON.stringify(coin));
  }
  return coins;
}


export const getUserCoins = async (clientId: string, client: Redis): Promise<string[]> => {
  const coinIds = await client.smembers(`client:${clientId}:coins`);
  return coinIds;
};

export const isCoinAssociatedToUser = async (clientId: string, coinId: string, client: Redis): Promise<boolean> => {
  const isMember = await client.sismember(`client:${clientId}:coins`, coinId);
  return isMember === 1;
};

export const grabCoin = async (roomId: string, clientId: string, coinId: string) => {
  try {
    const coin = await getCoinById(coinId);
    const room = await getRoomById(roomId);
    const client = await getClientById(clientId)
    if (!coin || !room || !client) {
      console.log(roomId, coinId, clientId)
      throw new Error('Coin, room or client not found')
    }
    // Mark the coin as collected
    coin.isCollected = true;
    await redisClient.set(`coins:${coin.id}`, JSON.stringify(coin));

    // Associate coin with user
    if (!client.coins) {
      client.coins = [];
    }
    client.coins.push(coin);
    await redisClient.set(`client:${clientId}`, JSON.stringify(client));

  } catch (error) {
    console.error('Error in grabCoin: ', error)
    throw error;
  }

}
