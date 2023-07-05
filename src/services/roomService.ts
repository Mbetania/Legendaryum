import redisClient from "./redis";
import { Room } from "../types/room";
import { v4 as uuidv4 } from 'uuid';
import { getClientById } from "./clientService";
import config from '../utils/readJSONConfig'
import { generateCoins } from "./coinService";
import { error } from "console";

export const createRoom = async (roomData?: Partial<Room>): Promise<Room> => {
  const room: Room = {
    id: uuidv4(),
    coinsAmount: config.coinsAmount,
    scale: config.scale,
    capacity: config.capacity,
    clients: [],
    coins: [],
    isActive: false,
    ...roomData,
  }

  const roomString = JSON.stringify(room)
  await redisClient.set(`room:${room.id}`, roomString);
  return room;
};


export const getRoomById = async (roomId: string): Promise<Room | null> => {
  const roomData = await redisClient.get(`room:${roomId}`);
  if (!roomData) {
    return null;
  }

  let room;
  try {
    room = JSON.parse(roomData);

  } catch (error) {
    console.error('Error parsing roomData: ', error);
    throw error
  }

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
    throw new Error("room not found");
  }

  const room: Room = JSON.parse(roomData);

  // Verifica si el cliente ya está en la sala
  if (room.clients?.includes(clientId)) {
    throw new Error('Client is already in the room');
  }

  // Verifica si la sala ha alcanzado su capacidad
  if (room.clients?.length === room.capacity) {
    throw new Error('Room is full');
  }

  // Instead of storing the full client object, we just store the client ID
  room.clients?.push(clientId);

  // Generar y asignar monedas inmediatamente después de que un cliente se une a la sala
  if (room.clients?.length === room.capacity) {
    room.coins = await generateCoins(room); //mapeamos a un arrays de ids de coins
    room.isActive = true; // The game starts now that all clients have joined and the coins have been generated
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
