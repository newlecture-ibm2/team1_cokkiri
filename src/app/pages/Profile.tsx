import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MapPin, Calendar, Heart, Settings, Shield, Bell } from "lucide-react";
import { listings } from "../data/mockData";
import { ListingCard } from "../components/ListingCard";
import { motion } from "motion/react";

export function Profile() {
  const savedListings = listings.slice(0, 2);

  return (
    <div className="min-h-screen bg-white text-[#030213] selection:bg-black selection:text-white pb-32">
      <Header />
      
      <div className="pt-48 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-black/10 pb-16 mb-16"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
              <div className="relative group">
                <Avatar className="h-48 w-48 rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-700">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Resident" />
                  <AvatarFallback>RES</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-black text-white rounded-full flex items-center justify-center border-4 border-white">
                  <Shield className="h-5 w-5" />
                </div>
              </div>
              
              <div className="text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Verified Resident</p>
                  <h1 className="text-6xl font-bold tracking-tighter">ALEX CHEN.</h1>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="flex items-center gap-2 text-black/40 font-bold uppercase text-[10px] tracking-widest">
                    <MapPin className="h-3 w-3" />
                    Seoul, KR
                  </div>
                  <div className="flex items-center gap-2 text-black/40 font-bold uppercase text-[10px] tracking-widest">
                    <Calendar className="h-3 w-3" />
                    Joined Mar 2024
                  </div>
                </div>
                <Badge className="bg-black text-white rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest">Premium Membership</Badge>
              </div>
            </div>

            <Button variant="outline" className="rounded-full border-black/10 px-8 py-6 h-auto text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="saved" className="space-y-16">
            <TabsList className="bg-transparent border-b border-black/5 w-full justify-start gap-12 h-auto p-0 rounded-none mb-12">
              <TabsTrigger value="saved" className="bg-transparent border-0 rounded-none px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black text-black/40 data-[state=active]:text-black text-xs font-black uppercase tracking-[0.2em] transition-all">
                The Collection
              </TabsTrigger>
              <TabsTrigger value="bookings" className="bg-transparent border-0 rounded-none px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black text-black/40 data-[state=active]:text-black text-xs font-black uppercase tracking-[0.2em] transition-all">
                Residencies
              </TabsTrigger>
              <TabsTrigger value="account" className="bg-transparent border-0 rounded-none px-0 py-4 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black text-black/40 data-[state=active]:text-black text-xs font-black uppercase tracking-[0.2em] transition-all">
                Profile Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-0 focus-visible:outline-none">
              <div className="space-y-12">
                <div className="flex justify-between items-baseline">
                  <h2 className="text-4xl font-bold tracking-tight">SAVED SPACES.</h2>
                  <span className="text-xs font-black uppercase tracking-widest opacity-20">{savedListings.length} ITEMS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {savedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="mt-0 focus-visible:outline-none">
              <div className="py-24 text-center border-2 border-dashed border-black/5 rounded-[3rem]">
                <Calendar className="h-12 w-12 mx-auto mb-6 text-black/10" />
                <h3 className="text-2xl font-bold mb-4">No active residencies.</h3>
                <p className="text-black/40 mb-8 max-w-sm mx-auto uppercase text-[10px] font-black tracking-widest">Your future sanctuary is waiting in the archive.</p>
                <Button variant="outline" className="rounded-full border-black/10 px-8 py-4 h-auto text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                  Explore Archive
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="account" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                <div className="lg:col-span-4 space-y-6">
                  <h3 className="text-2xl font-bold tracking-tight">IDENTITY.</h3>
                  <p className="text-black/40 text-sm leading-relaxed uppercase font-black tracking-widest">Manage your personal information and verified residency status.</p>
                </div>
                <div className="lg:col-span-8 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Legal Name</Label>
                      <Input defaultValue="Alex Chen" className="bg-[#f5f5f5] border-0 rounded-2xl p-6 h-auto focus:ring-0" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Email Address</Label>
                      <Input defaultValue="alex@collective.io" className="bg-[#f5f5f5] border-0 rounded-2xl p-6 h-auto focus:ring-0" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Mobile</Label>
                      <Input defaultValue="+82 10 2345 6789" className="bg-[#f5f5f5] border-0 rounded-2xl p-6 h-auto focus:ring-0" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Location</Label>
                      <Input defaultValue="Seoul, South Korea" className="bg-[#f5f5f5] border-0 rounded-2xl p-6 h-auto focus:ring-0" />
                    </div>
                  </div>
                  <Button className="rounded-full bg-black text-white px-12 py-6 h-auto text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all">
                    Update Profile
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
