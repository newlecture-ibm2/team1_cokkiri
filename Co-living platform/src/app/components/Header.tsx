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
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Living", path: "/listings" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <>
      <motion.header
        className={`sticky top-0 z-[100] border-b px-6 py-2 transition-all duration-500 md:px-12 md:py-3 ${
          isScrolled || isMobileMenuOpen
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
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
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
              className="bg-background/95 absolute top-[52px] right-0 left-0 border-b border-[#2C3424]/10 shadow-xl backdrop-blur-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="space-y-2 px-6 py-8">
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
                      className={`block border-b border-[#2C3424]/5 py-4 text-lg font-black tracking-[0.2em] uppercase transition-all duration-300 ${
                        location.pathname === link.path
                          ? "border-l-2 border-l-[#768064] pl-4 text-[#2C3424]"
                          : "text-[#2C3424]/40 hover:pl-4 hover:text-[#2C3424]"
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
                    className="flex items-center gap-3 text-xs font-black tracking-[0.3em] text-[#768064] uppercase"
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
