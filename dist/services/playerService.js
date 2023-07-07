"use strict";
// import { Coin } from "../types/coin";
// import { Player } from "../types/player";
// import { Room, Scale } from "../types/room";
// import redisClient from "./redis";
// import { getRoomById } from "./roomService";
// export const createPlayer = async (player: Player): Promise<void> => {
//   const playerData = JSON.stringify(player);
//   await redisClient.set(`player:${player.id}`, playerData);
// }
// export const removePlayer = async (player: Player): Promise<void> => {
//   await redisClient.del(`pl ayer${player.id}`);
// }
// export const getPlayerById = async (playerId: string): Promise<Player | null> => {
//   if (!playerId) {
//     throw new Error('Invalid playerId');
//   }
//   const playerData = await redisClient.get(`client:${playerId}`);
//   if (!playerData) {
//     throw new Error('Player not found');
//   }
//   let player;
//   try {
//     player = JSON.parse(playerData);
//   } catch (error) {
//     console.error('Error parsing playerData: ', error);
//     throw error
//   }
//   return player;
// };
// export const addCoinToPlayer = async (player: Player, coin: Coin): Promise<void> => {
//   player.coins.push(coin);
//   await updatePlayer(player);
// }
// export const updatePlayer = async (player: Player): Promise<void> => {
//   const playerData = JSON.stringify(player);
//   await redisClient.set(`player:${player.id}`, playerData);
// }
// export const resetPlayerCoins = async (player: Player): Promise<void> => {
//   player.coins = [];
//   await updatePlayer(player);
// }
// export const updatePositions = async (roomId: string, clientId: string, newPosition: Scale): Promise<Room> => {
//   const room: Room | null = await getRoomById(roomId);
//   if (!room) {
//     throw new Error('Room not found');
//   }
//   const player: Player | undefined = room.players?.find(player => player.clientId === clientId);
//   if (!player) {
//     throw new Error('Player not found');
//   }
//   player.position = newPosition;
//   // Guardar la sala con la posición del jugador actualizada
//   await updateRoom(room);
//   return room;
// }
// // Esta es una función ficticia y debes reemplazarla por la tuya real para guardar una sala
// async function updateRoom(room: Room): Promise<void> {
//   // Código para guardar la sala en tu base de datos
// }
