"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MapPin,
  Users,
  Calendar as LucideCalendar,
  Wifi,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import { format } from "date-fns";
import { cn } from "../../components/ui/utils";
import { Separator } from "../../components/ui/separator";
import { listings } from "../../data/mockData";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { toast } from "sonner";

const amenityMap: Record<string, string> = {
  "Fiber WiFi": "초고속 와이파이",
  "Washing Machine": "세탁기",
  Kitchen: "주방",
  "Chef's Kitchen": "셰프급 주방",
  AC: "에어컨",
  "Ergonomic Desk": "사무용 책상",
  "King Bed": "킹사이즈 침대",
  "Shared Lounge": "공유 라운지",
  "Private Patio": "개인 테라스",
  "24/7 Concierge": "24시 컨시어지",
  "Studio Space": "스튜디오 공간",
  Library: "서재",
  "Roof Garden": "옥상 정원",
  "Coffee Bar": "커피 바",
};

export default function ListingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const listing = listings.find((l) => l.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!listing) return null;

  const handleBooking = () => {
    toast.success("Booking request sent! Our concierge will contact you shortly.");
  };

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-[#2C3424] selection:text-[#DADED8]">
      <Header />

      {/* Hero Image */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-black">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <ImageWithFallback
            src={listing.images[selectedImage]}
            alt={listing.title}
            className="h-full w-full object-cover opacity-80"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute right-0 bottom-0 left-0 p-6 md:p-12 lg:p-24">
          <div className="mx-auto max-w-[1400px]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Link
                href="/listings"
                className="group mb-8 inline-flex items-center gap-2 text-white/90 drop-shadow-lg transition-all hover:text-white"
              >
                <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium tracking-[0.1em] uppercase">
                  Return to Spaces
                </span>
              </Link>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 leading-[0.9] max-w-[80%] md:max-w-[70%]">
                {listing.title}
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Image Nav (Desktop Only) */}
        <div className="hidden md:flex absolute right-6 bottom-12 flex-col gap-4">
          {listing.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${selectedImage === i ? "scale-110 border-white" : "border-transparent opacity-50 hover:opacity-100"
                }`}
            >
              <ImageWithFallback src={img} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* Image Nav — Mobile Only */}
      <div className="flex md:hidden items-center justify-center gap-3 px-6 py-6 border-b border-[#2C3424]/05">
        {listing.images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(i)}
            className={`overflow-hidden rounded-xl border-2 h-14 w-14 ${selectedImage === i ? "scale-105 border-[#2C3424]" : "border-transparent opacity-40 hover:opacity-100"
              }`}
          >
            <ImageWithFallback src={img} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Content Section */}
      <section className="px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-24 lg:grid-cols-12 lg:gap-32">
          <div className="space-y-16 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-lg font-black tracking-tighter uppercase opacity-40">
                The Concept
              </h2>
              <p className="text-base leading-relaxed font-medium tracking-tight opacity-60 text-balance break-words md:text-lg lg:text-xl">
                COKKIRI는 스마트 IoT 기술과 공동체의 따뜻함이 공존하는 새로운 주거 기준을 제시합니다.
              </p>
            </motion.div>

            <Separator className="bg-[#2C3424]/05" />

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-lg font-black tracking-tighter uppercase opacity-40">
                  Amenities
                </h3>
                <ul className="grid grid-cols-1 gap-4">
                  {listing.amenities.map((item) => (
                    <li key={item} className="group flex items-center gap-4">
                      <div className="bg-[#2C3424]/05 flex h-4 w-4 items-center justify-center rounded-full transition-all group-hover:bg-[#768064] group-hover:text-white">
                        <Plus className="h-2.5 w-2.5" />
                      </div>
                      <span className="text-sm font-black tracking-tight opacity-70 group-hover:opacity-100">
                        {amenityMap[item] || item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black tracking-tighter uppercase opacity-40">
                  Details
                </h3>
                <div className="space-y-8">
                  <div className="border-[#2C3424]/05 flex justify-between border-b pb-4">
                    <span className="text-sm font-bold tracking-widest uppercase opacity-40">평형</span>
                    <span className="text-sm font-bold">{listing.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Sticky */}
          <div className="lg:col-span-5">
            <motion.div
              className="sticky top-32 rounded-[25rem] border border-white/5 bg-[#0F120D] p-6 text-[#DADED8] md:p-12"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-8 flex items-baseline justify-between">
                <h3 className="text-xl md:text-2xl font-black tracking-tighter">Reserve</h3>
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-black text-white">₩{listing.price.toLocaleString()}</p>
                </div>
              </div>
              <Button
                onClick={handleBooking}
                className="group h-16 md:h-20 w-full rounded-2xl border-none bg-[#768064] text-sm md:text-xl font-black tracking-[0.2em] text-white uppercase"
              >
                BOOKING
                <ArrowRight className="ml-3 h-5 w-5 md:ml-4 md:h-8 md:w-8 transition-transform group-hover:translate-x-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
