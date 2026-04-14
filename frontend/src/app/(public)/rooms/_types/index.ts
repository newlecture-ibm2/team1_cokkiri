export interface SpaceImageDTO {
  spaceImageId: number;
  imageUrl: string;
  imageType: 'PHOTO' | 'FLOOR_PLAN';
  sortOrder: number;
  isThumbnail: boolean;
}

export interface RoomDTO {
  spaceId: number;
  name: string;
  status: string;
  floor?: number;
  area?: number;
  description?: string;
  amenities: string[];
  roomTypeId?: number;
  roomTypeName?: string;
  roomCount?: number;
  bathroomCount?: number;
  direction?: string;
  deposit?: number;
  monthlyRent?: number;
  maintenanceFee?: number;
  parkingAvailable?: boolean;
  thumbnailUrl?: string;
  images?: SpaceImageDTO[];
  contractEndDate?: string; // OCCUPIED일 때 현재 계약 종료일 (yyyy-MM-dd)
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface RoomFilterParams {
  keyword?: string;
  roomTypeId?: number;
  minRent?: number;
  maxRent?: number;
  floor?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface RoomTypeOption {
  roomTypeId: number;
  code: string;
  name: string;
}
