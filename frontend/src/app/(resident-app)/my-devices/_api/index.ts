import { apiFetch } from "@/lib/api";
import type {
  MyDevice,
  ControlDeviceRequest,
  ControlDeviceResponse,
} from "../_types";

export async function fetchMyDevices() {
  return apiFetch<MyDevice[]>("/devices/my");
}

export async function controlDevice(
  deviceId: number,
  data: ControlDeviceRequest
) {
  return apiFetch<ControlDeviceResponse>(`/devices/${deviceId}/control`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
