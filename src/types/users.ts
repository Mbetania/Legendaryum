import express from 'express';
import { Redis } from 'ioredis';

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