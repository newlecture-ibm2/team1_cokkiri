import { apiFetch } from "@/lib/api";
import type { DeviceErrorStats, EnergyStatsResponse } from "../_types";

export async function fetchDeviceErrors() {
  return apiFetch<DeviceErrorStats[]>("/admin/monitoring/errors");
}

export async function fetchEnergyStats() {
  return apiFetch<EnergyStatsResponse>("/admin/monitoring/energy");
}
