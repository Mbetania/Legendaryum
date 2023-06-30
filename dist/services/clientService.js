var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import redisClient from "./redis";
import { ClientStatus } from "../types/users";
import { generateToken } from "./authService";
import { v4 as uuidv4 } from 'uuid';
export const createClient = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const clientData = JSON.stringify(client);
    yield redisClient.set(`client:${client.id}`, clientData);
});
export const removeClient = (client) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.del(`client:${client.id}`);
});
export const getClientById = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const clientData = yield redisClient.get(`client:${clientId}`);
    if (clientData) {
        const client = JSON.parse(clientData);
        if (!client.coins) {
            client.coins = [];
        }
        return client;
    }
    return null;
});
export const getCoinById = (coinId) => __awaiter(void 0, void 0, void 0, function* () {
    const coinData = yield redisClient.get(`coins:${coinId}`);
    if (coinData) {
        const coin = JSON.parse(coinData);
        return coin;
    }
    return null;
});
export const authenticateClientById = (username, clientId) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield getClientById(clientId);
    if (!user) {
        const id = uuidv4();
        const newClient = {
            id: id,
            username: username,
            status: ClientStatus.PENDING,
            token: generateToken({ id: id, username: username }),
            coins: [],
        };
        yield createClient(newClient);
        user = newClient;
    }
    return user;
});
