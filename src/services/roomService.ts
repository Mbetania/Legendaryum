import { Redis } from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { Room} from "../types/room";

export const createRoom = async (
  data: Partial<Room>,
  client: Redis
): Promise<string> => {
  const id = uuidv4();
  await client.set(`room:${id}`, JSON.stringify(data));
  return id;
};
