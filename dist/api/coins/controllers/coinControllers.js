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
import { associateCoinWithUser, getCoinsOfUser } from '../coinService';
import { HTTP_STATUS } from '../../../types/http';
const coinControllersRouter = express.Router();
coinControllersRouter.get('/:userId/coins', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'userId is required' });
    }
    try {
        const coins = yield getCoinsOfUser(userId);
        if (coins.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'No coins found for this user' });
        }
        res.json(coins);
    }
    catch (error) {
        console.error('Error fetching user coins:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error fetching user coins');
    }
}));
coinControllersRouter.post('/:userId/:coinId/:room', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, coinId, room } = req.params;
    if (!userId || !coinId || !room) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'userId, coinId and room are required' });
    }
    try {
        yield associateCoinWithUser(userId, coinId, room);
        res.status(HTTP_STATUS.OK).json({ message: 'Coin successfully associated with the user' });
    }
    catch (error) {
        console.error('Error associating coin to user:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error associating coin to user');
    }
}));
export default coinControllersRouter;
