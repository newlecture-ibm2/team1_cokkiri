import { apiFetch } from '@/lib/api';

export interface CommonSpaceImage {
  spaceImageId: number;
  imageUrl: string;
  imageType: string;
  sortOrder: number;
  isThumbnail: boolean;
}

export interface CommonSpaceDto {
  spaceId: number;
  name: string;
  status: string;
  floor: number;
  area: number;
  description: string;
  amenities: string[];
  maxCapacity: number;
  operatingHours: string;
  isReservable: boolean;
  usageFee: number;
  thumbnailUrl: string | null;
  images: CommonSpaceImage[];
}

export async function fetchCommonSpaces(): Promise<CommonSpaceDto[]> {
  const res = await apiFetch<CommonSpaceDto[]>('/experience');
  return res.data ?? [];
}

export async function fetchCommonSpace(spaceId: number): Promise<CommonSpaceDto> {
  const res = await apiFetch<CommonSpaceDto>(`/experience/${spaceId}`);
  if (!res.data) throw new Error('Facility not found');
  return res.data;
}
