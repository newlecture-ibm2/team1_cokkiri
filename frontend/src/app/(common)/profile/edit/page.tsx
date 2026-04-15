import { Metadata } from "next";
import { ProfileEditForm } from "./_components/profile-edit-form";

export const metadata: Metadata = {
  title: "프로필 수정 | CoKkiri",
};

export default function ProfileEditPage() {
  return (
    <div className="mx-auto max-w-xl py-12 md:py-24 px-6 md:px-0">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-primary mb-4">
          Edit Profile<span className="text-accent">.</span>
        </h2>
        <p className="text-base text-primary/80 font-medium tracking-tight whitespace-nowrap">
          개인 정보를 안전하게 <strong className="text-primary font-bold">수정하고 관리</strong>할 수 있습니다.
        </p>
      </div>

      <ProfileEditForm />
    </div>
  );
}
