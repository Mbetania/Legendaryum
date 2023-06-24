import express from 'express';
import { getCoinsInRoom } from '../../models/coins';
import { HTTP_STATUS } from '../../types/http';

const router = express.Router();

router.get('/:room', async (req, res) => {
  try {
    const coins = await getCoinsInRoom(req.params.room);
    res.json(coins);
  } catch (error) {
    if (error instanceof Error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    } else {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'An unknown error occurred' });
    }
  }
});

export default router;
