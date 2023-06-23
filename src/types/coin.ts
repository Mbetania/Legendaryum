export type Coin = {
  id: string;
  position: vectorPosition;
  ttl: number;
};

type vectorPosition = {
  x: number;
  y: number;
  z: number;
}