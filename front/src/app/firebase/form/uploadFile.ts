import firebase_app from "../../../../firebase-config";
import { getStorage, ref, uploadBytesResumable, deleteObject, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getUserUid } from "../utils/auth"

const storage = getStorage(firebase_app);

const validateFile = (file: File): void => {
    const MAX_FILE_SIZE = 20 * 1024 * 1024; 
    const ALLOWED_FILE_TYPES = ['application/pdf']; 

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('File type is not allowed. Only PDF files are supported.');
    }
};


export async function uploadFile(file: File): Promise<[string, string]> {
    try {
        const uid = await getUserUid()

        validateFile(file);

        const filePath = `uploads/${uid}/${uuidv4()}-${file.name}`;
        const storageRef = ref(storage, filePath);

        const metadata = {
            contentType: 'application/pdf',
            customMetadata: { ownerUid: uid },
        };
        const data = await file.arrayBuffer();
        const uploadTask = uploadBytesResumable(storageRef, data, metadata);

        return new Promise<[string, string]>((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                null,  // snapshot
                (error) => {
                    console.error('Upload failed:', error);
                    reject('File upload failed');
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve([filePath, downloadURL]);
                    } catch (error) {
                        reject('Failed to get download URL');
                    }
                }
            );
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Internal Server Error');
    }
}

export async function deleteFileFromFirebase(filePath: string) {
    try {
        const uid = await getUserUid()
        const fileName = filePath.split('/')[2];
        const fileRef = ref(storage, `uploads/${uid}/${fileName}`);

        await deleteObject(fileRef);
    } catch (error) {
        console.error("Error deleting file: ", error);
        throw new Error('Failed to delete file from storage');
    }
}
