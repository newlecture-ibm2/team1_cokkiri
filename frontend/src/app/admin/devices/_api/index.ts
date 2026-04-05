import { apiFetch } from "@/lib/api";
import type { CreateDeviceRequest, CreateDeviceResponse, DeviceType, Space } from "../_types";

export async function createDevice(data: CreateDeviceRequest) {
  return apiFetch<CreateDeviceResponse>("/admin/devices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchDeviceTypes() {
  return apiFetch<DeviceType[]>("/admin/device-types");
}

export async function fetchSpaces() {
  return apiFetch<Space[]>("/admin/spaces?size=100");
}
