import { Request, Response, NextFunction } from "express"
import { HTTP_STATUS } from "../types/http"

export const internar_server_error = async (req: Request, res: Response) => {
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' })
}

export const not_found = async (req: Request, res: Response, netx: NextFunction) => {
  res.status(HTTP_STATUS.NOT_FOUND)
}