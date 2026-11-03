/** where the small data files live */
import path from "path";

export const dataDir = path.resolve(process.env.PEPPY_DATA_DIR || "data");
