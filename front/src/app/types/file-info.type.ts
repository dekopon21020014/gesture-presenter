import { Timestamp } from "firebase/firestore";

export type StoredFileInfo = {
  id: string;
  fileName: string;
  filePath: string,
  fileUrl: string;
  fileSize: number
  advice: string;
  analyzed: boolean;
  createdAt: Timestamp;
}

