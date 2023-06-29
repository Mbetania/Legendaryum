var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCoin } from "../models/coins";
import redisClient from "./redis";
export const getCoinsInRoom = (room) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `room:${room}:coins`;
    const coinIds = yield redisClient.smembers(key);
    if (!coinIds.length) {
        throw new Error(`No coins found in room ${room}`);
    }
    const coins = yield Promise.all(coinIds.map(coinId => getCoin(coinId, redisClient)));
    console.log(`Retrieved ${coins.length} coins from room ${room}`);
    return coins;
});
