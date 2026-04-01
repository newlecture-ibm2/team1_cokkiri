import { Link, useLocation } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "./ui/button";
import { User, Menu } from "lucide-react";
import { useRef } from "react";

export function Header() {
  const location = useLocation();
  const headerRef = useRef(null);
  
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 100], [0, -100]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  
  const navLinks = [
    { name: "Archive", path: "/listings" },
    { name: "About", path: "/about" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <motion.header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 md:px-12 md:py-12 mix-blend-difference"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-1">
          <span className="text-2xl font-black uppercase tracking-tighter text-white">COLIVING</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-auto mt-1 ml-1 group-hover:text-white transition-colors duration-500">© 26</span>
        </Link>

        <nav className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`text-sm font-bold uppercase tracking-widest text-white transition-all duration-500 hover:opacity-100 ${
                location.pathname === link.path ? "opacity-100 underline underline-offset-8" : "opacity-40"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <Link to="/profile" className="hidden md:block">
            <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 text-white hover:bg-white/10 hover:text-white transition-all duration-500">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button size="icon" variant="ghost" className="md:hidden h-12 w-12 text-white hover:bg-white/10 hover:text-white transition-all duration-500">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
