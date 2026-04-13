import { redirect } from "next/navigation";

export default function LegacyVocNewRedirect() {
  redirect("/vocs");
}
