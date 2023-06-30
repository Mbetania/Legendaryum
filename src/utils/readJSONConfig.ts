import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Room } from "../types/room";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rawData = readFileSync(join(__dirname, "../src/roomConfig.json"), "utf-8");
const config: Room = JSON.parse(rawData);

export default config;
