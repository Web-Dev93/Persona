import path from "path";
import fs from "fs";

/**
 * Where uploaded files live. Defaults to ./uploads next to the working
 * directory; UPLOAD_DIR moves it somewhere writable and outside the checkout.
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "uploads");

export function ensureUploadDir(): string {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  return UPLOAD_DIR;
}
