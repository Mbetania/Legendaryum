import express from 'express';
import { associateCoinToUser, isCoinAssociatedToUser } from '../../models/coins';
import { Redis } from 'ioredis';
import { HTTP_METHODS, HTTP_STATUS } from '../../types/http';

const routerPost = express.Router();
const redis = new Redis();

routerPost.post('/:userId/:coinId/:room', async (req, res, next) => {
  const { userId, coinId, room } = req.params;

  // Validating parameters
  if (!userId || !coinId || !room) {
    return res.status(400).json({ error: 'userId, coinId and room are required' });
  }

  let redis;
  try {
    redis = new Redis();
    // Verifying if the coin is already associated with a user
    const isAssociated = await isCoinAssociatedToUser(userId, coinId, redis);
    if (isAssociated) {
      return res.status(400).json({ error: 'The coin is already associated with a user' });
    }

    // Associating the coin to the user
    await associateCoinToUser(userId, coinId, room, redis);
    res.status(200).json({ message: 'Coin successfully associated with the user' });
  } catch (error) {
    console.error('Error associating coin to user:', error);
    res.status(500).send('Error associating coin to user');
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
});
export default routerPost;