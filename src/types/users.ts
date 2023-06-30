import express from "express";
import { Redis } from "ioredis";
import { Room } from "./room";
import { OwnedCoin } from "./coin";

export interface Client {
  id: string;
  room?: Room;
  status: ClientStatus;
  token: string;
  coins: OwnedCoin[];
}

export enum ClientStatus {
  PENDING,
  INGAME,
}

export interface UserCoinsRequest extends express.Request {
  params: {
    userId: string;
  };
  redis: Redis;
}

export interface AssociateCoinRequest extends express.Request {
  params: {
    userId: string;
    coinId: string;
    room: string;
  };
  redis: Redis;
}

export type User = {
  id: string;
};