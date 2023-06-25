//users.ts

import express from 'express';
import { Redis } from 'ioredis';
import { getCoin, getUserCoins } from '../../models/coins';
import { HTTP_STATUS } from '../../types/http';
import { Coin } from '../../types/coin';

const coinAmountUsersRouter = express.Router();
const redis = new Redis();

coinAmountUsersRouter.get('/:userId/', async (req, res) => {
  try {
    const { userId } = req.params;
    const coinIds = await getUserCoins(userId, redis);
    const coins: Coin[] = [];
    for (let coinId of coinIds) {
      const coin = await getCoin(coinId);
      if (coin) {
        coins.push(coin);
      } else {
        console.warn(`Coin with id ${coinId} does not exist`);
      }
    }
    res.json(coins);
  } catch (error) {
    console.error('Error fetching user coins:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error fetching user coins');
  }
});

export default coinAmountUsersRouter;
