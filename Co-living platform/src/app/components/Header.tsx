import { Link, useLocation } from "react-router";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 메뉴 열림 시 body 스크롤 잠금
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Living", path: "/listings" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <>
      <motion.header
        className={`sticky top-0 z-[100] px-6 py-2 md:px-12 md:py-3 transition-all duration-500 border-b ${isScrolled || isMobileMenuOpen ? "bg-background/80 backdrop-blur-md border-[#2C3424]/5 shadow-sm" : "bg-transparent border-transparent"
          }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <span className="text-3xl font-black uppercase tracking-tighter text-[#2C3424]">COKKIRI</span>
            <span className="text-xs font-black uppercase tracking-widest text-[#2C3424]/50 mb-auto mt-1 ml-1 group-hover:text-[#2C3424] transition-colors duration-500">© 26</span>
          </Link>

          <div className="flex items-center gap-10">
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-black uppercase tracking-widest text-[#2C3424] transition-all duration-500 hover:opacity-100 ${location.pathname === link.path ? "opacity-100 underline underline-offset-8" : "opacity-40"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4 border-l border-[#2C3424]/10 pl-4">
              <Link to="/profile" className="hidden md:block">
                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-[#2C3424] hover:bg-[#2C3424]/5 transition-all duration-500">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden h-10 w-10 text-[#2C3424] hover:bg-[#2C3424]/5 transition-all duration-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[99] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-[#2C3424]/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.nav
              className="absolute top-[52px] left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-[#2C3424]/10 shadow-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="px-6 py-8 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-4 border-b border-[#2C3424]/5 text-lg font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        location.pathname === link.path
                          ? "text-[#2C3424] pl-4 border-l-2 border-l-[#768064]"
                          : "text-[#2C3424]/40 hover:text-[#2C3424] hover:pl-4"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="pt-6"
                >
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-[#768064]"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </motion.div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
