import { AuthForm } from '@/components/auth-form';
import App from '@/App';

export default function Home() {
  const isLoggedIn = false;

  return (
    <>
      {isLoggedIn ? (
        <App />
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center py-12">
          <AuthForm />
        </div>
      )}
    </>
  );
}
