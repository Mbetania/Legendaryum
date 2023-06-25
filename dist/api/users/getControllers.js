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
import { Redis } from 'ioredis';
import { getCoin, getUserCoins } from '../../models/coins';
const coinAmountUsersRouter = express.Router();
coinAmountUsersRouter.get('/:userId/coins', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }
    const redis = new Redis();
    try {
        const coinIds = yield getUserCoins(userId, redis);
        const coins = [];
        for (let id of coinIds) {
            const coin = yield getCoin(id, redis);
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
    }
    catch (error) {
        console.error('Error fetching user coins:', error);
        res.status(500).send('Error fetching user coins');
    }
    finally {
        redis.disconnect();
    }
}));
export default coinAmountUsersRouter;
