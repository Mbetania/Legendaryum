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
import { HTTP_STATUS } from '../../types/http';
const routerPost = express.Router();
const redis = new Redis();
routerPost.post('/:userId/grab/:coinId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, coinId } = req.params;
    console.log(`Received POST request for user ${userId} and coin ${coinId}`);
    try {
        // Verifica si la moneda ya está asociada a un usuario
        const isAssociated = yield isCoinAssociatedToUser(userId, coinId, redis);
        if (!isAssociated) {
            // Asociar la moneda al usuario
            yield associateCoinToUser(userId, coinId, redis);
            res.status(HTTP_STATUS.OK).send('Coin associated to user');
        }
        else {
            res.status(HTTP_STATUS.BAD_REQUEST).send('Coin already associated to a user');
        }
    }
    catch (error) {
        console.error('Error associating coin:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error associating coin');
    }
}));
export default routerPost;
