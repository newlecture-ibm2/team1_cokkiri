import { Suspense } from "react";
import ContractApplyForm from "./_components/ContractApplyForm";

export default function ContractApplyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">계약 신청</h1>
        <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto italic">
          꿈꾸던 생활 공간에서의 조화로운 시작을 위해 신청서를 작성해주세요.
        </p>
      </div>

      <Suspense fallback={<div className="flex justify-center p-10"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <ContractApplyForm />
      </Suspense>
    </div>
  );
}
