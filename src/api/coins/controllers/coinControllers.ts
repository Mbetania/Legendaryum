import express from 'express';
import { associateCoinWithUser, getCoinsOfUser } from '../coinService';
import { HTTP_STATUS } from '../../../types/http';

const coinControllersRouter = express.Router();

coinControllersRouter.get('/:userId/coins', async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'userId is required' });
  }

  try {
    const coins = await getCoinsOfUser(userId);
    if (coins.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'No coins found for this user' });
    }
    res.json(coins);
  } catch (error) {
    console.error('Error fetching user coins:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error fetching user coins');
  }
});

coinControllersRouter.post('/:userId/:coinId/:room', async (req, res, next) => {
  const { userId, coinId, room } = req.params;

  if (!userId || !coinId || !room) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'userId, coinId and room are required' });
  }

  try {
    await associateCoinWithUser(userId, coinId, room);
    res.status(HTTP_STATUS.OK).json({ message: 'Coin successfully associated with the user' });
  } catch (error) {
    console.error('Error associating coin to user:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error associating coin to user');
  }
});

export default coinControllersRouter;