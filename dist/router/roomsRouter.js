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
import { getRoomById, createRoom, joinRoom } from "../services/roomService";
import { HTTP_STATUS } from "../types/http";
const roomsRouter = express.Router();
roomsRouter.get('/:roomId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    try {
        const room = yield getRoomById(roomId);
        if (!room) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
        }
        else {
            res.json(room);
        }
    }
    catch (err) {
        console.error('Error fetching room:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting room data.' });
    }
}));
roomsRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomData = req.body;
    try {
        const room = yield createRoom(roomData);
        res.status(HTTP_STATUS.CREATED).json(room);
    }
    catch (err) {
        console.error('Error creating room:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create room' });
    }
}));
roomsRouter.post('/:roomId/addClient', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const { clientId } = req.body;
    try {
        const room = yield joinRoom(roomId, clientId);
        if (!room) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Failed to add client to room' });
        }
        else {
            res.json(room);
        }
    }
    catch (err) {
        console.error('Error adding client to room:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add client to room' });
    }
}));
export default roomsRouter;
