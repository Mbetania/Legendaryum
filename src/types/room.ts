import { Coin } from "./coin";

export type Room = {
  id: string;
  coins: Coin[]
}


export interface Area {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  zmin: number;
  zmax: number;
}

export interface GlobalConfig {
  [room: string]: RoomConfig
}

export interface RoomConfig {
  coinsAmount: number;
  area: Area
}