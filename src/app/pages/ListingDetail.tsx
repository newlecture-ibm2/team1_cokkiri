import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, Star, MapPin, Users, Calendar, Wifi, Check, ArrowRight } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { listings } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";

export function ListingDetail() {
  const { id } = useParams();
  const listing = listings.find((l) => l.id === id);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!listing) return null;

  const handleBooking = () => {
    toast.success("Booking request sent! Our concierge will contact you shortly.");
  };

  return (
    <div className="min-h-screen bg-white text-[#030213]">
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
              <Link to="/listings" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Back to Archive</span>
              </Link>
              <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-4 leading-[0.9]">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg font-medium">{listing.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-white text-white" />
                  <span className="text-lg font-bold">{listing.rating}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Image Nav */}
        <div className="absolute right-6 bottom-12 flex flex-col gap-4">
          {listing.images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedImage(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
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
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-black/30">The Concept</h2>
              <p className="text-2xl md:text-3xl leading-snug font-medium">
                {listing.description}
              </p>
            </motion.div>

            <Separator className="bg-black/5" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-black/30">Amenities</h3>
                <ul className="grid grid-cols-1 gap-4">
                  {listing.amenities.map((item) => (
                    <li key={item} className="flex items-center gap-4 group">
                      <div className="h-8 w-8 rounded-full bg-[#f5f5f5] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-black/30">Specifications</h3>
                <div className="space-y-8">
                  <div className="flex justify-between border-b border-black/5 pb-4">
                    <span className="text-black/40 font-bold uppercase text-[10px] tracking-widest">Type</span>
                    <span className="font-bold">{listing.roomType}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-4">
                    <span className="text-black/40 font-bold uppercase text-[10px] tracking-widest">Capacity</span>
                    <span className="font-bold">{listing.capacity} Residents</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-4">
                    <span className="text-black/40 font-bold uppercase text-[10px] tracking-widest">Availability</span>
                    <span className="font-bold">From {listing.availableFrom}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Section */}
            <div className="p-12 bg-[#f5f5f5] rounded-[2rem] flex flex-col md:flex-row items-center gap-8">
              <div className="h-32 w-32 rounded-full overflow-hidden grayscale">
                <ImageWithFallback src={listing.host.avatar} className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-black uppercase tracking-widest text-black/30 mb-2">Hosted by</p>
                <h4 className="text-3xl font-bold mb-2">{listing.host.name}</h4>
                <p className="text-black/60 max-w-sm">
                  A dedicated space curator focused on building high-trust communities. Resident since {listing.host.joinedDate}.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Booking Sticky */}
          <div className="lg:col-span-5">
            <motion.div 
              className="sticky top-32 bg-[#030213] text-white p-12 rounded-[2.5rem] shadow-2xl"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-between items-baseline mb-12">
                <h3 className="text-4xl font-bold tracking-tighter">Reserve.</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold">₩{listing.price.toLocaleString()}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Per {listing.priceUnit}</div>
                </div>
              </div>

              <div className="space-y-8 mb-12">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Preferred Move-in</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-white/40 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['3M', '6M', '12M'].map(m => (
                      <button key={m} className="p-3 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all font-bold text-xs uppercase tracking-widest">
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleBooking}
                className="w-full h-20 rounded-2xl bg-white text-black hover:bg-white/90 text-lg font-black uppercase tracking-[0.2em] group"
              >
                REQUEST TOUR
                <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              
              <p className="text-[10px] text-center mt-6 font-bold uppercase tracking-[0.2em] opacity-30">
                No payment required until agreement is signed
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Related Section or Visual Break */}
      <section className="h-[60vh] overflow-hidden">
        <div className="flex h-full">
          <div className="w-1/2 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
             <ImageWithFallback src="https://images.unsplash.com/photo-1772475385426-ebd50c772229?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaXNsYW5kJTIwbWluaW1hbCUyMGRlc2lnbiUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzQ5Mzc2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080" className="w-full h-full object-cover" />
          </div>
          <div className="w-1/2 bg-[#030213] flex items-center justify-center p-12">
            <div className="text-center text-white space-y-6">
              <h3 className="text-4xl md:text-6xl font-bold tracking-tighter">Join the collective.</h3>
              <p className="text-white/40 max-w-sm mx-auto uppercase text-xs font-black tracking-[0.3em]">Become a resident of the future.</p>
              <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-all px-12 py-8 text-xl font-bold">
                APPLY NOW
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
