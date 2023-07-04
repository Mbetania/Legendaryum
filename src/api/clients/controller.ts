import express, { Request, Response } from "express";
import * as clientService from '../../services/clientService';
import { Client } from "../../types/client";
import { HTTP_METHODS, HTTP_STATUS } from "../../types/http";

export const getClientById = async (req: Request, res: Response) => {
  const clientId = req.params.clientId;
  const client = await clientService.getClientById(clientId)
  if (client) {
    try {
      res.json(client)
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).send('Client not found')
    }
  }
}
