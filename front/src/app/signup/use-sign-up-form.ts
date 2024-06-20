'use client';
import { useState } from 'react';
import { FormValuesType } from '@/app/types/form-value.type';

export const useSignUpForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const signUp = async (data: FormValuesType) => {
        console.log(data);
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/signup', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch {
            console.log('an error has occured')
        } finally {
            setIsLoading(false);
        }
   };

   return { isLoading, signUp };
};