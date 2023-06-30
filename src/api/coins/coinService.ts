import { Redis } from 'ioredis';
import { generateCoins, getCoin, getUserCoins, isCoinAssociatedToUser } from '../../models/coins';
import { Coin } from '../../types/coin';
import redisClient from '../../services/redis';
import { Room } from '../../types/room';
import { getClientById } from '../../services/clientService';

export const getCoinsOfUser = async (userId: string) => {
  const client = new Redis();
  const coinIds = await getUserCoins(userId, redisClient);
  const coins: Coin[] = [];
  for (let id of coinIds) {
    const coin = await getCoin(id, redisClient);
    if (!coin) {
      console.error(`Coin with id ${id} does not exist`);
      continue;
    }
    coins.push(coin);
  }
  client.disconnect();
  return coins;
};

// // Un usuario recoje una moneda de una sala
// export const collectCoin = async (userId: string, coinId: string, roomId: string): Promise<void> =>{
//   const roomData = await redisClient.get(`room:${roomId}`);
//   if (!roomData) {
//     throw new Error('Room does not exist');
//   }
//   const room: Room = JSON.parse(roomData);

//   // Comprobar si la moneda existe en la sala
//   const coinExists = room.coins?.find(id => id === coinId);
//   if (!coinExists) {
//     throw new Error('Coin does not exist in room');
//   }

//   // Remover la moneda de la sala
//   room.coins = room.coins?.filter(id => id !== coinId);
//   await redisClient.set(`room:${roomId}`, JSON.stringify(room));

//   // Asociar la moneda con el usuario
//   const client = await getClientById(userId);
//   if (!client) {
//     throw new Error('Client does not exist');
//   }
//   client.coins = client.coins || [];
//   client.coins.push(coinId);
//   await redisClient.set(`client:${userId}`, JSON.stringify(client));
// };