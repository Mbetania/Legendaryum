import { Request, Response } from "express";
import { HTTP_STATUS } from "../../types/http";
import * as roomService from "../../services/roomService";
import { getClientById } from "../../services/clientService";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const room = await roomService.createRoom();
    res.status(HTTP_STATUS.CREATED).json(room);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "internal server error" })
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;

  try {
    const room = await roomService.getRoomById(roomId);

    if (!room) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "room not found" });
    } else {
      return res.status(HTTP_STATUS.OK).json(room)
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  const { roomId, clientId } = req.params;
  try {
    const room = await roomService.getRoomById(roomId);
    const client = await getClientById(clientId);
    if (!room) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'room not found' });
    } else if (!client) {
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