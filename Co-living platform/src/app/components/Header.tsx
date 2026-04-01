import { Link, useLocation } from "react-router";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Button } from "./ui/button";
import { User, Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Living", path: "/listings" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <motion.header
      className={`sticky top-0 z-[100] border-b px-6 py-2 transition-all duration-500 md:px-12 md:py-3 ${
        isScrolled
          ? "bg-background/80 border-[#2C3424]/5 shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <span className="text-3xl font-black tracking-tighter text-[#2C3424] uppercase">
            COKKIRI
          </span>
          <span className="mt-1 mb-auto ml-1 text-xs font-black tracking-widest text-[#2C3424]/50 uppercase transition-colors duration-500 group-hover:text-[#2C3424]">
            © 26
          </span>
        </Link>

        <div className="flex items-center gap-10">
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-black tracking-widest text-[#2C3424] uppercase transition-all duration-500 hover:opacity-100 ${
                  location.pathname === link.path
                    ? "underline underline-offset-8 opacity-100"
                    : "opacity-40"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 border-l border-[#2C3424]/10 pl-4">
            <Link to="/profile" className="hidden md:block">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full text-[#2C3424] transition-all duration-500 hover:bg-[#2C3424]/5"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-[#2C3424] transition-all duration-500 hover:bg-[#2C3424]/5 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
