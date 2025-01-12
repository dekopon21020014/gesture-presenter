import { Timestamp } from "firebase/firestore";

export type StoredFileInfo = {
  id: string;
  fileName: string;
  filePath: string,
  fileUrl: string;
  advice: string;
  analyzed: boolean;
  createdAt: Timestamp;
}

