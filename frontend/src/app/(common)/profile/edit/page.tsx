import { Metadata } from "next";
import { ProfileEditForm } from "./_components/profile-edit-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "프로필 수정 | CoKkiri",
};

export default function ProfileEditPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-24 py-12 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Title and Context */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="sticky top-32">
              <Link href="/profile" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary/50 hover:text-accent transition-colors mb-10 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Profile
              </Link>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight text-primary mb-6">
                Edit<br/>Profile<span className="text-accent relative inline-block">.<span className="absolute inset-0 bg-accent blur-md opacity-50 animate-pulse"></span></span>
              </h1>
              <p className="text-sm md:text-base text-primary/70 font-medium tracking-tight text-balance pr-4 leading-relaxed">
                Make it yours. Keep your information up to date to get the best out of <strong className="text-primary font-black">COKKIRI</strong>. Premium residence experiences start with you.
              </p>
            </div>
          </div>

          {/* Right Column: The Premium Form */}
          <div className="lg:col-span-8">
            <div className="bg-[#e8ebe6] md:bg-transparent rounded-3xl md:rounded-none p-6 md:p-0 border border-primary/5 md:border-none shadow-xl md:shadow-none">
               <ProfileEditForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
