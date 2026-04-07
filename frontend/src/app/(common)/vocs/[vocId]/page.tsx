import { redirect } from "next/navigation";

type Params = Promise<{ vocId: string }>;

export default async function LegacyVocDetailRedirect({ params }: { params: Params }) {
  const { vocId } = await params;
  redirect(`/profile/vocs/${vocId}`);
}
