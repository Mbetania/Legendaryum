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
import { generateToken } from "./authService";
import { v4 as uuidv4 } from 'uuid';
import { ClientStatus } from "../types/client";
export const createClient = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const clientData = JSON.stringify(client);
    yield redisClient.set(`client:${client.id}`, clientData);
});
export const removeClient = (client) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.del(`client:${client.id}`);
});
export const getClientById = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const clientData = yield redisClient.get(`client:${clientId}`);
    if (!clientData) {
        throw new Error("client not found");
    }
    let client;
    try {
        client = JSON.parse(clientData);
    }
    catch (error) {
        console.error('Error parsing client data: ', error);
    }
    if (!client.coins) {
        client.coins = [];
    }
    return client;
});
export const authenticateClientById = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const id = clientId || uuidv4();
    let user;
    try {
        user = yield getClientById(id);
    }
    catch (error) {
        const newClient = {
            id: id,
            status: ClientStatus.PENDING,
            token: generateToken(id),
            coins: [],
        };
        yield createClient(newClient);
        user = newClient;
    }
    return user;
});
