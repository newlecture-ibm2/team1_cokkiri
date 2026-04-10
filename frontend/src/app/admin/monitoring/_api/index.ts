import { apiFetch } from "@/lib/api";
import type { DeviceErrorStats, EnergyStatsResponse, ControlLogPage, SpaceOption } from "../_types";

export async function fetchDeviceErrors() {
  return apiFetch<DeviceErrorStats[]>("/admin/monitoring/errors");
}

export async function fetchEnergyStats() {
  return apiFetch<EnergyStatsResponse>("/admin/monitoring/energy");
}

export async function fetchControlLogs(params: {
  spaceId?: number;
  result?: string;
  p?: number;
  s?: number;
}) {
  const query = new URLSearchParams();
  if (params.spaceId) query.set("spaceId", String(params.spaceId));
  if (params.result) query.set("result", params.result);
  query.set("p", String(params.p ?? 0));
  query.set("s", String(params.s ?? 15));
  const res = await apiFetch<ControlLogPage>(`/admin/control-logs?${query.toString()}`);
  return res.data;
}

export async function fetchSpaces(): Promise<SpaceOption[]> {
  const res = await apiFetch<{ content: Array<{ spaceId: number; name: string; type: string }> }>("/admin/spaces?p=0&s=200");
  if (!res.data?.content) return [];
  return res.data.content.map((s) => ({
    spaceId: s.spaceId,
    name: s.name,
    type: s.type as "PRIVATE" | "COMMON",
  }));
}
