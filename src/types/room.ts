export interface Scale {
  x: number;
  y: number;
  z: number;
}

export interface Room{
  id: string;
  coinsAmount: number;
  scale: Scale;
  ttl: number;
  capacity: number;
}

export interface GameConfig {
  room: Room;
}
