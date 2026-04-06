"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type NavChild = { name: string; path: string };

type NavLinkItem = { name: string; path: string };
type NavMenuItem = { name: string; children: NavChild[] };
type NavItem = NavLinkItem | NavMenuItem;

/** 순서: Home → Space → Community → My */
const navItems: NavItem[] = [
  { name: "Home", path: "/" },
  {
    name: "Space",
    children: [
      { name: "Living", path: "/rooms" },
      { name: "Stay", path: "/facilities" },
    ],
  },
  {
    name: "Community",
    children: [
      { name: "Board", path: "/community" },
      { name: "Voc", path: "/vocs" },
    ],
  },
  {
    name: "My",
    children: [
      { name: "Notification", path: "/notifications" },
      { name: "Profile", path: "/profile" },
      { name: "Logout", path: "/login" },
    ],
  },
];

function pathActive(pathname: string, path: string) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function childListActive(pathname: string, children: NavChild[]) {
  return children.some((c) => pathActive(pathname, c.path));
}

function itemActive(pathname: string, item: NavMenuItem) {
  return childListActive(pathname, item.children);
}

/** 패널·항목 모두 같은 이징으로 어긋남을 줄임. 링크는 y 이동 없이 페이드만 (패널 transform과 분리). */
const dropdownEase = [0.33, 1, 0.68, 1] as const;

const dropdownPanelVariants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.96,
    x: "-50%",
    transition: { duration: 0.22, ease: dropdownEase },
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    x: "-50%",
    transition: {
      duration: 0.42,
      ease: dropdownEase,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    x: "-50%",
    transition: { duration: 0.26, ease: dropdownEase },
  },
};

const dropdownLinkVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.34, ease: dropdownEase },
  },
};

