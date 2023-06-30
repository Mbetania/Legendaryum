export type Coin = {
  id: string;
  position: Vector3;
  ttl: number; // expiration time
  isCollected: boolean;
};
export type OwnedCoin = {
  id: string;
  position: Vector3;
};
export type Vector3 = {
  x: number;
  y: number;
  z: number;
};
