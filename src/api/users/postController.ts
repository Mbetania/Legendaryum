import express from 'express';
import { associateCoinToUser, isCoinAssociatedToUser } from '../../models/coins';
import { Redis } from 'ioredis';
import { HTTP_METHODS, HTTP_STATUS } from '../../types/http';

const routerPost = express.Router();
const redis = new Redis();

routerPost.post('/:userId/grab/:coinId', async (req, res) => {
  const { userId, coinId } = req.params;

  console.log(`Received POST request for user ${userId} and coin ${coinId}`);

  try {
    // Verifica si la moneda ya está asociada a un usuario
    const isAssociated = await isCoinAssociatedToUser(userId, coinId, redis);
    if (!isAssociated) {
      // Asociar la moneda al usuario
      await associateCoinToUser(userId, coinId, redis);
      res.status(HTTP_STATUS.OK).send('Coin associated to user');
    } else {
      res.status(HTTP_STATUS.BAD_REQUEST).send('Coin already associated to a user');
    }
  } catch (error) {
    console.error('Error associating coin:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error associating coin');
  }
});
export default routerPost;