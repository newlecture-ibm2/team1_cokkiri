import { redirect } from "next/navigation";

type Params = Promise<{ vocId: string }>;

export default async function LegacyProfileVocDetailRedirect({ params }: { params: Params }) {
  const { vocId } = await params;
  redirect(`/vocs/${vocId}`);
}
