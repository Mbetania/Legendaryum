var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Redis } from 'ioredis';
import { getCoin, getUserCoins, isCoinAssociatedToUser, associateCoinToUser } from '../../models/coins';
export const getCoinsOfUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const redis = new Redis();
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
    redis.disconnect();
    return coins;
});
export const associateCoinWithUser = (userId, coinId, room) => __awaiter(void 0, void 0, void 0, function* () {
    let redis;
    try {
        redis = new Redis();
        const isAssociated = yield isCoinAssociatedToUser(userId, coinId, redis);
        if (isAssociated) {
            throw new Error('The coin is already associated with a user');
        }
        yield associateCoinToUser(userId, coinId, room, redis);
    }
    catch (error) {
        throw error;
    }
    finally {
        if (redis) {
            redis.disconnect();
        }
    }
    ;
});
