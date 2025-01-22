'use client'
import firebase_app from "@/../firebase-config";
import { getFirestore, collection, getDoc, getDocs, setDoc, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"; 
import { getUserUid } from "@/app/firebase/utils/auth";
import { type StoredFileInfo } from '@/app/types/file-info.type';

type CreateFileData = {
  fileName: string;
  filePath: string;
  fileSize: number;
  downloadURL: string;
};

const db = getFirestore(firebase_app);

export async function addFileInfo({ fileName, filePath, fileSize, downloadURL }: CreateFileData): Promise<StoredFileInfo | Error> {
  try {
    const uid = await getUserUid()
    const fileRef = await addDoc(collection(db, "users", uid, "files"), {
      fileName: fileName,
      filePath: filePath,
      fileUrl: downloadURL,
      fileSize: fileSize,
      advice: "",
      analyzed: false,
      createdAt: serverTimestamp()
    });

    const fileDocSnap = await getDoc(fileRef);

    if (fileDocSnap.exists()) {
      const data = fileDocSnap.data() as Omit<StoredFileInfo, 'id'>;
      const storedFileInfo: StoredFileInfo = {
        id: fileRef.id,
        ...data,
      };
      return storedFileInfo;
    } else {
      return new Error("No such document!");
    }
  } catch (e: any) {
    console.error("Error adding file document: ", e);
    return new Error("Failed to add file: " + e.message);
  }
}

export async function addAdvice(fileId: string, advice: string): Promise<void> {
  try {
    const uid = await getUserUid();
    const fileDocRef = doc(db, "users", uid, "files", fileId);
    await updateDoc(fileDocRef, {
      advice: advice,
      analyzed: true
    });
  } catch (e) {
    console.error("Error updating file document: ", e);
  }
}

export async function getAllFilesInfoFromFirebase(): Promise<StoredFileInfo[]> {
  try {
    const uid = await getUserUid()
    const filesCollectionRef = collection(db, "users", uid, "files");
    const querySnapshot = await getDocs(filesCollectionRef);
    const files: StoredFileInfo[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<StoredFileInfo, 'id'>;
      const storedFileInfo: StoredFileInfo = {
        id: doc.id,
        ...data,
      };
      files.push(storedFileInfo);
    });

    return files;
  } catch (e) {
    console.error("Error getting files: ", e);
    return [];
  }
}

export async function deleteFileInfoFromFirebase(fileId: string) {
  const uid = await getUserUid()
  const fileDocRef = doc(db, "users", uid, "files", fileId);
  
  if (fileDocRef) {
    await deleteDoc(fileDocRef);
  }  
}

export async function getUrlAndName(fileId: string): Promise<[string | null, string | null]> {
  try {
    const uid = await getUserUid(); 
    const fileDocRef = doc(db, "users", uid, "files", fileId); // ドキュメント参照を取得
    const fileDocSnap = await getDoc(fileDocRef); // ドキュメントを取得
    const fileData = fileDocSnap.data();

    if (fileData) {
      return [fileData.fileUrl || null, fileData.fileName || null]
    } else {
      console.warn("No such file document!");
      return [null, null];
    }
  } catch (error) {
    console.error("Error fetching file info:", error);
    return [null, null];    
  }
}

export async function getFileFromStorage(fileId: string): Promise<File | null> {
  try {
    const [url, name] = await getUrlAndName(fileId);
    if (!url) return null;

    // ダウンロードURLからPDFファイルを取得
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // レスポンスを Blob に変換
    const blob = await response.blob();

    // Blob を File に変換して返却
    const fileName = name || "downloaded.pdf"; // ファイル名を取得（デフォルトは downloaded.pdf）
    const file = new File([blob], fileName, { type: "application/pdf" });
    return file;
  } catch (error) {
    console.error("Error fetching PDF file:", error);
    throw error;
  }
}

export async function addTranscription(
  pdf_id: string,
  page: string,
  transcription: string,  
) {
  try {
    const uid = await getUserUid();
    const docRef = doc(
      db, 
      "users", uid, 
      "files", pdf_id,
      "transcription", page
    ); 

    await setDoc(docRef, {
      text: transcription,
      createdAt: serverTimestamp()
    })
    const fileDocSnap = await getDoc(docRef);

    if (fileDocSnap.exists()) {
      return "success"; // 本当ならここで意味のある値を返す
    } else {
      return new Error("No such document!");
    }
  } catch (e: any) {
    console.error("Error adding file document: ", e);
    return new Error("Failed to add file: " + e.message);
  }
}


export async function getTranscription(pdf_id: string, page: string): Promise<string | null> {
  try {
    const uid = await getUserUid();
    const docRef = doc(
      db, 
      "users", uid, 
      "files", pdf_id,
      "transcription", page
    );

    const fileDocSnap = await getDoc(docRef);

    if (fileDocSnap.exists()) {
      const data = fileDocSnap.data();
      return data.text || null;
    } else {
      console.warn("No transcription found for the given page.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching transcription:", error);
    throw error;
  }
}
