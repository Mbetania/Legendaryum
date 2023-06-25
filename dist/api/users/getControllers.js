//users.ts
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
import { HTTP_STATUS } from '../../types/http';
const coinAmountUsersRouter = express.Router();
const redis = new Redis();
coinAmountUsersRouter.get('/:userId/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const coinIds = yield getUserCoins(userId, redis);
        const coins = [];
        for (let coinId of coinIds) {
            const coin = yield getCoin(coinId);
            if (coin) {
                coins.push(coin);
            }
            else {
                console.warn(`Coin with id ${coinId} does not exist`);
            }
        }
        res.json(coins);
    }
    catch (error) {
        console.error('Error fetching user coins:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error fetching user coins');
    }
}));
export default coinAmountUsersRouter;
