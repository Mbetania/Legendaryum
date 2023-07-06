import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../types/http';
import * as coinService from '../../services/coinService';
import { getRoomById } from '../../services/roomService';
import { getClientById } from '../../services/clientService';


export const getCoinsOfUser = async (req: Request, res: Response): Promise<void> => {
  const clientId = req.params.clientId;

  try {
    const coins = await coinService.getCoinsOfUser(clientId);
    res.json(coins);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

export const getCoinById = async (req: Request, res: Response) => {
  const coinId = req.params.coinId;
  try {
    const coins = await coinService.getCoinById(coinId)
    res.json(coins);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' })
  }
};

export const getCoinsInRoom = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  try {
    const coins = await coinService.getCoinsInRoom(roomId);
    res.json(coins);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' })
  }
};

export const isCoinAssociatedToUser = async (req: Request, res: Response) => {
  const clientId = req.params.clientId;
  const coinId = req.params.coinId;
  try {
    const client = await getClientById(clientId);
    if (!client) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Client not found' });
    }
    const coin = await coinService.getCoinById(coinId);
    if (!coin) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Coin not found' });
    }
    const isAssociated = await coinService.isCoinAssociatedToUser(clientId, coinId);
    res.json(isAssociated);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internat server error' });
  }
};


export const generateCoins = async (req: Request, res: Response) => {
  const roomId = req.params.roomId
  try {
    const room = await getRoomById(roomId);
    if (!room) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Room not found' });
      return;
    }
    const coins = await coinService.generateCoins(room);
    res.json(coins);
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

export const grabCoin = async (req: Request, res: Response) => {
  const { roomId, clientId } = req.params;
  const { coinId } = req.body;

  try {
    await coinService.grabCoin(roomId, clientId, coinId);
    res.status(HTTP_STATUS.OK).send({ message: 'Coin successfully collected.' });
  } catch (error) {
    console.error('Error in coinController grabCoin: ', error);
    if (error instanceof Error && error.message === `Coin with id ${coinId} has already been collected.`) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: error.message });
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'An error occurred while collecting the coin.' });
  }
};



export const removeCoinFromRoom = async (req: Request, res: Response) => {
  const { roomId, coinId } = req.params;

  try {
    const room = await getRoomById(roomId);
    const coin = await coinService.getCoinById(coinId);

    if (!room) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'room not found' });
    } else if (!coin) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'coin not found' });
    }
    await coinService.removeCoinFromRoom(roomId, coinId);
    res.json({ message: 'coin remove succesfully from te room' })
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};