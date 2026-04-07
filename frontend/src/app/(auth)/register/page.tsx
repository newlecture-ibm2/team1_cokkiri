import RegisterForm from './_components/register-form';

export default function RegisterPage() {
  return (
    <div className="flex bg-background items-center justify-center py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-[12vw] md:text-[6vw] font-black tracking-tighter uppercase leading-[0.85] text-primary mb-12">
          JOIN <br /> US
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
}
