import Link from 'next/link';
import RegisterForm from './_components/register-form';

export default function RegisterPage() {
  return (
    <div className="w-full">
      <div className="mb-14">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-primary mb-4">
          Create Account<span className="text-accent">.</span>
        </h2>
        <p className="text-base text-primary/70 font-medium tracking-tight">
          Already a member?{' '}
          <Link href="/login" className="text-primary font-bold underline decoration-accent underline-offset-4 hover:text-accent transition-colors">
            Log in here
          </Link>
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
