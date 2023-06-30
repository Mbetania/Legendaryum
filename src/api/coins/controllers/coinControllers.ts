import express from 'express';
import { HTTP_STATUS } from '../../../types/http';
import { getCoinsOfUser } from '../coinService';
import { getCoinsInRoom } from '../../../services/coinService';

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

// coinControllersRouter.post('/:userId/:coinId/:room', async (req, res, next) => {
//   const { userId, coinId, room } = req.params;

//   if (!userId || !coinId || !room) {
//     return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'userId, coinId and room are required' });
//   }

//   try {
//     await collectCoin(userId, coinId, room);
//     res.status(HTTP_STATUS.OK).json({ message: 'Coin successfully associated with the user' });
//   } catch (error) {
//     console.error('Error associating coin to user:', error);
//     res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error associating coin to user');
//   }
// });

coinControllersRouter.get('/:room/coins', async (req, res, next) => {
  const { room } = req.params;
  if (!room) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'room is required' });
  }

  try {
    const coins = await getCoinsInRoom(room);
    res.json(coins);
  } catch (error) {
    console.error('Error fetching room coins:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error fetching room coins');
  }
});

export default coinControllersRouter;
