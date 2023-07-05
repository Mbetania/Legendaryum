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
export const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield roomService.createRoom();
        res.status(HTTP_STATUS.CREATED).json(room);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
    }
});
export const getRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    try {
        const room = yield roomService.getRoomById(roomId);
        if (!room) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "room not found" });
        }
        else {
            return res.status(HTTP_STATUS.OK).json(room);
        }
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
    }
});
export const joinRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, clientId } = req.params;
    try {
        const room = yield roomService.getRoomById(roomId);
        const client = yield getClientById(clientId);
        if (!room) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'room not found' });
        }
        else if (!client) {
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
