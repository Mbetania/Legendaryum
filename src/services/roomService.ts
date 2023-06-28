import { Redis } from "ioredis";
import redisClient from "./redis";
import { Room } from "../types/room";
import { Client } from "../types/users";
import { v4 as uuidv4 } from 'uuid';
import { getClientById } from "./clientService";


// Crea una sala al inicio del servidor
export const createRoom = async (room: Room): Promise<Room> => {
  room.id = uuidv4();
  room.coinsAmount = 0; // Agrega las propiedades aquí
  room.scale = { x: 0, y: 0, z: 0 }; // Agrega las propiedades aquí
  room.ttl = 0; // Agrega las propiedades aquí
  room.capacity = 4; // Agrega las propiedades aquí
  room.clients = []; // Agrega las propiedades aquí
  room.coins = []; // Agrega las propiedades aquí
  room.isActive = false; // Agrega las propiedades aquí

  const roomData = JSON.stringify(room)
  await redisClient.set(`room:${room.id}`, roomData);
  return room;
};


export const getRoomById = async (roomId: string): Promise<Room | null> => {
  const roomData = await redisClient.get(`room:${roomId}`);
  if (!roomData) {
    return null;
  }

  let room = JSON.parse(roomData);

  // If clients data is not included in the serialization, we get it manually
  if (room.clients) {
    const clients = [];
    for (let clientId of room.clients) {
      const clientData = await redisClient.get(`user:${clientId}`);
      clients.push(clientData ? JSON.parse(clientData) : null);
    }
    room.clients = clients;
  }

  return room;
};

// Unir a un cliente a una sala
export const joinRoom = async (roomId: string, clientId: string): Promise<Room | null> => {
  const roomData = await redisClient.get(`room:${roomId}`);
  const clientData = await redisClient.get(`user:${clientId}`);
  if (!roomData || !clientData) {
    return null;
  }

  const room: Room = JSON.parse(roomData);
  const client: Client = JSON.parse(clientData);

  room.clients?.push(client);

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
