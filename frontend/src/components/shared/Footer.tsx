"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: "My Contracts", path: "/my-contracts" },
      { name: "Apply Now", path: "/contract-apply" },
      { name: "Community", path: "/community" },
      { name: "VOC", path: "/voc" },
    ],
    community: [
      { name: "Residents", path: "/profile" },
      { name: "Community", path: "/community" },
      { name: "Philosophy", path: "/" },
    ],
    support: [
      { name: "Concierge", path: "/voc" },
      { name: "Terms & Privacy", path: "/community" },
    ],
  };


  return (
    <footer className="border-t border-primary/10 bg-background px-6 pt-16 pb-12 text-foreground md:px-12 lg:px-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-16 grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Link href="/" className="group mb-8 inline-block">
              <span className="block text-[15vw] font-black leading-[0.8] tracking-tighter uppercase md:text-[8vw]">
                COKKIRI<span className="text-secondary">.</span>
              </span>
              <span className="mt-4 block whitespace-nowrap text-[min(10vw,15px)] font-black uppercase opacity-50 transition-opacity duration-500 group-hover:opacity-100 md:mt-6 md:text-xs md:tracking-[0.4em]">
                Togetherness Redefined © 26
              </span>
            </Link>

            <div className="max-w-2xl">
              <h4 className="mb-8 text-4xl font-black tracking-tighter uppercase">Join the collective.</h4>
              <div className="group flex items-center border-b-2 border-primary/30 pb-4 transition-all focus-within:border-primary">
                <input
                  type="email"
                  placeholder="YOUR EMAIL ADDRESS"
                  className="w-full border-none bg-transparent text-base font-black tracking-widest uppercase outline-none placeholder:text-primary/40"
                  readOnly
                  aria-label="뉴스레터 이메일 (준비 중)"
                />
                <motion.button type="button" whileHover={{ x: 10 }} className="p-2">
                  <ArrowRight className="h-8 w-8 text-secondary" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-end lg:col-span-4 lg:items-end">
            <div className="flex gap-8">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -8, color: "var(--color-secondary)" }}
                  className="text-primary/60 transition-colors"
                >
                  <Icon className="h-6 w-6 md:h-8 md:w-8" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-10 border-t border-primary/20 pt-12 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <h5 className="mb-6 text-[11px] font-black tracking-[0.3em] text-balance text-primary/50 uppercase">
              Navigation / 01
            </h5>
            <ul className="space-y-4">
              {footerLinks.explore.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link
                    href={link.path}
                    className="text-sm font-black tracking-widest uppercase transition-colors hover:text-secondary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-6 text-[11px] font-black tracking-[0.3em] text-balance text-primary/50 uppercase">
              Community / 02
            </h5>
            <ul className="space-y-4">
              {footerLinks.community.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link
                    href={link.path}
                    className="text-sm font-black tracking-widest uppercase transition-colors hover:text-secondary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-6 text-[11px] font-black tracking-[0.3em] text-balance text-primary/50 uppercase">
              Legal / 03
            </h5>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link
                    href={link.path}
                    className="text-sm font-black tracking-widest uppercase transition-colors hover:text-secondary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 flex flex-col items-end justify-end lg:col-span-1">
            <p className="text-right text-[11px] font-black uppercase tracking-[0.4em] md:text-[14px] md:tracking-[0.5em]">
              SMART LIVING
              <br />
              SINCE 2026
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-primary/10 pt-10 md:flex-row">
          <p className="text-[10px] font-black tracking-widest uppercase opacity-40">
            © {currentYear} COKKIRI CO-LIVING PLATFORM. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-[10px] font-black tracking-widest uppercase opacity-40">
            <span>DESIGN BY OLHA</span>
            <span>POWERED BY AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
