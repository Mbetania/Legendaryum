var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { generateToken } from "../services/authService";
import { createClient } from "../services/clientService";
import { ClientStatus } from '../types/users';
import { v4 as uuidv4 } from 'uuid';
export const createUser = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = { id: uuidv4(), username };
    const token = generateToken(user);
    const client = {
        id: user.id,
        username: user.username,
        status: ClientStatus.PENDING,
        token,
        coins: []
    };
    yield createClient(client);
    return client;
});
