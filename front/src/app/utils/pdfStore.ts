import { type StoredFileInfo } from "@/app/types/file-info.type"
import { addAdvice, deleteFileInfoFromFirebase, getAllFilesInfoFromFirebase } from "@/app/firebase/form/fileInfo"
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
  // localStorageから情報を取得
  const files: StoredFileInfo[] = Object.keys(localStorage)
    .map(key => getStoredFileInfoFromLocalStorage(key))
    .filter(fileInfo => fileInfo !== null) as StoredFileInfo[];
  if (files.length > 0) return files;

  // localStorageにデータがなければFirebaseから取得し、ローカルに保存
  const firebaseFiles = await getAllFilesInfoFromFirebase();
  firebaseFiles.forEach(file => saveFileInfoToLocalStorage(file));

  return firebaseFiles;
};

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

export const updateAdvice = async (fileId: string, advice: string): Promise<void> => {
  const fileInfo = await getFileInfo(fileId);
  await addAdvice(fileId, advice);
  if (fileInfo) {
    fileInfo.advice = advice;
    fileInfo.analyzed = true;
    localStorage.setItem(fileId, JSON.stringify(fileInfo));
  }
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
  const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/`;
  const fileInfo = await getFileInfo(fileId);

  // fileUrlがfirebase StorageのURLの場合のみfetchを実行
  if (!fileInfo?.fileUrl || !fileInfo.fileUrl.startsWith(storageUrl)) {
    console.error(`URL does not match the target URL. Skipping fetch for ${fileInfo?.fileUrl}`);
    return null; 
  }

  try {
    const response = await fetch(fileInfo.fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch file from URL: ${fileInfo.fileUrl}`);

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
        deleteFileInfo(key);
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
        parsedFileInfo.fileSize && typeof parsedFileInfo.analyzed === "boolean" && parsedFileInfo.createdAt && 
        typeof parsedFileInfo.createdAt.seconds === "number" && typeof parsedFileInfo.createdAt.nanoseconds === "number") {
        
        return parsedFileInfo;
      }
    } catch (e) {
      console.error("Error parsing file info:", e);
    }
  }
  return null;
};
