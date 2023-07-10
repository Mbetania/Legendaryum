import redisClient from "./redis";
import { Room } from "../types/room";
import { v4 as uuidv4 } from 'uuid';
import config from '../utils/readJSONConfig'
import { generateCoins } from "./coinService";

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
    throw new Error('Room not found');
  }

  let room;
  try {
    room = JSON.parse(roomData);
  } catch (error) {
    console.error('Error parsing roomData: ', error);
    throw error
  }

  return room;
};


export const joinRoom = async (roomId: string, clientId: string): Promise<Room | null> => {
  const roomData = await redisClient.get(`room:${roomId}`);
  if (!roomData) {
    throw new Error("room not found");
  }

  const room: Room = JSON.parse(roomData);

  if (room.clients?.includes(clientId)) {
    console.log('Client in room')
  }

  room.clients = room.clients || [];

  const capacity = room.capacity || 0;

  if (room.clients.length >= capacity) {
    throw new Error('Room is full');
  }

  room.clients.push(clientId);

  if (room.clients.length === capacity) {
    room.coins = await generateCoins(room);
    room.isActive = true;
  }

  await redisClient.set(`room:${roomId}`, JSON.stringify(room));

  return room;
};

export const resetRoom = async (roomId: string): Promise<Room> => {
  let roomData = await redisClient.get(`room:${roomId}`);
  let room: Room = roomData ? JSON.parse(roomData) : null;

  if (room) {
    room.isActive = false;
    room.clients = [];
    room.coins = [];

    await redisClient.set(`room:${roomId}`, JSON.stringify(room));
  }

  return room;
};
