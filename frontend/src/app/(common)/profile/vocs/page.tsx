import { redirect } from "next/navigation";

type SearchParams = Promise<{ tab?: string; p?: string; s?: string }>;

export default async function LegacyProfileVocsRedirect({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.tab) params.set("tab", sp.tab);
  if (sp.p) params.set("p", sp.p);
  if (sp.s) params.set("s", sp.s);
  const qs = params.toString();
  redirect(`/vocs${qs ? `?${qs}` : ""}`);
}
