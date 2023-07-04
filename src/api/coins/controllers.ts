import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../types/http';
import * as coinService from '../../services/coinService';


export const getCoinsOfUserController = async (req: Request, res: Response): Promise<void> => {
  const clientId = req.params.clientId;

  try {
    const coins = await coinService.getCoinsOfUser(clientId);
    res.json(coins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
