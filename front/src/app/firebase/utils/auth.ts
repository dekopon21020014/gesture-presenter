import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function getUserUid() {
  const auth = getAuth();
  return new Promise<string>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error("User is not authenticated"));
      }
      unsubscribe();
    });
  });
}