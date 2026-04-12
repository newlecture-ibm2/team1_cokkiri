import { redirect } from "next/navigation";

type Params = Promise<{ vocId: string }>;

export default async function LegacyProfileVocEditRedirect({ params }: { params: Params }) {
  const { vocId } = await params;
  redirect(`/vocs/${vocId}/edit`);
}
