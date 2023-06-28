import { Redis } from "ioredis";
import redisClient from "./redis";
import { Room } from "../types/room";
import { Client } from "../types/users";
import { v4 as uuidv4 } from 'uuid';


// Crea una sala al inicio del servidor
export const createRoom = async (room: Room): Promise<Room> => {
  room.id = uuidv4();
  const roomData = JSON.stringify(room)
  await redisClient.set(`room:${room.id}`, roomData);
  return room;
};


export const getRoomById = async (roomId: string): Promise<Room | null> => {
  const roomData = await redisClient.get(`room:${roomId}`);
  if (!roomData) {
    return null;
  }

  const room = JSON.parse(roomData);
  return room;
};
// Unir a un cliente a una sala
export const joinRoom = async (roomId: string, clientId: string): Promise<Room | null> => {
  const roomData = await redisClient.get(`room:${roomId}`);
  const clientData = await redisClient.get(`client:${clientId}`);

  if (!roomData || !clientData) {
    return null;
  }

  const room: Room = JSON.parse(roomData);
  const client: Client = JSON.parse(clientData);

  room.clients?.push(client);

  // If the room is full, change the room status to active and generate coins
  if (room.clients?.length === room.capacity) {
    room.isActive = true;
    // generate coins here
  }

  await redisClient.set(`room:${roomId}`, JSON.stringify(room));

  return room;
};

// Resetear una sala después de un juego
export const resetRoom = async (roomId: string): Promise<Room> => {
  let roomData = await redisClient.get(`room:${roomId}`);
  let room: Room = roomData ? JSON.parse(roomData) : null;

  if (room) {
    // Aquí puedes restablecer los campos que necesitas, como el estado de la sala y las monedas
    room.isActive = false;
    room.clients = [];
    room.coins = [];

    await redisClient.set(`room:${roomId}`, JSON.stringify(room));
  }

  return room;
};
