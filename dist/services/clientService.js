var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import redisClient from "../models/redis";
export const createClient = (client) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.sadd(`user:${client.socket}`, JSON.stringify(client));
});
export const removeClient = (client) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.srem(`user:${client.socket}`);
});
