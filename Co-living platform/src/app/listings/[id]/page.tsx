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
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white tracking-tighter mb-4 leading-[0.85] max-w-[95%] md:max-w-[80%]">
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
      <section className="px-6 py-16 md:px-12 lg:px-24 md:py-32">
        <div className="mx-auto max-w-[1200px] space-y-32">
          <div className="space-y-20">
            {/* Status & Intro */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge
                  className={cn(
                    "px-6 py-2.5 text-xs md:text-sm font-black tracking-[0.2em] uppercase rounded-full border",
                    listing.status === "AVAILABLE"
                      ? "bg-[#768064]/10 text-[#768064] border-[#768064]/20"
                      : listing.status === "OCCUPIED"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-yellow-50 text-yellow-600 border-yellow-100"
                  )}
                >
                  {listing.status === "AVAILABLE"
                    ? "계약 가능"
                    : listing.status === "OCCUPIED"
                      ? "입주 중"
                      : "점검 중"}
                </Badge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-[#2C3424] mb-6 md:mb-10 leading-[1.1] break-keep">
                  도시의 중심에서 누리는 진정한 휴식의 공간.
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium text-[#2C3424]/70 text-balance italic">
                  &ldquo;{listing.description}&rdquo;
                </p>
              </motion.div>
            </div>

            <Separator className="bg-[#2C3424]/10" />

            {/* Room Details Grid */}
            <div className="space-y-12">
              <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
                Space Information
              </h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
                {[
                  { label: "호실명", value: listing.title },
                  { label: "방 유형", value: listing.roomType },
                  { label: "층", value: listing.floor },
                  { label: "면적", value: listing.size },
                  { label: "방 수 / 욕실 수", value: `${listing.rooms}개 / ${listing.bathrooms}개` },
                  { label: "수용 가능 인원", value: `${listing.maxCapacity}명` },
                  { label: "방향", value: listing.direction },
                  { label: "주차 가능 여부", value: listing.parking ? "가능" : "불가능" },
                  { label: "계약 상태", value: listing.status === "AVAILABLE" ? "가능" : "불가" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "p-4 md:p-6 rounded-2xl bg-[#2C3424]/[0.02] border border-[#2C3424]/[0.05] space-y-1 md:space-y-2",
                      item.label === "호실명" ? "col-span-2 lg:col-span-1" : "col-span-1"
                    )}
                  >
                    <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase opacity-20 block">
                      {item.label}
                    </span>
                    <span className="text-sm md:text-base font-bold text-[#2C3424] block leading-tight">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-[#2C3424]/10" />

            {/* Pricing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
              <div className="space-y-12">
                <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
                  Pricing Details
                </h3>
                <div className="space-y-6">
                  {[
                    { label: "보증금", value: `₩${listing.deposit.toLocaleString()}` },
                    { label: "월 임대료", value: `₩${listing.price.toLocaleString()}` },
                    { label: "관리비", value: `₩${listing.maintenanceFee.toLocaleString()} / 월` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-baseline group">
                      <span className="text-base md:text-lg lg:text-xl font-bold tracking-tight text-[#2C3424]/50">
                        {item.label}
                      </span>
                      <div className="flex-1 mx-4 border-b border-dotted border-[#2C3424]/20" />
                      <span className="text-lg md:text-xl lg:text-3xl font-black text-[#2C3424]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities & Features */}
              <div className="space-y-12">
                <h3 className="text-sm md:text-base font-black tracking-[0.3em] uppercase opacity-30">
                  Amenities & Atmosphere
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[...listing.amenities, ...listing.features].map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="px-4 py-2 border-[#2C3424]/10 bg-[#DADED8]/50 text-[#2C3424] font-bold text-xs rounded-full"
                    >
                      {amenityMap[item] || item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reserve CTA Section */}
          <motion.div
            className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-[#2C3424] p-6 md:p-16 text-white"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm md:text-base font-black tracking-[0.4em] uppercase opacity-50 mb-4">Make it Yours</h3>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                    이 특별한 공간의<br />새로운 주인공이 되세요.
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-12 gap-y-6 pt-4">
                  <div className="space-y-1">
                    <span className="text-xs md:text-sm font-bold tracking-widest uppercase opacity-40 block">Total Monthly</span>
                    <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">₩{(listing.price + listing.maintenanceFee).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs md:text-sm font-bold tracking-widest uppercase opacity-40 block">Deposit</span>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold opacity-70">₩{listing.deposit.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                disabled={listing.status !== "AVAILABLE"}
                variant="editorial"
                size="xl"
                className="group text-sm md:text-base font-black tracking-widest transition-all hover:scale-105"
              >
                {listing.status === "AVAILABLE" ? "\u00A0Apply Now" : "Fully Booked"}
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
