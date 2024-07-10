'use client';
import { LogInForm } from '@/app/Components/Form/LogInForm';
import { useLogInForm } from './use-log-in-form';

export default function Home() {
  const { isLoading, logIn } = useLogInForm();

  return (
    <main>
      <h1>Log In</h1>
      <LogInForm onSubmit={logIn} isLoading={ isLoading } />
      <div> <a href="/mypage">mypage</a> </div>
      <div><a href="/signup">signup</a> </div>
    </main>
  );
}