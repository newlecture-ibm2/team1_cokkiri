"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: "Living Space", path: "/rooms" },
      { name: "Experience", path: "/experience" },
      { name: "Stay", path: "/facilities" },
      { name: "Community", path: "/community" },
    ],
    myMoment: [
      { name: "Profile", path: "/profile" },
      { name: "Contract", path: "/my-contracts" },
      { name: "Reservation", path: "/facilities" },
      { name: "Device", path: "/my-devices" },
      { name: "VOC", path: "/vocs" },
      { name: "Notification", path: "/notifications" },
    ],
  };


  return (
    <footer className="border-t border-primary/10 bg-background px-[clamp(1.5rem,4vw,6rem)] pt-[clamp(2rem,4vw,4rem)] pb-[clamp(1.5rem,3vw,3rem)] text-foreground">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-[clamp(2rem,4vw,4rem)] grid grid-cols-1 gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Link href="/" className="group mb-8 inline-block">
              <span className="block text-[clamp(2rem,8vw,5vw)] font-black leading-[0.8] tracking-tighter uppercase">
                COKKIRI<span className="text-secondary">.</span>
              </span>
              <span className="mt-[clamp(0.5rem,1vw,1.5rem)] block whitespace-nowrap text-[clamp(0.5rem,1vw,0.75rem)] font-black uppercase opacity-50 transition-opacity duration-500 group-hover:opacity-100 tracking-[0.4em]">
                Togetherness Redefined © 26
              </span>
            </Link>

            <div className="max-w-2xl">
              <h4 className="mb-[clamp(1rem,2vw,2rem)] text-[clamp(1.25rem,3vw,2.25rem)] font-black tracking-tighter uppercase">Join the collective.</h4>
              <div className="group flex items-center border-b-2 border-primary/30 pb-4 transition-all focus-within:border-primary">
                <input
                  type="email"
                  placeholder="YOUR EMAIL ADDRESS"
                  className="w-full border-none bg-transparent text-[clamp(0.7rem,1.2vw,1rem)] font-black tracking-widest uppercase outline-none placeholder:text-primary/40"
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
              {[
                { Icon: Instagram, url: "https://www.instagram.com" },
                { Icon: Twitter, url: "https://x.com" },
                { Icon: Linkedin, url: "https://www.linkedin.com" },
              ].map(({ Icon, url }) => (
                <motion.a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -8, color: "var(--color-secondary)" }}
                  className="text-primary/60 transition-colors"
                >
                  <Icon className="h-6 w-6 md:h-8 md:w-8" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-[clamp(2rem,4vw,4rem)] grid grid-cols-2 gap-[clamp(1.5rem,3vw,2.5rem)] border-t border-primary/20 pt-[clamp(1.5rem,3vw,3rem)] md:grid-cols-3 lg:grid-cols-4">
          <div>
            <h5 className="mb-[clamp(0.75rem,1.5vw,1.5rem)] text-[clamp(0.6rem,1vw,0.8125rem)] font-black tracking-[0.3em] text-balance text-primary/50 uppercase">
              EXPLORE / 01
            </h5>
            <ul className="space-y-[clamp(0.5rem,1vw,1rem)]">
              {footerLinks.explore.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link
                    href={link.path}
                    className="text-[clamp(0.65rem,1vw,0.875rem)] font-black tracking-widest uppercase transition-colors hover:text-secondary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-[clamp(0.75rem,1.5vw,1.5rem)] text-[clamp(0.6rem,1vw,0.8125rem)] font-black tracking-[0.3em] text-balance text-primary/50 uppercase">
              MY MOMENT / 02
            </h5>
            <ul className="space-y-[clamp(0.5rem,1vw,1rem)]">
              {footerLinks.myMoment.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link
                    href={link.path}
                    className="text-[clamp(0.65rem,1vw,0.875rem)] font-black tracking-widest uppercase transition-colors hover:text-secondary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 flex flex-col items-end justify-end md:col-span-1 md:col-start-3 lg:col-start-4">
            <p className="text-right text-[clamp(0.55rem,1vw,0.875rem)] font-black uppercase tracking-[0.4em]">
              SMART LIVING
              <br />
              SINCE 2026
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-[clamp(0.75rem,1.5vw,1.5rem)] border-t border-primary/10 pt-[clamp(1.25rem,2.5vw,2.5rem)] md:flex-row">
          <p className="text-[clamp(0.5rem,0.8vw,0.625rem)] font-black tracking-widest uppercase opacity-40">
            © {currentYear} COKKIRI CO-LIVING PLATFORM. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-[clamp(1rem,2vw,2rem)] text-[clamp(0.5rem,0.8vw,0.625rem)] font-black tracking-widest uppercase opacity-40">
            <span>DESIGN BY KANG, YUN</span>
            <span>POWERED BY AI</span>
          </div>
        </div>

        <div className="mt-[clamp(1rem,2vw,2rem)] border-t border-primary/10 pt-[clamp(1rem,2vw,2rem)]">
          <div className="flex flex-col gap-2 text-[clamp(0.55rem,0.85vw,0.6875rem)] font-medium leading-relaxed tracking-tight text-primary/40">
            <p>
              <span className="font-bold text-primary/50">주식회사 코끼리</span>
              <span className="mx-2">|</span>대표이사: 김코끼리
              <span className="mx-2">|</span>사업자등록번호: 124-86-01234
            </p>
            <p>
              통신판매업신고: 제2026-서울강남-00124호
              <span className="mx-2">|</span>호스팅제공자: Amazon Web Services
            </p>
            <p>
              주소: 서울특별시 강남구 테헤란로 124, 코끼리빌딩 8층
            </p>
            <p>
              고객센터: 1588-0124 (평일 09:00 ~ 18:00)
              <span className="mx-2">|</span>이메일: support@cokkiri.co.kr
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
