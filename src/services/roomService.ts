import redisClient from "./redis";
import { Room } from "../types/room";
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

  // We get the full client data using the stored client IDs
  if (room.clients) {
    const clients = [];
    for (let clientId of room.clients) {
      const clientData = await getClientById(clientId);
      if (clientData) {
        clients.push(clientData);
      }
    }
    room.clients = clients;
  }

  return room;
};

// Unir a un cliente a una sala
export const joinRoom = async (roomId: string, clientId: string): Promise<Room | null> => {
  const roomData = await redisClient.get(`room:${roomId}`);
  if (!roomData) {
    return null;
  }

  const room: Room = JSON.parse(roomData);

  // Instead of storing the full client object, we just store the client ID
  room.clients?.push(clientId);

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
