var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { authenticateClientById, getClientById, getClientByUsername } from "../services/clientService";
import { HTTP_STATUS } from "../types/http";
const usersRouter = express.Router();
usersRouter.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const client = yield getClientById(userId);
        if (client) {
            res.json(client);
        }
        else {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'User not find' });
        }
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting user data.' });
    }
}));
usersRouter.get('/username/:username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const client = yield getClientByUsername(username);
        if (client) {
            res.json(client);
        }
        else {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'User not find' });
        }
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting user data.' });
    }
}));
usersRouter.post('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, userId } = req.body;
    try {
        const client = yield authenticateClientById(username, userId);
        res.json(client);
    }
    catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to authenticate user' });
    }
}));
export default usersRouter;
