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
    ]
  };

  return (
    <footer className="bg-background text-foreground border-t border-[#2C3424]/10 pt-32 pb-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        {/* Branding & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mb-32">
          <div className="lg:col-span-8">
            <Link to="/" className="inline-block group mb-12">
              <span className="text-[12vw] md:text-[8vw] font-black tracking-tighter leading-[0.8] uppercase block">
                COKKIRI<span className="text-[#768064]">.</span>
              </span>
              <span className="text-xs font-black uppercase tracking-[0.4em] opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                Togetherness Redefined © 26
              </span>
            </Link>
            
            <div className="max-w-2xl">
              <h4 className="text-4xl font-black tracking-tighter mb-8 uppercase">Join the collective.</h4>
              <div className="flex items-center border-b-2 border-[#2C3424]/30 pb-4 group focus-within:border-[#2C3424] transition-all">
                <input 
                  type="email" 
                  placeholder="YOUR EMAIL ADDRESS" 
                  className="bg-transparent border-none outline-none w-full text-base font-black uppercase tracking-widest placeholder:text-[#2C3424]/40"
                />
                <motion.button 
                  whileHover={{ x: 10 }}
                  className="p-2"
                >
                  <ArrowRight className="h-8 w-8 text-[#768064]" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end items-start lg:items-end">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-32 border-t border-[#2C3424]/20 pt-20">
          <div>
            <h5 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#2C3424]/50 mb-10 text-balance">Navigation / 01</h5>
            <ul className="space-y-6">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-base font-black uppercase tracking-widest hover:text-[#768064] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#2C3424]/50 mb-10 text-balance">Community / 02</h5>
            <ul className="space-y-6">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-base font-black uppercase tracking-widest hover:text-[#768064] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#2C3424]/50 mb-10 text-balance">Legal / 03</h5>
            <ul className="space-y-6">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-base font-black uppercase tracking-widest hover:text-[#768064] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1 flex flex-col justify-end items-end">
            <p className="text-[14px] font-black uppercase tracking-[0.5em] text-right">
              SMART LIVING<br />
              SINCE 2026
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-[#2C3424]/10 pt-12">
          <p className="text-xs font-black uppercase tracking-widest opacity-40">
            © {currentYear} COKKIRI CO-LIVING PLATFORM. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-12 text-xs font-black uppercase tracking-widest opacity-40">
            <span>DESIGN BY OLHA</span>
            <span>POWERED BY AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
