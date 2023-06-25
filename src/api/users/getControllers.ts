import express from 'express';
import { Redis } from 'ioredis';
import { getCoin, getUserCoins } from '../../models/coins';
import { HTTP_STATUS } from '../../types/http';
import { Coin } from '../../types/coin';

const coinAmountUsersRouter = express.Router();

coinAmountUsersRouter.get('/:userId/coins', async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const redis = new Redis();
  try {
    const coinIds = await getUserCoins(userId, redis);
    const coins: Coin[] = [];
    for (let id of coinIds) {
      const coin = await getCoin(id, redis);
      if (!coin) {
        console.error(`Coin with id ${id} does not exist`);
        continue;
      }
      coins.push(coin);
    }

    if (coins.length === 0) {
      return res.status(404).json({ error: 'No coins found for this user' });
    }

    res.json(coins);
  } catch (error) {
    console.error('Error fetching user coins:', error);
    res.status(500).send('Error fetching user coins');
  } finally {
    redis.disconnect();
  }
});


export default coinAmountUsersRouter;
