"use client";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MapPin, Calendar, Shield } from "lucide-react";
import { listings } from "../data/mockData";
import { ListingCard } from "../components/ListingCard";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const savedListings = listings.slice(0, 2);

  return (
    <div className="bg-background text-foreground min-h-screen pb-20 selection:bg-[#2C3424] selection:text-[#DADED8]">
      <Header />

      <div className="px-6 pt-24 md:pt-32 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center justify-between gap-8 border-b border-[#2C3424]/10 pb-8 md:flex-row md:items-end"
          >
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <div className="group relative">
                <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-[2rem] md:rounded-[3rem] transition-all duration-700">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Resident" />
                  <AvatarFallback>RES</AvatarFallback>
                </Avatar>
                <div className="absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full border-4 border-[#DADED8] bg-[#2C3424] text-[#DADED8]">
                  <Shield className="h-3 w-3 md:h-5 md:w-5" />
                </div>
              </div>

              <div className="space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
                    Verified Resident
                  </p>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter">ALEX CHEN.</h1>
                </div>
                <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#2C3424]/40 uppercase">
                    <MapPin className="h-3 w-3" />
                    Seoul, KR
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#2C3424]/40 uppercase">
                    <Calendar className="h-3 w-3" />
                    Joined Mar 2024
                  </div>
                </div>
                <Badge className="rounded-full bg-[#2C3424] px-4 py-1.5 md:px-6 md:py-2 text-[8px] md:text-[10px] font-black tracking-widest text-[#DADED8] uppercase">
                  Premium Membership
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-auto rounded-full border-[#2C3424]/10 px-6 py-4 md:px-8 md:py-6 text-[10px] md:text-xs font-black tracking-widest uppercase transition-all hover:bg-[#2C3424] hover:text-[#DADED8]"
            >
              Settings
            </Button>
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="saved" className="space-y-10">
            <TabsList className="mb-8 flex h-auto w-full justify-start gap-8 md:gap-12 rounded-none border-b border-[#2C3424]/5 bg-transparent p-0 overflow-x-auto no-scrollbar">
              <TabsTrigger
                value="saved"
                className="h-auto rounded-none border-0 bg-transparent px-0 py-4 text-[10px] md:text-xs font-black tracking-[0.2em] text-[#2C3424]/40 uppercase transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#2C3424] data-[state=active]:bg-transparent data-[state=active]:text-[#2C3424] data-[state=active]:shadow-none flex-shrink-0"
              >
                The Collection
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="h-auto rounded-none border-0 bg-transparent px-0 py-4 text-[10px] md:text-xs font-black tracking-[0.2em] text-[#2C3424]/40 uppercase transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#2C3424] data-[state=active]:bg-transparent data-[state=active]:text-[#2C3424] data-[state=active]:shadow-none flex-shrink-0"
              >
                Residencies
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="h-auto rounded-none border-0 bg-transparent px-0 py-4 text-[10px] md:text-xs font-black tracking-[0.2em] text-[#2C3424]/40 uppercase transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#2C3424] data-[state=active]:bg-transparent data-[state=active]:text-[#2C3424] data-[state=active]:shadow-none flex-shrink-0"
              >
                Profile Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-0 focus-visible:outline-none">
              <div className="space-y-10">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">SAVED SPACES.</h2>
                  <span className="text-[10px] md:text-xs font-black tracking-widest uppercase opacity-20">
                    {savedListings.length} ITEMS
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                  {savedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
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
