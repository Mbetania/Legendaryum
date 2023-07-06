var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HTTP_STATUS } from "../../types/http";
import * as roomService from "../../services/roomService";
import { getClientById } from "../../services/clientService";
import redisClient from "../../services/redis";
import { v4 as uuidv4 } from 'uuid';
import config from "../../utils/readJSONConfig";
export const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Crear una nueva sala con un ID generado y la configuración predeterminada.
        const room = {
            id: uuidv4(),
            capacity: config.capacity,
            coinsAmount: config.coinsAmount,
            scale: config.scale
        };
        yield redisClient.set(`room:${room.id}`, JSON.stringify(room));
        res.json(room);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});
export const getRoomById = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const roomData = yield redisClient.get(`room:${roomId}`);
    if (!roomData) {
        throw new Error('Room not found');
    }
    let room;
    try {
        room = JSON.parse(roomData);
    }
    catch (error) {
        console.error('Error parsing roomData: ', error);
        throw error;
    }
    return room;
});
export const joinRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const { clientId } = req.body;
    try {
        const client = yield getClientById(clientId);
        if (!client) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'client not found' });
        }
        const updateRoom = yield roomService.joinRoom(roomId, clientId);
        res.status(HTTP_STATUS.OK).json(updateRoom);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
    }
});
export const resetRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    try {
        const room = yield roomService.resetRoom(roomId);
        return res.status(HTTP_STATUS.OK).json({ room });
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
    }
});
