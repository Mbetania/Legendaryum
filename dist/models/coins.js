"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeCoins = exports.generateAndStoreCoins = exports.getCoin = void 0;
const positionGeneration_1 = require("../utils/positionGeneration");
const redis_1 = __importDefault(require("../utils/redis"));
const uuid_1 = require("uuid");
const getCoin = (coinId) => __awaiter(void 0, void 0, void 0, function* () {
    const coin = yield redis_1.default.get(coinId);
    if (!coin) {
        throw new Error(`Coin with id ${coinId} does not exist`);
    }
    return JSON.parse(coin);
});
exports.getCoin = getCoin;
//generar coins
const generateAndStoreCoins = (room, count, area) => __awaiter(void 0, void 0, void 0, function* () {
    const coins = [];
    for (let i = 0; i < count; i++) {
        const coin = {
            id: (0, uuid_1.v4)(),
            position: {
                x: (0, positionGeneration_1.randomInRange)(area.xmin, area.xmax),
                y: (0, positionGeneration_1.randomInRange)(area.ymin, area.ymax),
                z: (0, positionGeneration_1.randomInRange)(area.zmin, area.zmax),
            },
            ttl: 60 * 60,
        };
        coins.push(coin);
    }
    yield (0, exports.storeCoins)(room, coins, redis_1.default);
});
exports.generateAndStoreCoins = generateAndStoreCoins;
//almacena coins en redis
const storeCoins = (room, coins, client) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `coins:${room}`;
    const value = JSON.stringify(coins);
    yield client.set(key, value, 'EX', 60 * 60); // TTL de 1 hora
});
exports.storeCoins = storeCoins;