/** 패널 래퍼: 스태거는 이 motion의 직계 자식(링크 래퍼)에만 전달 */
const dropdownPanelShellVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.1,
    },
  },
};

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const [desktopOpenMenu, setDesktopOpenMenu] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMobileSection(null);
    setDesktopOpenMenu(null);
  }, [pathname]);

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

  const linkClass = (active: boolean) =>
    cn(
      "text-base font-black tracking-widest text-primary uppercase transition-all duration-500 hover:opacity-100",
      active ? "underline underline-offset-8 opacity-100" : "opacity-40",
    );

  const subLinkClass = (active: boolean) =>
    cn(
      "flex w-full items-center justify-center text-center text-balance whitespace-nowrap rounded-md py-2.5 text-sm font-black tracking-[0.16em] text-primary uppercase transition-colors hover:bg-primary/5 md:py-3 md:text-[0.95rem] md:tracking-[0.18em]",
      active ? "bg-primary/10 text-primary" : "text-primary/70",
    );

  return (
    <>
      <motion.header
        className={`sticky top-0 z-[100] border-b px-6 py-2 transition-all duration-500 md:px-12 md:py-3 ${isScrolled || isMobileMenuOpen
          ? "border-primary/10 bg-background/80 shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent"
          }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-4xl font-black tracking-tighter text-primary uppercase">COKKIRI</span>
            <span className="mt-1 mb-auto ml-1 text-sm font-black tracking-widest text-primary/50 uppercase transition-colors duration-500 group-hover:text-primary">
              © 26
            </span>
          </Link>

          <div className="flex items-center gap-10">
            <nav className="hidden items-center gap-8 md:flex lg:gap-10" aria-label="Main">
              {navItems.map((item) => {
                if ("children" in item) {
                  const active = itemActive(pathname, item);
                  const menuOpen = desktopOpenMenu === item.name;
                  return (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => setDesktopOpenMenu(item.name)}
                      onMouseLeave={() => setDesktopOpenMenu(null)}
                      onFocus={() => setDesktopOpenMenu(item.name)}
                      onBlur={(e) => {
                        const next = e.relatedTarget;
                        if (next instanceof Node && e.currentTarget.contains(next)) return;
                        setDesktopOpenMenu(null);
                      }}
                    >
                      <span
                        className={cn(
                          "inline-flex cursor-default items-center gap-1 text-base font-black tracking-widest text-primary uppercase transition-all duration-500",
                          active || menuOpen ? "opacity-100" : "opacity-40 hover:opacity-100",
                        )}
                        tabIndex={0}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                      >
                        {item.name}
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 opacity-60 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] md:size-[1.125rem]",
                            menuOpen && "rotate-180",
                          )}
                        />
                      </span>
                      <AnimatePresence>
                        {menuOpen && (
                          <motion.div
                            key={`menu-${item.name}`}
                            role="menu"
                            aria-label={`${item.name} 하위 메뉴`}
                            className="absolute top-full left-1/2 z-[110] flex flex-col items-center pt-2.5"
                            style={{ transformOrigin: "top center" }}
                            variants={dropdownPanelVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                          >
                            {/*
                              트리거와 패널 사이 margin 대신 상단 padding으로 간격을 주면,
                              그 영역도 이 노드의 히트 박스에 포함되어 마우스 이동 시 mouseleave가 끊기지 않음.
                            */}
                            <motion.div
                              className={cn(
                                "flex w-[10.5rem] flex-col gap-1.5 rounded-3xl border-2 border-stone-200/70 bg-stone-50/98 p-3 shadow-md backdrop-blur-md md:w-44 md:gap-2 md:p-3.5 dark:border-stone-600/50 dark:bg-stone-900/95",
                              )}
                              variants={dropdownPanelShellVariants}
                            >
                              {item.children.map((child) => (
                                <motion.div key={child.path} variants={dropdownLinkVariants} className="w-full">
                                  <Link
                                    href={child.path}
                                    className={subLinkClass(pathActive(pathname, child.path))}
                                    role="menuitem"
                                  >
                                    {child.name}
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                const active = pathActive(pathname, item.path);
                return (
                  <Link key={item.name} href={item.path} className={linkClass(active)}>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4 border-l border-primary/10 pl-4 md:gap-5 md:pl-5">
              <Link href="/profile" className="hidden md:block">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 rounded-full text-primary transition-all duration-500 hover:bg-primary/5 md:h-14 md:w-14"
                  aria-label="Profile"
                >
                  <User className="h-7 w-7 md:h-8 md:w-8" />
                </Button>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 text-primary transition-all duration-500 hover:bg-primary/5 md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
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
                      <X className="h-7 w-7" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-7 w-7" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[99] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden
            />

            <motion.nav
              className="absolute top-[56px] right-0 left-0 max-h-[calc(100dvh-56px)] overflow-y-auto border-b border-primary/10 bg-background/95 shadow-xl backdrop-blur-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Mobile main"
            >
              <div className="space-y-1 px-6 py-6">
                {navItems.map((item, index) => {
                  if ("children" in item) {
                    const open = openMobileSection === item.name;
                    const sectionActive = itemActive(pathname, item);
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.35 }}
                        className="border-b border-primary/5"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenMobileSection(open ? null : item.name)}
                          className={cn(
                            "flex w-full items-center justify-between py-4 text-left text-xl font-black tracking-[0.2em] uppercase transition-colors",
                            sectionActive ? "text-primary" : "text-primary/40",
                          )}
                          aria-expanded={open}
                        >
                          {item.name}
                          <ChevronDown
                            className={cn("size-5 shrink-0 transition-transform duration-300", open && "rotate-180")}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <ul className="space-y-1.5 pb-5 pl-2">
                                {item.children.map((child) => {
                                  const active = pathActive(pathname, child.path);
                                  return (
                                    <li key={child.path}>
                                      <Link
                                        href={child.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                          "block rounded-lg py-3.5 pl-5 text-base font-black tracking-[0.22em] uppercase transition-colors",
                                          active
                                            ? "border-l-2 border-l-secondary bg-primary/5 text-primary"
                                            : "text-primary/50 hover:text-primary",
                                        )}
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }

                  const active = pathActive(pathname, item.path);
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.35 }}
                    >
                      <Link
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "block border-b border-primary/5 py-4 text-xl font-black tracking-[0.2em] uppercase transition-all duration-300",
                          active
                            ? "border-l-2 border-l-secondary pl-4 text-primary"
                            : "text-primary/40 hover:pl-4 hover:text-primary",
                        )}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
