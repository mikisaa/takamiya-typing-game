import fs from "fs";
import { parseCsvContent } from "./questionLoader.js";

/**
 * Loads Question Master CSV from local file system in Node.js runtime.
 * @param {string} filePath
 * @returns {Array<object>}
 */
export function loadQuestionsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Question Master file not found at path: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return parseCsvContent(content);
}
