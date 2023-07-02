import express from "express";
import { Redis } from "ioredis";
import { Room } from "./room";
import { Coin } from "./coin";

export interface Client {
  id: string;
  room?: Room;
  roomId?: string;
  status: ClientStatus;
  token: string;
  coins: Coin[];
}

export enum ClientStatus {
  PENDING,
  INGAME,
}

export interface UserCoinsRequest extends express.Request {
  params: {
    clientId: string;
  };
  redis: Redis;
}

export interface AssociateCoinRequest extends express.Request {
  params: {
    clientId: string;
    coinId: string;
    room: string;
  };
  redis: Redis;
}

export type User = {
  id: string;
};