import Link from 'next/link';
import LoginForm from './_components/LoginForm';

export default function LoginPage() {
  return (
    <div className="py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto min-h-screen flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-[12vw] md:text-[8vw] lg:text-5xl font-black tracking-tighter uppercase leading-[0.85] text-primary">
          <span className="underline underline-offset-[1vw] decoration-accent">로그인</span>
        </h1>
        <p className="mt-6 text-muted font-medium tracking-tight text-balance">
          COKKIRI에 다시 오신 것을 환영합니다.
        </p>
        
        <LoginForm />
        
        <div className="mt-12 pt-6 border-t border-secondary/30 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-4">아직 계정이 없으신가요?</p>
          <Link 
            href="/register" 
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-primary text-primary font-black tracking-tighter hover:bg-primary/5 transition-colors"
          >
            회원가입 하러가기
          </Link>
        </div>
      </div>
    </div>
  );
}
