var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { authenticateClientById, getClientById } from "../services/clientService";
import { HTTP_STATUS } from "../types/http";
const usersRouter = express.Router();
usersRouter.get('/:clientId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId } = req.params;
    try {
        const client = yield getClientById(clientId);
        if (!client) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
        }
        else {
            res.json(client);
        }
    }
    catch (err) {
        console.error('Error fetching user:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting user data.' });
    }
}));
// usersRouter.get('/username/:username', async (req, res) => {
//   const { username } = req.params;
//   try {
//     const client = await getClientByUsername(username);
//     if (!client) {
//       res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
//     } else {
//       res.json(client);
//     }
//   } catch (err) {
//     console.error('Error fetching user:', err);
//     res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting user data.' });
//   }
// });
usersRouter.post('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, clientId } = req.body;
    try {
        const client = yield authenticateClientById(clientId);
        if (!client) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Failed to authenticate user' });
        }
        else {
            res.json(client);
        }
    }
    catch (err) {
        console.error('Error authenticating user:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to authenticate user' });
    }
}));
export default usersRouter;
