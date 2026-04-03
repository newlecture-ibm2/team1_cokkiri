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
  roomType?: string;
  roomCount?: number;
  bathroomCount?: number;
  direction?: string;
  deposit?: number;
  monthlyRent?: number;
  maintenanceFee?: number;
  parkingAvailable?: boolean;
  thumbnailUrl?: string;
  images?: SpaceImageDTO[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface RoomFilterParams {
  roomType?: string;
  minRent?: number;
  maxRent?: number;
  floor?: number;
  page?: number;
  size?: number;
}
