import express from "express";
import { Redis } from "ioredis";
import { Room} from "./room";

export interface Client {
  socket: string;
  room?: Room;
  status: ClientStatus;
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
  username: string;
  id: string;
};