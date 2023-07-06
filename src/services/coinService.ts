import { Coin } from '../types/coin';
import { v4 as uuidv4 } from 'uuid';
import { Room } from '../types/room';
import redisClient from "./redis";
import { getClientById } from './clientService';
import { getRoomById } from './roomService';

export const getCoinsOfUser = async (clientId: string): Promise<Coin[]> => {
  const coinIds = await getUserCoinsIds(clientId);
  const coins: Coin[] = [];
  for (let id of coinIds) {
    const coin = await getCoinById(id);
    if (!coin) {
      console.error(`Coin with id ${id} does not exist`);
      continue;
    }
    coins.push(coin);
  }
  return coins;
};

export const getCoinById = async (coinId: string): Promise<Coin> => {
  const coinData = await redisClient.get(`coins:${coinId}`);
  if (coinData) {
    let coin;
    try {
      coin = JSON.parse(coinData);
    } catch (error) {
      console.error('Error parsing coinData: ', error);
      throw error;
    }
    return coin;
  }
  throw new Error('Coin not found');
}

export const getCoinsInRoom = async (room: string): Promise<Coin[]> => {
  const key = `room:${room}:coins`;
  const coinIds = await redisClient.smembers(key);

  if (!coinIds.length) {
    throw new Error(`No coins found in room ${room}`);
  }

  const coins = await Promise.all(coinIds.map(coinId => getCoinById(coinId)));

  console.log(`Retrieved ${coins.length} coins from room ${room}`);
  return coins.filter((coin): coin is Coin => coin !== null);
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

    // Set the coin with a TTL of 3600 seconds (1 hour)
    await redisClient.set(`coins:${coin.id}`, JSON.stringify(coin), 'EX', coin.ttl);
    await redisClient.sadd(`room:${room.id}:coins`, coin.id);
  }

  room.coins = coins.map(coin => ({ id: coin.id, position: coin.position, ttl: coin.ttl, isCollected: coin.isCollected }));
  await redisClient.set(`room:${room.id}`, JSON.stringify(room));

  return coins;
}



export const isCoinAssociatedToUser = async (clientId: string, coinId: string): Promise<boolean> => {
  const isMember = await redisClient.sismember(`client:${clientId}:coins`, coinId);
  return isMember === 1;
};

export const grabCoin = async (roomId: string, clientId: string, coinId: string) => {
  try {
    const coin = await getCoinById(coinId);
    const room = await getRoomById(roomId);
    const client = await getClientById(clientId);

    if (!coin) {
      throw new Error(`Coin with id ${coinId} not found.`);
    }
    if (!room) {
      throw new Error(`Room with id ${roomId} not found.`);
    }
    if (!client) {
      throw new Error(`Client with id ${clientId} not found.`);
    }

    if (coin.isCollected) {
      throw new Error(`Coin with id ${coinId} has already been collected.`);
    }

    coin.isCollected = true;
    await redisClient.set(`coins:${coin.id}`, JSON.stringify(coin));
    await redisClient.sadd(`client:${clientId}:coins`, coin.id);

    await removeCoinFromRoom(roomId, coin.id)
  } catch (error) {
    console.error('Error in grabCoin: ', error)
    throw error;
  }
}




export const getUserCoinsIds = async (clientId: string): Promise<string[]> => {
  const coinIds = await redisClient.smembers(`client:${clientId}:coins`);
  return coinIds;
};


export const removeCoinFromRoom = async (roomId: string, coinId: string) => {
  const room = await getRoomById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  room.coins = room.coins?.filter((coin) => coin.id !== coinId);

  await redisClient.set(`room:${roomId}`, JSON.stringify(room));
};
