import { redirect } from "next/navigation";

export default function LegacyVocsIndexRedirect() {
  redirect("/profile/vocs");
}
