import { apiFetch } from "@/lib/api";
import type { ControlLogPage, ControlLogFilters, DeviceTypeOption } from "../_types";

export async function fetchMyControlLogs(
  filters: ControlLogFilters = {},
  page: number = 0,
  size: number = 20
) {
  const params = new URLSearchParams();
  params.set("p", String(page));
  params.set("s", String(size));

  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.spaceType) params.set("spaceType", filters.spaceType);
  if (filters.deviceTypeCode) params.set("deviceTypeCode", filters.deviceTypeCode);
  if (filters.result) params.set("result", filters.result);

  return apiFetch<ControlLogPage>(`/control-logs/my?${params.toString()}`);
}

export async function fetchDeviceTypes() {
  return apiFetch<DeviceTypeOption[]>("/control-logs/device-types");
}
