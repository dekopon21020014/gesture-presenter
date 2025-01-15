'use client'
import firebase_app from "../../../../firebase-config";
import { getFirestore, collection, getDoc, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"; 
import { getUserUid } from "../utils/auth"
import { type StoredFileInfo } from '@/app/types/file-info.type'
import { Contrail_One } from "next/font/google";

type CreateFileData = {
  fileName: string;
  filePath: string;
  downloadURL: string;
};

const db = getFirestore(firebase_app);

export async function addFileInfo({ fileName, filePath, downloadURL }: CreateFileData): Promise<StoredFileInfo | Error> {
  try {
    const uid = await getUserUid()
    const fileRef = await addDoc(collection(db, "users", uid, "files"), {
      fileName: fileName,
      filePath: filePath,
      fileUrl: downloadURL,
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
    const uid = await getUserUid()
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