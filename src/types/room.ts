

export interface Scale {
  x: number;
  y: number;
  z: number;
}

export interface Room{
  id: string;
  coinsAmount: 2;
  scale: Scale;
  capacity?: number;
  clients?: string[];
  coins?: string[];
  isActive?: boolean;
}


export interface GameConfig {
  room: Room;
}