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
    features: ["Quiet Environment", "Natural Light", "Curated Furniture"],
    images: [
      "https://images.unsplash.com/photo-1707968781591-59ff287a54c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwY28tbGl2aW5nJTIwaW50ZXJpb3IlMjBhcmNoaXRlY3R1cmUlMjBoaWdoLWVuZCUyMGRlc2lnbnxlbnwxfHx8fDE3NzQ5Mzc2Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1760072513376-67a46aab0fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc0NDg3Nzk0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    description: "A sanctuary designed for focus and tranquility. Located in the heart of Gangnam, this space offers a retreat from the urban bustle with its soft neutral tones and architectural precision.",
    rating: 4.9,
    reviewCount: 42,
    host: {
      name: "Min-su Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinsuKim",
      joinedDate: "2024-01"
    }
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
    amenities: ["Fiber WiFi", "Shared Lounge", "Chef's Kitchen", "AC", "Private Patio", "24/7 Concierge"],
    floor: "12층",
    size: "45.0㎡",
    rooms: 2,
    bathrooms: 1,
    parking: true,
    features: ["High Ceilings", "City View", "Smart Home"],
    images: [
      "https://images.unsplash.com/photo-1772475385426-ebd50c772229?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaXNsYW5kJTIwbWluaW1hbCUyMGRlc2lnbiUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzQ5Mzc2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1652961221362-4ea2d7af5b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjby1saXZpbmclMjBsb3VuZ2UlMjBhcmVhJTIwY29udGVtcG9yYXJ5JTIwc3R5bGUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc0OTM3NjgwfDA&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    description: "Experience the pinnacle of urban living. This loft in Hannam features soaring ceilings and an open-plan layout that encourages creativity and social connection.",
    rating: 5.0,
    reviewCount: 12,
    host: {
      name: "Seo-yeon Lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SeoyeonLee",
      joinedDate: "2023-11"
    }
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
    features: ["Community Events", "Workshop Access", "Vibrant Neighborhood"],
    images: [
      "https://images.unsplash.com/photo-1758448500688-3ababa93fd67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3dvcmtpbmclMjBzcGFjZSUyMGxvdW5nZXxlbnwxfHx8fDE3NzQ0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1652961221362-4ea2d7af5b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjby1saXZpbmclMjBsb3VuZ2UlMjBhcmVhJTIwY29udGVtcG9yYXJ5JTIwc3R5bGUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc0OTM3NjgwfDA&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    description: "Located in the Brooklyn of Seoul, The Creative Hub is more than a home. It's a community of makers, thinkers, and innovators living under one beautifully designed roof.",
    rating: 4.8,
    reviewCount: 56,
    host: {
      name: "Jun-ho Park",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JunhoPark",
      joinedDate: "2023-06"
    }
  }
];
