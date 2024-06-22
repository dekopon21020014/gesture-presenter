'use client';
import { useRouter  } from 'next/navigation';
import { useState } from 'react';
import { FormValuesType } from '@/app/types/form-value.type';

export const useSignUpForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const signUp = async (data: FormValuesType) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/signup', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // cookieを受け取るために必要
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const jsonData = await response.json();
                console.log(jsonData)
                router.push('/mypage')
            } else {
                throw new Error();
            }
        } catch {
            console.log('an error has occured')
        } finally {
            setIsLoading(false);
        }
   };

   return { isLoading, signUp };
};