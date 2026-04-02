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
  roomType?: string;
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
  
  // Images
  images?: {
    imageUrl: string;
    imageType: string;
    isThumbnail: boolean;
  }[];
}

export const fetchSpaces = async () => {
  const res = await fetch('/api/bff/admin/spaces');
  if (!res.ok) throw new Error('Failed to fetch spaces');
  return res.json();
};

export const createSpace = async (data: SpaceDTO) => {
  const res = await fetch('/api/bff/admin/spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create space');
  return res.json();
};

export const uploadSpaceImage = async (spaceId: number, file: File, isThumbnail: boolean = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('imageType', 'PHOTO');
  formData.append('isThumbnail', String(isThumbnail));

  const res = await fetch(`/api/bff/admin/spaces/${spaceId}/images`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
};
