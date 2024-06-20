'use client';
import { SignUpForm } from '@/app/components/Form/SignUpForm';
import { useSignUpForm } from './use-sign-up-form';

export default function Home() {
  const { isLoading, signUp } = useSignUpForm();

  return (
    <main>
      <h1>Sign Up</h1>
      <SignUpForm onSubmit={signUp} isLoading={ isLoading } />
    </main>
  );
}