"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: "Living", path: "/rooms" },
      { name: "Stay", path: "/rooms" },
      { name: "Facility", path: "/facility" },
    ],
    community: [
      { name: "Board", path: "/community" },
      { name: "Event", path: "/" },
      { name: "Notice", path: "/" },
      { name: "VOC", path: "/vocs" },
    ],
    support: [
      { name: "Profile", path: "/profile" },
      { name: "Device", path: "/" },
      { name: "Contract", path: "/" },
      { name: "Reservation", path: "/" },
    ],
  };

  return (
    <footer className="border-t border-primary/10 bg-background px-6 pt-16 pb-12 text-foreground md:px-12 lg:px-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-16 grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Link href="/" className="group mb-8 inline-block">
              <span className="block text-[11vw] font-black leading-[0.8] tracking-tighter uppercase md:text-[5vw]">
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

        <div className="mb-16 grid grid-cols-2 gap-10 border-t border-primary/20 pt-12 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <h5 className="mb-6 text-[13px] font-black tracking-[0.3em] text-balance text-primary/50 uppercase">
              EXPLORE / 01
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
            <h5 className="mb-6 text-[13px] font-black tracking-[0.3em] text-balance text-primary/50 uppercase">
              COMMUNITY / 02
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
            <h5 className="mb-6 text-[13px] font-black tracking-[0.3em] text-balance text-primary/50 uppercase">
              SUPPORT / 03
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

        <div className="mt-8 border-t border-primary/10 pt-8">
          <div className="flex flex-col gap-2 text-[11px] font-medium leading-relaxed tracking-tight text-primary/40">
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
