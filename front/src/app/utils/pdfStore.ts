import { type StoredFileInfo } from "@/app/types/file-info.type"
import { deleteFileInfoFromFirebase, getAllFilesInfoFromFirebase } from "@/app/firebase/form/fileInfo"
import { deleteFileFromFirebase } from "@/app/firebase/form/uploadFile"

export function saveFileInfoToLocalStorage(fileInfo: StoredFileInfo) {
  try {
    localStorage.setItem(fileInfo.id, JSON.stringify(fileInfo));
  } catch (e) {
    console.error("Error saving FileInfo to localStorage", e);
  }
}

// 全てのファイル情報を取得する関数
export const getAllFilesInfo = async (): Promise<StoredFileInfo[] | undefined> => {
  const files: StoredFileInfo[] = [];

  if (localStorage.length !== 0) {
    for (let key in localStorage) {
      const fileInfo = getStoredFileInfoFromLocalStorage(key);
      if (fileInfo) {
        files.push(fileInfo); 
      }
    }
    return files
  } else {
    // localStorageにデータがない場合はFirebase Storeからデータを取得
    const firebaseFiles: StoredFileInfo[] = await getAllFilesInfoFromFirebase();
    for (let i = 0; i < firebaseFiles.length; i++) {
      saveFileInfoToLocalStorage(firebaseFiles[i]);
    }
    return firebaseFiles;
  }
}

export const getFileInfo = async (fileId: string): Promise<StoredFileInfo | null> => {
  try {
    const fileInfo = getStoredFileInfoFromLocalStorage(fileId);  // localStorage から fileId に対応するデータを取得
    if (fileInfo) return fileInfo;
  } catch (e) {
    console.error("Error parsing file info:", e);
  }
  return null
};

export const getFileUrl = async (fileId: string): Promise<string | null> => {
  const fileInfo = await getFileInfo(fileId);

  // 値は正規表現で検証、攻撃者の指定したファイルは読み込めないように

  if (!fileInfo || !fileInfo.fileUrl) {
    console.error("No download URL found for the file.");
    return null;
  }
  return fileInfo.fileUrl
}

export const deleteFromLocalStorage = async (): Promise<void> => {
  try {
    const filesInfo: StoredFileInfo[] | undefined = await getAllFilesInfo()
    if (!filesInfo) return;

    for (const fileInfo of filesInfo) {
      localStorage.removeItem(fileInfo.id);
    }
  } catch (error) {
    console.error("Error deleting file information:", error);
  }
};
  

export const deleteFileInfo = async (fileId: string): Promise<void> => {
  try {
    const fileInfo = await getFileInfo(fileId);

    if (fileInfo) {
      const { id, filePath } = fileInfo;
      await deleteFileFromFirebase(filePath);  // Firebase Storageから削除
      await deleteFileInfoFromFirebase(id);  // Firestoreから削除
      localStorage.removeItem(id);  // ローカルストレージから削除
    }
  } catch (error) {
    console.error("Error deleting file information:", error);
  }
};

export const deleteAllFilesInfo = async (): Promise<void> => {
  try {
    const filesInfo: StoredFileInfo[] | undefined = await getAllFilesInfo()
    if (!filesInfo) return;

    for (const { id, filePath } of filesInfo) {
      await deleteFileFromFirebase(filePath);  // Firebase Storageから削除
      await deleteFileInfoFromFirebase(id);  // Firestoreから削除
      localStorage.removeItem(id);  // ローカルストレージから削除
    }
  } catch (error) {
    console.error("Error deleting all file information:", error);
  }
};


// URLからファイルを読み込み
export const fetchPDF = async (fileId: string): Promise<File | null> => {
  const fileInfo = await getFileInfo(fileId);


  if (!fileInfo?.fileUrl) return null;

  try {
    const response = await fetch(fileInfo.fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch file from URL: ${fileUrl}`);

    const blob = await response.blob();
    return new File([blob], fileInfo.fileName, { type: blob.type });
  } catch (error) {
    console.error("Error fetching file:", error);
    return null; 
  }
}

export const cleanupOldFiles = () => {
  if (localStorage.length === 0) return;

  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;

  for (let key in localStorage) {
    const fileInfo = getStoredFileInfoFromLocalStorage(key);
    if (fileInfo) {
      const createdAt = fileInfo.createdAt.seconds * 1000 + fileInfo.createdAt.nanoseconds / 1000000;
      if (now - createdAt > thirtyMinutes) {
        localStorage.removeItem(key);
      }
    }
  }
};



const getStoredFileInfoFromLocalStorage = (key: string): StoredFileInfo | null => {
  const fileInfo = localStorage.getItem(key);

  if (fileInfo) {
    try {
      const parsedFileInfo = JSON.parse(fileInfo);

      // 必要なプロパティがすべて存在するかチェック
      if (parsedFileInfo.id && parsedFileInfo.fileName && parsedFileInfo.filePath && parsedFileInfo.fileUrl &&        
        typeof parsedFileInfo.analyzed === "boolean" && parsedFileInfo.createdAt && 
        typeof parsedFileInfo.createdAt.seconds === "number" && typeof parsedFileInfo.createdAt.nanoseconds === "number") {
        
        return parsedFileInfo;
      }
    } catch (e) {
      console.error("Error parsing file info:", e);
    }
  }
  return null;
};

