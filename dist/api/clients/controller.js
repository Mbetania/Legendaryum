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
//* GET
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
//* POST
export const createClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = req.body;
    yield clientService.createClient(client);
    res.status(HTTP_STATUS.CREATED).send('Client created');
});
export const authenticateClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = req.params.clientId;
    const client = yield clientService.authenticateClientById(clientId);
    res.json(client);
});
//* DELETE
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
