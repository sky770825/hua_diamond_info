import fs from "fs";
import { config } from "../config/index.js";

export function readMembers() {
  const raw = fs.readFileSync(config.DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeMembers(members) {
  fs.writeFileSync(config.DATA_PATH, JSON.stringify(members, null, 2), "utf-8");
}
