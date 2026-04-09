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
