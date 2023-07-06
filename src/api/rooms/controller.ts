import { Request, Response } from "express";
import { HTTP_STATUS } from "../../types/http";
import * as roomService from "../../services/roomService";



export const createRoom = async (req: Request, res: Response) => {
  try {
    const room = await roomService.createRoom();
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    const room = await roomService.getRoomById(roomId);
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { clientId } = req.body;

  try {
    const updatedRoom = await roomService.joinRoom(roomId, clientId);
    res.json(updatedRoom);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

export const resetRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    const room = await roomService.resetRoom(roomId);
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};