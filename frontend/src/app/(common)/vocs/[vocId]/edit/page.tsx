import { redirect } from "next/navigation";

type Params = Promise<{ vocId: string }>;

export default async function LegacyVocEditRedirect({ params }: { params: Params }) {
  const { vocId } = await params;
  redirect(`/profile/vocs/${vocId}/edit`);
}
