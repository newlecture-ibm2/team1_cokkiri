import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowLeft, Star, MapPin, Users, Calendar as LucideCalendar, Wifi, Plus, ArrowRight } from "lucide-react";
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
  "Kitchen": "주방",
  "Chef's Kitchen": "셰프급 주방",
  "AC": "에어컨",
  "Ergonomic Desk": "사무용 책상",
  "King Bed": "킹사이즈 침대",
  "Shared Lounge": "공유 라운지",
  "Private Patio": "개인 테라스",
  "24/7 Concierge": "24시 컨시어지",
  "Studio Space": "스튜디오 공간",
  "Library": "서재",
  "Roof Garden": "옥상 정원",
  "Coffee Bar": "커피 바"
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
    <div className="min-h-screen bg-background text-foreground selection:bg-[#2C3424] selection:text-[#DADED8]">
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
            className="w-full h-full object-cover opacity-80"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-24">
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Link to="/listings" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-all mb-8 group drop-shadow-lg">
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                <span className="text-lg font-medium uppercase tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>Return to Spaces</span>
              </Link>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 leading-[0.9]">
                {listing.title}
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Image Nav — 모바일: 하단 중앙 가로 / 데스크톱: 우측 세로 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 md:bottom-12 md:top-auto flex flex-row md:flex-col gap-3 md:gap-4">
          {listing.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
            >
              <ImageWithFallback src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">

          {/* Left: Details */}
          <div className="lg:col-span-7 space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-lg font-black uppercase tracking-tighter opacity-40">The Concept</h2>
              <p
                className="text-lg md:text-xl leading-relaxed font-medium tracking-tight opacity-60"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                COKKIRI는 스마트 IoT 기술과<br />
                공동체의 따뜻함이 공존하는<br />
                새로운 주거 기준을 제시합니다.<br /><br />

                개인의 프라이버시를 존중하면서도<br />
                지능형 공유 공간을 통해 자연스럽게 연결되는<br />
                특별한 일상을 경험해 보세요.
              </p>
            </motion.div>

            <Separator className="bg-[#2C3424]/05" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tighter opacity-40">Amenities</h3>
                <ul className="grid grid-cols-1 gap-4">
                  {listing.amenities.map((item) => (
                    <li key={item} className="flex items-center gap-4 group">
                      <div className="h-4 w-4 rounded-full bg-[#2C3424]/05 flex items-center justify-center group-hover:bg-[#768064] group-hover:text-white transition-all duration-300">
                        <Plus className="h-2.5 w-2.5" />
                      </div>
                      <span className="font-black text-sm tracking-tight opacity-70 group-hover:opacity-100 transition-opacity" style={{ fontFamily: "'Outfit', sans-serif" }}>{amenityMap[item] || item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tighter opacity-40">Details</h3>
                <div className="space-y-8">
                  <div className="flex justify-between border-b border-[#2C3424]/05 pb-4">
                    <span className="opacity-40 font-bold uppercase text-sm tracking-widest">방 유형</span>
                    <span className="font-bold text-sm">{listing.roomType === "Private Suite" ? "개인 전용" : listing.roomType === "Entire Space" ? "전체 독립형" : "공유 아틀리에"}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2C3424]/05 pb-4">
                    <span className="opacity-40 font-bold uppercase text-sm tracking-widest">층</span>
                    <span className="font-bold text-sm">{listing.floor}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2C3424]/05 pb-4">
                    <span className="opacity-40 font-bold uppercase text-sm tracking-widest">면적</span>
                    <span className="font-bold text-sm">{listing.size}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2C3424]/05 pb-4">
                    <span className="opacity-40 font-bold uppercase text-sm tracking-widest">구조</span>
                    <span className="font-bold text-sm">방 {listing.rooms}개 / 욕실 {listing.bathrooms}개</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2C3424]/05 pb-4">
                    <span className="opacity-40 font-bold uppercase text-sm tracking-widest">수용 인원</span>
                    <span className="font-bold text-sm">{listing.capacity}인</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2C3424]/05 pb-4">
                    <span className="opacity-40 font-bold uppercase text-sm tracking-widest">주차 여부</span>
                    <span className="font-bold text-sm">{listing.parking ? "가능" : "불가능"}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2C3424]/05 pb-4">
                    <span className="opacity-40 font-bold uppercase text-sm tracking-widest">입주 가능일</span>
                    <span className="font-bold text-sm">{listing.availableFrom}~</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Section */}
            <div className="p-12 bg-[#DADED8]/20 rounded-[2rem] flex flex-col md:flex-row items-center gap-8">
              <div className="h-32 w-32 rounded-full overflow-hidden">
                <ImageWithFallback src={listing.host.avatar} className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-black uppercase tracking-widest text-[#2C3424]/30 mb-2">Hosted by</p>
                <h4 className="text-3xl font-black mb-2">{listing.host.name}</h4>
                <p className="text-[#2C3424]/60 max-w-sm tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  신뢰 기반의 공동체를 만들어가는 전담 공간 큐레이터<br />
                  {listing.host.joinedDate}년부터 Cokkiri와 함께하고 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Booking Sticky */}
          <div className="lg:col-span-5">
            <motion.div
              className="sticky top-32 bg-[#0F120D] text-[#DADED8] p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/5"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-between items-baseline mb-12">
                <h3 className="text-2xl font-bold tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Reserve</h3>
                <div className="text-right">
                  <div className="text-4xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>₩{listing.price.toLocaleString()}</div>
                  <div className="text-sm font-black uppercase tracking-[0.2em] opacity-40">/ {listing.priceUnit}</div>
                </div>
              </div>

              <div className="space-y-8 mb-12">
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40 mb-3 block" style={{ fontFamily: "'Outfit', sans-serif" }}>Preferred Move-in</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 pl-14 text-left font-bold text-sm transition-all focus:border-white/30 relative group",
                          !date && "text-white/30"
                        )}
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        <LucideCalendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                        {date ? format(date, "PPP") : <span className="opacity-40">언제 입주할까요?</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1A1F16] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="bg-transparent text-[#DADED8] p-4"
                        classNames={{
                          months: "flex flex-col space-y-4",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center mb-4",
                          caption_label: "text-sm font-black uppercase tracking-[0.2em] text-white/90",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex mb-2",
                          head_cell: "text-white/20 rounded-md w-10 h-10 flex items-center justify-center font-black text-[10px] uppercase",
                          row: "flex w-full mt-2",
                          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                          day: cn(
                            "h-10 w-10 flex items-center justify-center p-0 font-bold aria-selected:opacity-100 hover:bg-white/5 rounded-xl transition-all"
                          ),
                          day_selected: "bg-[#768064] text-white hover:bg-[#8A9678] focus:bg-[#768064]",
                          day_today: "border border-white/20 text-white rounded-xl",
                          day_outside: "opacity-20 cursor-default",
                          day_disabled: "opacity-20",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-[0.3em] opacity-50" style={{ fontFamily: "'Outfit', sans-serif" }}>Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['3M', '6M', '12M'].map(m => (
                      <button key={m} className="p-3 rounded-xl border border-white/10 hover:bg-[#768064] hover:border-transparent transition-all font-bold text-xs uppercase tracking-widest text-white/70 hover:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                className="w-full h-20 rounded-2xl bg-[#768064] text-white hover:bg-[#8A9678] text-md font-black uppercase tracking-[0.2em] group border-none transition-all shadow-lg shadow-[#768064]/20"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                BOOKING
                <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>

              <p className="text-[10px] text-center mt-6 font-bold uppercase tracking-[0.2em] opacity-30">
                No payment required until agreement is signed
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Related Section or Visual Break */}
      <section className="min-h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/2 h-[40vh] md:h-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
            <ImageWithFallback src="https://images.unsplash.com/photo-1772475385426-ebd50c772229?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaXNsYW5kJTIwbWluaW1hbCUyMGRlc2lnbiUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzQ5Mzc2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080" className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-1/2 bg-[#030213] flex items-center justify-center p-8 md:p-12 py-16 md:py-12">
            <div className="text-center text-white space-y-6">
              <h3 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tighter">Join the collective.</h3>
              <p className="text-white/40 max-w-sm mx-auto uppercase text-xs font-black tracking-[0.3em]">Become a resident of the future.</p>
              <Button 
                className="rounded-full bg-[#768064] text-white hover:bg-[#8A9678] border-none transition-all px-8 py-6 md:px-12 md:py-10 text-base md:text-xl font-black tracking-[0.2em] shadow-lg shadow-[#768064]/20"
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
