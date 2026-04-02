export interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  priceUnit: string;
  roomType: string;
  capacity: number;
  availableFrom: string;
  amenities: string[];
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  floor: string;
  size: string;
  rooms: number;
  bathrooms: number;
  parking: boolean;
  deposit: number;
  maintenanceFee: number;
  direction: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  maxCapacity: number;
  host: {
    name: string;
    avatar: string;
    joinedDate: string;
  };
  features: string[];
}

export const listings: Listing[] = [
  {
    id: "1",
    title: "The Minimalist Sanctuary",
    location: "Gangnam, Seoul",
    price: 1250000,
    priceUnit: "month",
    roomType: "Private Suite",
    capacity: 1,
    availableFrom: "2026-04-01",
    amenities: ["Fiber WiFi", "Washing Machine", "Kitchen", "AC", "Ergonomic Desk", "King Bed"],
    floor: "3층",
    size: "25.0㎡",
    rooms: 1,
    bathrooms: 1,
    parking: true,
    deposit: 5000000,
    maintenanceFee: 100000,
    direction: "남향",
    status: "AVAILABLE" as const,
    maxCapacity: 1,
    features: ["조용한 환경", "풍부한 자연광", "큐레이팅된 가구"],
    images: [
      "https://images.unsplash.com/photo-1707968781591-59ff287a54c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwY28tbGl2aW5nJTIwaW50ZXJpb3IlMjBhcmNoaXRlY3R1cmUlMjBoaWdoLWVuZCUyMGRlc2lnbnxlbnwxfHx8fDE3NzQ5Mzc2Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1760072513376-67a46aab0fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc0NDg3Nzk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    description:
      "집중과 평온을 위해 설계된 안식처입니다. 강남의 중심부에 위치한 이 공간은 부드러운 중립 톤과 정교한 건축미를 통해 도시의 번잡함에서 벗어난 휴식을 제공합니다.",
    rating: 4.9,
    reviewCount: 42,
    host: {
      name: "Min-su Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinsuKim",
      joinedDate: "2024-01",
    },
  },
  {
    id: "2",
    title: "Architectural Loft",
    location: "Hannam, Seoul",
    price: 1850000,
    priceUnit: "month",
    roomType: "Entire Space",
    capacity: 2,
    availableFrom: "2026-04-15",
    amenities: [
      "Fiber WiFi",
      "Shared Lounge",
      "Chef's Kitchen",
      "AC",
      "Private Patio",
      "24/7 Concierge",
    ],
    floor: "12층",
    size: "45.0㎡",
    rooms: 2,
    bathrooms: 1,
    parking: true,
    deposit: 10000000,
    maintenanceFee: 150000,
    direction: "동향",
    status: "AVAILABLE" as const,
    maxCapacity: 2,
    features: ["높은 천장", "시티 뷰", "스마트 홈"],
    images: [
      "https://images.unsplash.com/photo-1772475385426-ebd50c772229?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaXNsYW5kJTIwbWluaW1hbCUyMGRlc2lnbiUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzQ5Mzc2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1652961221362-4ea2d7af5b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjby1saXZpbmclMjBsb3VuZ2UlMjBhcmVhJTIwY29udGVtcG9yYXJ5JTIwc3R5bGUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc0OTM3NjgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    description:
      "도시 생활의 정점을 경험해 보세요. 한남동에 위치한 이 로프트는 높은 천장과 개방형 구조를 통해 창의성과 사회적 연결을 장려합니다.",
    rating: 5.0,
    reviewCount: 12,
    host: {
      name: "Seo-yeon Lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SeoyeonLee",
      joinedDate: "2023-11",
    },
  },
  {
    id: "3",
    title: "The Creative Hub",
    location: "Seongsu, Seoul",
    price: 950000,
    priceUnit: "month",
    roomType: "Shared Atelier",
    capacity: 4,
    availableFrom: "2026-05-01",
    amenities: ["Fiber WiFi", "Studio Space", "Library", "Roof Garden", "Coffee Bar"],
    floor: "2층",
    size: "35.0㎡",
    rooms: 1,
    bathrooms: 2,
    parking: false,
    deposit: 3000000,
    maintenanceFee: 80000,
    direction: "서향",
    status: "OCCUPIED" as const,
    maxCapacity: 4,
    features: ["커뮤니티 이벤트", "워크숍 이용권", "활기찬 동네"],
    images: [
      "https://images.unsplash.com/photo-1758448500688-3ababa93fd67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZSUyMGxvdW5nZXxlbnwxfHx8fDE3NzQ0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1652961221362-4ea2d7af5b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjby1saXZpbmclMjBsb3VuZ2UlMjBhcmVhJTIwY29udGVtcG9yYXJ5JTIwc3R5bGUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc0OTM3NjgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    description:
      "서울의 브루클린에 위치한 The Creative Hub는 단순한 집 그 이상입니다. 이곳은 아름답게 디자인된 하나의 지붕 아래에서 제작자, 사색가, 혁신가들이 함께 생활하는 커뮤니티입니다.",
    rating: 4.8,
    reviewCount: 56,
    host: {
      name: "Jun-ho Park",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JunhoPark",
      joinedDate: "2023-06",
    },
  },
];
