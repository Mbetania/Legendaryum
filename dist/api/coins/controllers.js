var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HTTP_STATUS } from '../../types/http';
import * as coinService from '../../services/coinService';
import { getRoomById } from '../../services/roomService';
import { getClientById } from '../../services/clientService';
export const getCoinsOfUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = req.params.clientId;
    try {
        const coins = yield coinService.getCoinsOfUser(clientId);
        res.json(coins);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});
export const getCoinById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const coinId = req.params.coinId;
    try {
        const coins = yield coinService.getCoinById(coinId);
        res.json(coins);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
    }
});
export const getCoinsInRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    try {
        const coins = yield coinService.getCoinsInRoom(roomId);
        res.json(coins);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});
export const isCoinAssociatedToUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = req.params.clientId;
    const coinId = req.params.coinId;
    try {
        const client = yield getClientById(clientId);
        if (!client) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Client not found' });
        }
        const coin = yield coinService.getCoinById(coinId);
        if (!coin) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Coin not found' });
        }
        const isAssociated = yield coinService.isCoinAssociatedToUser(clientId, coinId);
        res.json(isAssociated);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internat server error' });
    }
});
export const generateCoins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    try {
        const room = yield getRoomById(roomId);
        if (!room) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Room not found' });
            return;
        }
        const coins = yield coinService.generateCoins(room);
        res.json(coins);
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});
export const grabCoin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, coinId, clientId } = req.params;
    try {
        const room = yield getRoomById(roomId);
        const coin = yield coinService.getCoinById(coinId);
        const client = yield getClientById(clientId);
        if (!room) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'room not found' });
        }
        else if (!coin) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'coin not found' });
        }
        else if (!client) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'client not found' });
        }
        yield coinService.grabCoin(roomId, coinId, clientId);
        res.json({ message: 'coin grabbed successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});
export const removeCoinFromRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, coinId } = req.params;
    try {
        const room = yield getRoomById(roomId);
        const coin = yield coinService.getCoinById(coinId);
        if (!room) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'room not found' });
        }
        else if (!coin) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'coin not found' });
        }
        yield coinService.removeCoinFromRoom(roomId, coinId);
        res.json({ message: 'coin remove succesfully from te room' });
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});
