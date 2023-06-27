import { Coin } from "./coin";
import { Client } from "./users";

export interface Scale {
  x: number;
  y: number;
  z: number;
}

export interface Room{
  id?: string;
  coinsAmount: number;
  scale: Scale;
  ttl: number;
  capacity?: number;
  clients?: Client[];
  coins?: Coin[]
}

export interface GameConfig {
  room: Room;
}