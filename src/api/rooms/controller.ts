import { Request, Response } from "express";
import { HTTP_STATUS } from "../../types/http";
import * as roomService from "../../services/roomService";
import { getClientById } from "../../services/clientService";
import redisClient from "../../services/redis";
import { v4 as uuidv4 } from 'uuid';
import config from "../../utils/readJSONConfig";
import { Room } from "../../types/room";


export const createRoom = async (req: Request, res: Response) => {
  try {
    // Crear una nueva sala con un ID generado y la configuración predeterminada.
    const room = {
      id: uuidv4(),
      capacity: config.capacity,
      coinsAmount: config.coinsAmount,
      scale: config.scale
    };
    await redisClient.set(`room:${room.id}`, JSON.stringify(room));
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
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


export const joinRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { clientId } = req.body;

  try {
    const client = await getClientById(clientId);
    if (!client) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'client not found' });
    }

    const updateRoom = await roomService.joinRoom(roomId, clientId);
    res.status(HTTP_STATUS.OK).json(updateRoom);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
  }
};

export const resetRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    const room = await roomService.resetRoom(roomId);
    return res.status(HTTP_STATUS.OK).json({ room });
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "internal server error" })
  }
}