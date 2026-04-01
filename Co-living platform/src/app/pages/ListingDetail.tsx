import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
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
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";
import { cn } from "../components/ui/utils";
import { Separator } from "../components/ui/separator";
import { listings } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
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

export function ListingDetail() {
  const { id } = useParams();
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

      {/* Immersive Hero Image */}
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
                to="/listings"
                className="group mb-8 inline-flex items-center gap-2 text-white/90 drop-shadow-lg transition-all hover:text-white"
              >
                <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                <span
                  className="text-sm font-medium tracking-[0.1em] uppercase"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
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

      {/* Image Nav — Mobile Only (Dedicated Row) */}
      <div className="flex md:hidden items-center justify-center gap-3 px-6 py-6 border-b border-[#2C3424]/05">
        {listing.images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(i)}
            className={`overflow-hidden rounded-xl border-2 transition-all transition-all h-14 w-14 ${selectedImage === i ? "scale-105 border-[#2C3424]" : "border-transparent opacity-40 hover:opacity-100"
              }`}
          >
            <ImageWithFallback src={img} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Content Section */}
      <section className="px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-24 lg:grid-cols-12 lg:gap-32">
          {/* Left: Details */}
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
              <p
                className="text-base leading-relaxed font-medium tracking-tight opacity-60 text-balance break-words md:text-lg lg:text-xl"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                COKKIRI는 스마트 IoT 기술과
                <br />
                공동체의 따뜻함이 공존하는
                <br />
                새로운 주거 기준을 제시합니다.
                <br />
                <br />
                개인의 프라이버시를 존중하면서도 지능형 공유 공간을 통해
                자연스럽게 연결되는 특별한 일상을 경험해 보세요.
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
                      <div className="bg-[#2C3424]/05 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300 group-hover:bg-[#768064] group-hover:text-white">
                        <Plus className="h-2.5 w-2.5" />
                      </div>
                      <span
                        className="text-sm font-black tracking-tight opacity-70 transition-opacity group-hover:opacity-100"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
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
                    <span className="text-sm font-bold tracking-widest uppercase opacity-40">
                      방 유형
                    </span>
                    <span className="text-sm font-bold">
                      {listing.roomType === "Private Suite"
                        ? "개인 전용"
                        : listing.roomType === "Entire Space"
                          ? "전체 독립형"
                          : "공유 아틀리에"}
                    </span>
                  </div>
                  <div className="border-[#2C3424]/05 flex justify-between border-b pb-4">
                    <span className="text-sm font-bold tracking-widest uppercase opacity-40">
                      층
                    </span>
                    <span className="text-sm font-bold">{listing.floor}</span>
                  </div>
                  <div className="border-[#2C3424]/05 flex justify-between border-b pb-4">
                    <span className="text-sm font-bold tracking-widest uppercase opacity-40">
                      면적
                    </span>
                    <span className="text-sm font-bold">{listing.size}</span>
                  </div>
                  <div className="border-[#2C3424]/05 flex justify-between border-b pb-4">
                    <span className="text-sm font-bold tracking-widest uppercase opacity-40">
                      구조
                    </span>
                    <span className="text-sm font-bold">
                      방 {listing.rooms}개 / 욕실 {listing.bathrooms}개
                    </span>
                  </div>
                  <div className="border-[#2C3424]/05 flex justify-between border-b pb-4">
                    <span className="text-sm font-bold tracking-widest uppercase opacity-40">
                      수용 인원
                    </span>
                    <span className="text-sm font-bold">{listing.capacity}인</span>
                  </div>
                  <div className="border-[#2C3424]/05 flex justify-between border-b pb-4">
                    <span className="text-sm font-bold tracking-widest uppercase opacity-40">
                      주차 여부
                    </span>
                    <span className="text-sm font-bold">{listing.parking ? "가능" : "불가능"}</span>
                  </div>
                  <div className="border-[#2C3424]/05 flex justify-between border-b pb-4">
                    <span className="text-sm font-bold tracking-widest uppercase opacity-40">
                      입주 가능일
                    </span>
                    <span className="text-sm font-bold">{listing.availableFrom}~</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Section */}
            <div className="flex flex-col items-center gap-8 rounded-[2rem] bg-[#DADED8]/20 p-8 md:p-12 md:flex-row">
              <div className="h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-full shrink-0">
                <ImageWithFallback
                  src={listing.host.avatar}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <p className="mb-1 md:mb-2 text-xs md:text-sm font-black tracking-widest text-[#2C3424]/30 uppercase">
                  Hosted by
                </p>
                <h4 className="mb-2 text-2xl md:text-3xl font-black">{listing.host.name}</h4>
                <p
                  className="max-w-sm text-sm tracking-tight text-[#2C3424]/60"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  신뢰 기반의 공동체를 만들어가는 전담 공간 큐레이터. {listing.host.joinedDate}년부터 함께하고 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Booking Sticky */}
          <div className="lg:col-span-5">
            <motion.div
              className="sticky top-32 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-[#0F120D] p-6 text-[#DADED8] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] md:p-12"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-8 flex items-baseline justify-between">
                <h3 className="text-xl md:text-2xl font-black tracking-tighter">Reserve</h3>
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-black text-white">
                    ₩{listing.price.toLocaleString()}
                  </p>
                  <p className="text-[10px] md:text-xs font-black tracking-[0.3em] opacity-40 uppercase">
                    / Month
                  </p>
                </div>
              </div>

              <div className="mb-8 space-y-6">
                <div className="space-y-2">
                  <label
                    className="mb-2 block text-[10px] md:text-[12px] font-black tracking-[0.3em] uppercase opacity-40"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Preferred Move-in
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "group relative w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5 pl-14 text-left text-xs md:text-sm font-bold transition-all focus:border-white/30",
                          !date && "text-white/30",
                        )}
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        <LucideCalendar className="absolute top-1/2 left-5 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 opacity-30 transition-opacity group-hover:opacity-100" />
                        {date ? (
                          format(date, "PPP")
                        ) : (
                          <span className="opacity-40 text-[10px] md:text-sm">언제 입주할까요?</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden rounded-2xl border border-white/10 bg-[#1A1F16] p-0 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="bg-transparent p-4 text-[#DADED8]"
                        classNames={{
                          months: "flex flex-col space-y-4",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center mb-4",
                          caption_label:
                            "text-sm font-black uppercase tracking-[0.2em] text-white/90",
                          nav: "space-x-1 flex items-center",
                          nav_button:
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex mb-2",
                          head_cell:
                            "text-white/20 rounded-md w-10 h-10 flex items-center justify-center font-black text-[10px] uppercase",
                          row: "flex w-full mt-2",
                          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                          day: cn(
                            "h-10 w-10 flex items-center justify-center p-0 font-bold aria-selected:opacity-100 hover:bg-white/5 rounded-xl transition-all",
                          ),
                          day_selected:
                            "bg-[#768064] text-white hover:bg-[#8A9678] focus:bg-[#768064]",
                          day_today: "border border-white/20 text-white rounded-xl",
                          day_outside: "opacity-20 cursor-default",
                          day_disabled: "opacity-20",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-[10px] md:text-[12px] font-black tracking-[0.3em] uppercase opacity-50"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["3M", "6M", "12M"].map((m) => (
                      <button
                        key={m}
                        className="rounded-xl border border-white/10 p-2.5 text-[10px] md:text-xs font-bold tracking-widest text-white/70 uppercase transition-all hover:border-transparent hover:bg-[#768064] hover:text-white"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                className="group h-16 md:h-20 w-full rounded-2xl border-none bg-[#768064] text-sm md:text-xl font-black tracking-[0.2em] text-white uppercase shadow-lg shadow-[#768064]/20 transition-all hover:bg-[#8A9678]"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                BOOKING
                <ArrowRight className="ml-3 h-5 w-5 md:ml-4 md:h-8 md:w-8 transition-transform group-hover:translate-x-2" />
              </Button>

              <p className="mt-4 text-center text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase opacity-30">
                No payment required until agreement is signed
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Section or Visual Break */}
      <section className="min-h-[60vh] overflow-hidden">
        <div className="flex min-h-[60vh] flex-col md:flex-row">
          <div className="h-[40vh] w-full overflow-hidden grayscale transition-all duration-1000 hover:grayscale-0 md:h-full md:w-1/2">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1772475385426-ebd50c772229?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaXNsYW5kJTIwbWluaW1hbCUyMGRlc2lnbiUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzQ5Mzc2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex w-full items-center justify-center bg-[#030213] p-12 py-24 md:w-1/2 md:p-12">
            <div className="space-y-6 text-center text-white">
              <h3 className="text-4xl font-black tracking-tighter md:text-6xl">
                Join the collective.
              </h3>
              <p className="mx-auto max-w-sm text-xs font-black tracking-[0.3em] text-white/40 uppercase">
                Become a resident of the future.
              </p>
              <Button
                className="rounded-full border-none bg-[#768064] px-12 py-10 text-xl font-black tracking-[0.2em] text-white shadow-lg shadow-[#768064]/20 transition-all hover:bg-[#8A9678]"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                APPLY NOW
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
