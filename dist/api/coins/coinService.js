var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Redis } from 'ioredis';
import { getCoin, getUserCoins } from '../../models/coins';
import redisClient from '../../services/redis';
export const getCoinsOfUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new Redis();
    const coinIds = yield getUserCoins(userId, redisClient);
    const coins = [];
    for (let id of coinIds) {
        const coin = yield getCoin(id, redisClient);
        if (!coin) {
            console.error(`Coin with id ${id} does not exist`);
            continue;
        }
        coins.push(coin);
    }
    client.disconnect();
    return coins;
});
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
