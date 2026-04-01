import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: "Living Spaces", path: "/listings" },
      { name: "Membership", path: "/about" },
      { name: "Common Areas", path: "/about" },
      { name: "IoT Guide", path: "/about" },
    ],
    community: [
      { name: "Residents", path: "/profile" },
      { name: "Events", path: "/about" },
      { name: "Archive", path: "/listings" },
      { name: "Philosphy", path: "/about" },
    ],
    support: [
      { name: "Concierge", path: "/about" },
      { name: "Safe & Secure", path: "/about" },
      { name: "Terms & Privacy", path: "/about" },
    ],
  };

  return (
    <footer className="bg-background text-foreground border-t border-[#2C3424]/10 px-6 pt-32 pb-12 md:px-12 lg:px-24">
      <div className="mx-auto max-w-[1400px]">
        {/* Branding & Newsletter */}
        <div className="mb-32 grid grid-cols-1 gap-24 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Link to="/" className="group mb-12 inline-block">
              <span className="block text-[12vw] leading-[0.8] font-black tracking-tighter uppercase md:text-[8vw]">
                COKKIRI<span className="text-[#768064]">.</span>
              </span>
              <span className="text-xs font-black tracking-[0.4em] uppercase opacity-50 transition-opacity duration-500 group-hover:opacity-100">
                Togetherness Redefined © 26
              </span>
            </Link>

            <div className="max-w-2xl">
              <h4 className="mb-8 text-4xl font-black tracking-tighter uppercase">
                Join the collective.
              </h4>
              <div className="group flex items-center border-b-2 border-[#2C3424]/30 pb-4 transition-all focus-within:border-[#2C3424]">
                <input
                  type="email"
                  placeholder="YOUR EMAIL ADDRESS"
                  className="w-full border-none bg-transparent text-base font-black tracking-widest uppercase outline-none placeholder:text-[#2C3424]/40"
                />
                <motion.button whileHover={{ x: 10 }} className="p-2">
                  <ArrowRight className="h-8 w-8 text-[#768064]" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-end lg:col-span-4 lg:items-end">
            <div className="flex gap-10">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -8, color: "#768064" }}
                  className="text-[#2C3424]/60 transition-colors"
                >
                  <Icon className="h-8 w-8" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="mb-32 grid grid-cols-2 gap-12 border-t border-[#2C3424]/20 pt-20 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <h5 className="mb-10 text-[12px] font-black tracking-[0.3em] text-balance text-[#2C3424]/50 uppercase">
              Navigation / 01
            </h5>
            <ul className="space-y-6">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-base font-black tracking-widest uppercase transition-colors hover:text-[#768064]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-10 text-[12px] font-black tracking-[0.3em] text-balance text-[#2C3424]/50 uppercase">
              Community / 02
            </h5>
            <ul className="space-y-6">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-base font-black tracking-widest uppercase transition-colors hover:text-[#768064]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-10 text-[12px] font-black tracking-[0.3em] text-balance text-[#2C3424]/50 uppercase">
              Legal / 03
            </h5>
            <ul className="space-y-6">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-base font-black tracking-widest uppercase transition-colors hover:text-[#768064]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 flex flex-col items-end justify-end lg:col-span-1">
            <p className="text-right text-[14px] font-black tracking-[0.5em] uppercase">
              SMART LIVING
              <br />
              SINCE 2026
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-8 border-t border-[#2C3424]/10 pt-12 md:flex-row">
          <p className="text-xs font-black tracking-widest uppercase opacity-40">
            © {currentYear} COKKIRI CO-LIVING PLATFORM. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-12 text-xs font-black tracking-widest uppercase opacity-40">
            <span>DESIGN BY OLHA</span>
            <span>POWERED BY AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
