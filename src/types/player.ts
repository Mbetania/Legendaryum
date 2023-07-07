import { Coin } from "./coin";
import { Scale } from "./room";

export interface Player {
  id: string;
  clientId: string;
  position: Scale;
  playerType: number;
  coins: Coin[]
}