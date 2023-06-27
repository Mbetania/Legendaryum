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
import { ClientStatus } from "../types/users";
import { generateToken } from "./authService";
export const createClient = (client) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.set(`user:${client.username}`, JSON.stringify(client));
});
export const removeClient = (client) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.del(`user:${client.username}`);
});
export const getClientById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const clientData = yield redisClient.get(`user:${userId}`);
    return clientData ? JSON.parse(clientData) : null;
});
export const authenticateClientById = (username, userId) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield getClientById(userId);
    if (!user) {
        const newClient = {
            id: userId,
            username: username,
            status: ClientStatus.PENDING,
            token: generateToken({ id: userId, username: username }),
            coins: [],
        };
        yield createClient(newClient);
        user = newClient;
    }
    return user;
});
