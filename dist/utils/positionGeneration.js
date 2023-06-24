"use strict";
// export const checkCoinDistance = (newPosition, existingCoins, minDistance) =>{
//   for (let coin of existingCoins) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomInRange = void 0;
//   }
// }
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}
exports.randomInRange = randomInRange;
