var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as clientService from "../../services/clientService";
import { HTTP_STATUS } from "../../types/http";
import redisClient from "../../services/redis";
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from "../../services/authService";
import { ClientStatus } from "../../types/client";
export const getClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = req.params.clientId;
    try {
        const client = yield clientService.getClientById(clientId);
        res.json(client);
    }
    catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).send('Client not found');
    }
});
export const createClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = uuidv4();
        const client = {
            id: id,
            status: ClientStatus.PENDING,
            token: generateToken(id),
            coins: [],
        };
        yield redisClient.set(`client:${client.id}`, JSON.stringify(client));
        res.json(client);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});
export const authenticateClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = req.body.clientId;
    const client = yield clientService.authenticateClientById(clientId);
    res.json(client);
});
export const removeClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = req.params.clientId;
    const client = yield clientService.getClientById(clientId);
    if (client) {
        yield clientService.removeClient(client);
        res.send('Client removed');
    }
    else {
        res.status(HTTP_STATUS.NOT_FOUND).send('Client not found');
    }
});
