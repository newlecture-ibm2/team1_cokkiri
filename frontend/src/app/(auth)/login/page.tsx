import Link from 'next/link';

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">로그인</h1>
      <p className="mt-2 text-muted-foreground">계정에 로그인하세요.</p>
      
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground mb-4">아직 계정이 없으신가요?</p>
        <Link 
          href="/register" 
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          회원가입 하러가기
        </Link>
      </div>
    </div>
  );
}
