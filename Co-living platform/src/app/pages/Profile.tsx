import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
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
    <div className="bg-background text-foreground min-h-screen pb-32 selection:bg-[#2C3424] selection:text-[#DADED8]">
      <Header />

      <div className="px-6 pt-48 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 flex flex-col items-end justify-between gap-12 border-b border-[#2C3424]/10 pb-16 md:flex-row"
          >
            <div className="flex flex-col items-center gap-12 md:flex-row md:items-start">
              <div className="group relative">
                <Avatar className="h-48 w-48 rounded-[3rem] transition-all duration-700">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Resident" />
                  <AvatarFallback>RES</AvatarFallback>
                </Avatar>
                <div className="absolute -right-4 -bottom-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#DADED8] bg-[#2C3424] text-[#DADED8]">
                  <Shield className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
                    Verified Resident
                  </p>
                  <h1 className="text-6xl font-black tracking-tighter">ALEX CHEN.</h1>
                </div>
                <div className="flex flex-wrap justify-center gap-6 md:justify-start">
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#2C3424]/40 uppercase">
                    <MapPin className="h-3 w-3" />
                    Seoul, KR
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#2C3424]/40 uppercase">
                    <Calendar className="h-3 w-3" />
                    Joined Mar 2024
                  </div>
                </div>
                <Badge className="rounded-full bg-[#2C3424] px-6 py-2 text-[10px] font-black tracking-widest text-[#DADED8] uppercase">
                  Premium Membership
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-auto rounded-full border-[#2C3424]/10 px-8 py-6 text-xs font-black tracking-widest uppercase transition-all hover:bg-[#2C3424] hover:text-[#DADED8]"
            >
              Settings
            </Button>
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="saved" className="space-y-16">
            <TabsList className="mb-12 h-auto w-full justify-start gap-12 rounded-none border-b border-[#2C3424]/5 bg-transparent p-0">
              <TabsTrigger
                value="saved"
                className="h-auto rounded-none border-0 bg-transparent px-0 py-4 text-xs font-black tracking-[0.2em] text-[#2C3424]/40 uppercase transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#2C3424] data-[state=active]:bg-transparent data-[state=active]:text-[#2C3424] data-[state=active]:shadow-none"
              >
                The Collection
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="h-auto rounded-none border-0 bg-transparent px-0 py-4 text-xs font-black tracking-[0.2em] text-[#2C3424]/40 uppercase transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#2C3424] data-[state=active]:bg-transparent data-[state=active]:text-[#2C3424] data-[state=active]:shadow-none"
              >
                Residencies
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="h-auto rounded-none border-0 bg-transparent px-0 py-4 text-xs font-black tracking-[0.2em] text-[#2C3424]/40 uppercase transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#2C3424] data-[state=active]:bg-transparent data-[state=active]:text-[#2C3424] data-[state=active]:shadow-none"
              >
                Profile Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-0 focus-visible:outline-none">
              <div className="space-y-12">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-4xl font-black tracking-tight">SAVED SPACES.</h2>
                  <span className="text-xs font-black tracking-widest uppercase opacity-20">
                    {savedListings.length} ITEMS
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
                  {savedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="mt-0 focus-visible:outline-none">
              <div className="rounded-[3rem] border-2 border-dashed border-[#2C3424]/5 py-24 text-center">
                <Calendar className="mx-auto mb-6 h-12 w-12 text-[#2C3424]/10" />
                <h3 className="mb-4 text-2xl font-bold">No active residencies.</h3>
                <p className="mx-auto mb-8 max-w-sm text-[10px] font-black tracking-widest text-[#2C3424]/40 uppercase">
                  Your future sanctuary is waiting in the archive.
                </p>
                <Button className="text-md h-auto rounded-full bg-[#2C3424] px-12 py-6 font-black tracking-[0.2em] text-[#DADED8] uppercase transition-all hover:bg-[#768064]">
                  Explore Spaces
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="account" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-24 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-4">
                  <h3 className="text-2xl font-black tracking-tighter">IDENTITY.</h3>
                  <p className="text-sm leading-relaxed font-black tracking-widest text-[#2C3424]/40 uppercase">
                    Manage your personal information and verified residency status.
                  </p>
                </div>
                <div className="space-y-12 lg:col-span-8">
                  <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black tracking-widest uppercase opacity-40">
                        Legal Name
                      </Label>
                      <Input
                        defaultValue="Alex Chen"
                        className="h-auto rounded-2xl border-0 bg-[#C8CDC4] p-6 text-[#2C3424] focus:ring-0"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black tracking-widest uppercase opacity-40">
                        Email Address
                      </Label>
                      <Input
                        defaultValue="alex@collective.io"
                        className="h-auto rounded-2xl border-0 bg-[#C8CDC4] p-6 text-[#2C3424] focus:ring-0"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black tracking-widest uppercase opacity-40">
                        Mobile
                      </Label>
                      <Input
                        defaultValue="+82 10 2345 6789"
                        className="h-auto rounded-2xl border-0 bg-[#C8CDC4] p-6 text-[#2C3424] focus:ring-0"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black tracking-widest uppercase opacity-40">
                        Location
                      </Label>
                      <Input
                        defaultValue="Seoul, South Korea"
                        className="h-auto rounded-2xl border-0 bg-[#C8CDC4] p-6 text-[#2C3424] focus:ring-0"
                      />
                    </div>
                  </div>
                  <Button className="text-md h-auto rounded-full bg-[#2C3424] px-12 py-6 font-black tracking-[0.2em] text-[#DADED8] uppercase transition-all hover:bg-[#768064]">
                    Update Profile
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
