// app/signup/page.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import firebase_app from "../../../firebase-config";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, validatePassword } from 'firebase/auth';
import { FirebaseError } from '@firebase/util'



export default function SignUpPage() {
  const auth = getAuth(firebase_app);

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<FirebaseError|undefined>(undefined);

  // Googleでサインアップ
  const signUpWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google sign-up success:', user);
      router.push('/mypage');
    } catch (error) {
      if (error instanceof FirebaseError) {
        setError(error);
      }
    }
  };

  // メール・パスワードでサインアップ
  const signUpWithEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      router.push('/mypage'); 
    } catch (error) {
      if (error instanceof FirebaseError) {
        setError(error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-center text-gray-900">Sign Up</h2>

        <button
          className="w-full rounded-md flex items-center justify-center border border-slate-300 py-3 px-6 text-center text-base transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          type="button"
          onClick={signUpWithGoogle}
        >
          <img
            src="https://docs.material-tailwind.com/icons/google.svg"
            alt="Google"
            className="h-6 w-6 mr-3"
          />
          Continue with Google
        </button>

        <form onSubmit={signUpWithEmail} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Sign up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
        </p>

        {error && <p className="text-red-500 text-center mt-4">{error.message}</p>}
      </div>
    </div>
  );
}
