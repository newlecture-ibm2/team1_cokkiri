import { apiFetch } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface RoomTypeDTO {
  roomTypeId: number;
  code: string;
  name: string;
  isSystemDefault: boolean;
}

export interface SpaceDTO {
  spaceId?: number;
  name: string;
  type: 'PRIVATE' | 'COMMON';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  floor?: number;
  area?: number;
  description?: string;
  amenities: string[];

  // Private Detail
  roomTypeId?: number;
  roomTypeName?: string;
  roomCount?: number;
  bathroomCount?: number;
  direction?: string;
  deposit?: number;
  monthlyRent?: number;
  maintenanceFee?: number;
  parkingAvailable?: boolean;

  // Common Detail
  maxCapacity?: number;
  operatingHours?: string;
  isReservable?: boolean;
  usageFee?: number;
  // Position (평면도 배치용)
  positionX?: number;
  positionY?: number;
  positionW?: number;
  positionH?: number;

  // Device Error (모니터링 오버레이용)
  hasDeviceError?: boolean;

  // Images
  images?: {
    spaceImageId?: number;
    imageUrl: string;
    imageType: string;
    isThumbnail: boolean;
  }[];
}

/** 응답의 중첩 구조에서 roomTypeName 안전 추출 */
export function extractRoomTypeName(space: SpaceDTO): string | undefined {
  // Backend 응답이 중첩 구조(privateDetail.roomTypeName)인 경우 대응
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nested = (space as any).privateDetail as
    | { roomTypeName?: string }
    | undefined;
  return space.roomTypeName || nested?.roomTypeName;
}

export const fetchSpaces = async (params?: { type?: string; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.type && params.type !== 'ALL') query.append('type', params.type);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  
  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await apiFetch<any>(`/admin/spaces${queryString}`);
  if (res.data?.content) {
    res.data.content = res.data.content.map((s: any) => ({
      ...s,
      ...(s.privateDetail || {}),
      ...(s.commonDetail || {})
    }));
  }
  return res;
};

export const updateSpaceLayout = async (
  positions: { spaceId: number; positionX: number; positionY: number; positionW?: number; positionH?: number }[],
) => {
  return await apiFetch<void>('/admin/spaces/layout', {
    method: 'PUT',
    body: JSON.stringify({ positions }),
  });
};

export const createSpace = async (data: SpaceDTO & Record<string, any>) => {
  const { 
    spaceId, roomTypeName, images, 
    privateDetail, commonDetail, positionX, positionY, 
    ...payload 
  } = data;
  return await apiFetch<any>('/admin/spaces', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const uploadSpaceImage = async (spaceId: number, file: File, isThumbnail: boolean = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('imageType', 'PHOTO');
  formData.append('isThumbnail', String(isThumbnail));

  const res = await fetch(`/api/admin/spaces/${spaceId}/images`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
};

export const fetchSpace = async (spaceId: number) => {
  const res = await apiFetch<any>(`/admin/spaces/${spaceId}`);
  if (res.data) {
    res.data = {
      ...res.data,
      ...(res.data.privateDetail || {}),
      ...(res.data.commonDetail || {})
    };
  }
  return res as ApiResponse<SpaceDTO>;
};

export const updateSpace = async (spaceId: number, data: Partial<SpaceDTO> & Record<string, any>) => {
  const { 
    spaceId: _id, type, roomTypeName, images, 
    privateDetail, commonDetail, positionX, positionY, 
    ...payload 
  } = data;
  return await apiFetch<any>(`/admin/spaces/${spaceId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteSpace = async (spaceId: number) => {
  return await apiFetch<any>(`/admin/spaces/${spaceId}`, {
    method: 'DELETE',
  });
};

export const deleteSpaceImage = async (spaceId: number, imageId: number) => {
  return await apiFetch<any>(`/admin/spaces/${spaceId}/images/${imageId}`, {
    method: 'DELETE',
  });
};

// ===== Room Type (방 유형) API =====

export const fetchRoomTypes = async (): Promise<ApiResponse<RoomTypeDTO[]>> => {
  return await apiFetch<RoomTypeDTO[]>('/admin/room-types');
};

export const createRoomType = async (data: { code: string; name: string }) => {
  return await apiFetch<any>('/admin/room-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateRoomType = async (roomTypeId: number, data: { name: string }) => {
  return await apiFetch<any>(`/admin/room-types/${roomTypeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteRoomType = async (roomTypeId: number) => {
  return await apiFetch<any>(`/admin/room-types/${roomTypeId}`, {
    method: 'DELETE',
  });
};

// ===== Floor Plan (평면도 배경/어노테이션) API =====

import type { FloorPlanData, FloorAnnotation } from '../_types/layout';

export const fetchFloorPlan = async (floor: number): Promise<ApiResponse<FloorPlanData>> => {
  return await apiFetch<FloorPlanData>(`/admin/floors/${floor}/plan`);
};

export const updateFloorPlan = async (
  floor: number,
  data: { blueprintOpacity: number; annotations: FloorAnnotation[] }
) => {
  return await apiFetch<FloorPlanData>(`/admin/floors/${floor}/plan`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const uploadBlueprint = async (floor: number, file: File): Promise<ApiResponse<FloorPlanData>> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/admin/floors/${floor}/plan/blueprint`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to upload blueprint');
  return res.json();
};

export const deleteBlueprint = async (floor: number) => {
  return await apiFetch<void>(`/admin/floors/${floor}/plan/blueprint`, {
    method: 'DELETE',
  });
};

// ===== Annotation Type (어노테이션 유형) API =====

import type { AnnotationType } from '../_types/layout';

export const fetchAnnotationTypes = async (): Promise<ApiResponse<AnnotationType[]>> => {
  return await apiFetch<AnnotationType[]>('/admin/annotation-types');
};

export const createAnnotationType = async (data: { code: string; name: string; iconName: string; defaultColor?: string }) => {
  return await apiFetch<AnnotationType>('/admin/annotation-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateAnnotationType = async (id: number, data: { name: string; iconName: string; defaultColor?: string }) => {
  return await apiFetch<AnnotationType>(`/admin/annotation-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteAnnotationType = async (id: number) => {
  return await apiFetch<void>(`/admin/annotation-types/${id}`, {
    method: 'DELETE',
  });
};
