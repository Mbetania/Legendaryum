var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { associateCoinToUser, isCoinAssociatedToUser } from '../../models/coins';
import { Redis } from 'ioredis';
const routerPost = express.Router();
const redis = new Redis();
routerPost.post('/:userId/:coinId/:room', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, coinId, room } = req.params;
    // Validating parameters
    if (!userId || !coinId || !room) {
        return res.status(400).json({ error: 'userId, coinId and room are required' });
    }
    let redis;
    try {
        redis = new Redis();
        // Verifying if the coin is already associated with a user
        const isAssociated = yield isCoinAssociatedToUser(userId, coinId, redis);
        if (isAssociated) {
            return res.status(400).json({ error: 'The coin is already associated with a user' });
        }
        // Associating the coin to the user
        yield associateCoinToUser(userId, coinId, room, redis);
        res.status(200).json({ message: 'Coin successfully associated with the user' });
    }
    catch (error) {
        console.error('Error associating coin to user:', error);
        res.status(500).send('Error associating coin to user');
    }
    finally {
        if (redis) {
            redis.disconnect();
        }
    }
}));
export default routerPost;
