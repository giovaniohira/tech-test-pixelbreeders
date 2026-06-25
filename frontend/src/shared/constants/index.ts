export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const ALLOWED_FILE_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
};

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_FILE_EXTENSIONS = ".png,.jpg,.jpeg,.pdf,.txt";

export const COPYRIGHT_YEAR = new Date().getFullYear();
