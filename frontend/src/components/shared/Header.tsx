"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

type NavChild = {
  name: string;
  path?: string;
  action?: "logout";
  children?: { name: string; path: string }[];
};

type NavLinkItem = { name: string; path: string; action?: "logout" };
type NavMenuItem = { name: string; children: NavChild[] };
type NavItem = NavLinkItem | NavMenuItem;

/** 순서: Home → Space → Community → My */
const navItems: NavItem[] = [
  { name: "Home", path: "/" },
  {
    name: "Space",
    children: [
      { name: "룸 둘러보기", path: "/rooms" },
      { name: "시설 둘러보기", path: "/experience" },
      { name: "층별 안내", path: "/floor" },
      { name: "예약 시설", path: "/facilities" },
    ],
  },
  { name: "Community", path: "/community" },
  {
    name: "My",
    children: [
      { name: "프로필", path: "/profile" },
      {
        name: "히스토리",
        children: [
          { name: "계약 내역", path: "/my-contracts" },
          { name: "예약 내역", path: "/my-history/reservation" },
        ],
      },
      {
        name: "커뮤니티",
        children: [
          { name: "나의 민원", path: "/vocs" },
          { name: "나의 게시글", path: "/my-posts" },
        ],
      },
      { name: "스마트홈 기기", path: "/my-devices" },
      { name: "알림", path: "/notifications" },
      { name: "로그아웃", path: "#", action: "logout" },
    ],
  },
];

function pathActive(pathname: string, path: string) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function childListActive(pathname: string, children: NavChild[]) {
  return children.some((c) => {
    if (c.path && pathActive(pathname, c.path)) return true;
    if (c.children && c.children.some((sub) => pathActive(pathname, sub.path))) return true;
    return false;
  });
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
  const { user, isLoggedIn, isLoading, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const [desktopOpenMenu, setDesktopOpenMenu] = useState<string | null>(null);
  const [desktopOpenSubMenu, setDesktopOpenSubMenu] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMobileSection(null);
    setDesktopOpenMenu(null);
    setDesktopOpenSubMenu(null);
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
      "inline-flex items-center leading-none text-[clamp(0.75rem,1.2vw,1rem)] font-black tracking-widest text-primary uppercase transition-all duration-500 hover:underline hover:underline-offset-8",
      active ? "underline underline-offset-8 opacity-100" : "opacity-100",
    );

  /** `compact`: My 메뉴 등 항목이 많을 때 드롭다운 글자만 살짝 축소 */
  const subLinkClass = (active: boolean, compact?: boolean) =>
    cn(
      "flex w-full items-center justify-center text-center text-balance whitespace-nowrap rounded-md font-black text-primary uppercase transition-colors hover:bg-primary/5",
      compact
        ? "py-2 text-xs tracking-[0.12em] md:py-2.5 md:text-[0.8125rem] md:tracking-[0.14em]"
        : "py-2.5 text-sm tracking-[0.16em] md:py-3 md:text-[0.95rem] md:tracking-[0.18em]",
      active ? "bg-primary/10 text-primary" : "text-primary/70",
    );

  return (
    <>
      <motion.header
        className={`sticky top-0 z-[100] border-b px-[clamp(1rem,3vw,3rem)] py-[clamp(0.375rem,0.8vw,0.75rem)] transition-all duration-500 ${isScrolled || isMobileMenuOpen
          ? "border-primary/10 bg-background/80 shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent"
          }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-black tracking-tighter text-primary uppercase">COKKIRI</span>
            <span className="mt-1 mb-auto ml-1 text-[clamp(0.55rem,1vw,0.875rem)] font-black tracking-widest text-primary/50 uppercase transition-colors duration-500 group-hover:text-primary">
              © 26
            </span>
          </Link>

          <div className="flex items-center gap-[clamp(1rem,2.5vw,2.5rem)]">
            <nav className="hidden items-center gap-[clamp(1rem,2vw,2.5rem)] md:flex" aria-label="Main">
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
                          "inline-flex cursor-default items-center leading-none gap-1 text-[clamp(0.75rem,1.2vw,1rem)] font-black tracking-widest text-primary uppercase transition-all duration-500 hover:underline hover:underline-offset-8",
                          active || menuOpen ? "underline underline-offset-8 opacity-100" : "opacity-100",
                        )}
                        tabIndex={0}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                      >
                        {item.name}
                        <ChevronDown
                          className={cn(
                            "size-[1em] shrink-0 opacity-60 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
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
                            <motion.div
                              className={cn(
                                "flex w-[10.5rem] flex-col gap-1.5 rounded-3xl border-2 border-stone-200/70 bg-stone-50/98 p-3 shadow-md backdrop-blur-md md:w-52 md:gap-2 md:p-3.5 dark:border-stone-600/50 dark:bg-stone-900/95",
                              )}
                              variants={dropdownPanelShellVariants}
                            >
                              {item.children.map((child) => (
                                <motion.div
                                  key={child.name}
                                  variants={dropdownLinkVariants}
                                  className="group relative w-full"
                                  onMouseEnter={() => child.children && setDesktopOpenSubMenu(child.name)}
                                  onMouseLeave={() => child.children && setDesktopOpenSubMenu(null)}
                                >
                                  {child.children ? (
                                    <>
                                      <div
                                        className={cn(
                                          subLinkClass(false, false),
                                          "justify-between px-3 text-primary/70 group-hover:text-primary group-hover:bg-primary/5 cursor-default"
                                        )}
                                      >
                                        <span className="flex-1 text-center pl-4">{child.name}</span>
                                        <ChevronDown className="size-3 -rotate-90 opacity-90 transition-transform group-hover:opacity-100" />
                                      </div>
                                      <AnimatePresence>
                                        {desktopOpenSubMenu === child.name && (
                                          <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute left-[calc(100%+0.5rem)] top-0 z-[120] flex w-48 flex-col gap-1.5 rounded-3xl border-2 border-stone-200/70 bg-stone-50/98 p-3 shadow-xl backdrop-blur-md dark:border-stone-600/50 dark:bg-stone-900/95"
                                          >
                                            <div className="flex flex-col gap-1">
                                              {child.children.map((sub) => (
                                                <Link
                                                  key={sub.name}
                                                  href={sub.path}
                                                  className={subLinkClass(pathActive(pathname, sub.path), false)}
                                                  role="menuitem"
                                                >
                                                  {sub.name}
                                                </Link>
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </>
                                  ) : child.path ? (
                                    <Link
                                      href={child.path}
                                      onClick={
                                        child.action === "logout"
                                          ? async (e) => {
                                            e.preventDefault();
                                            await logout();
                                            setDesktopOpenMenu(null);
                                          }
                                          : undefined
                                      }
                                      className={subLinkClass(
                                        pathActive(pathname, child.path),
                                        false,
                                      )}
                                      role="menuitem"
                                    >
                                      {child.name}
                                    </Link>
                                  ) : null}
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
              {!isLoading && (
                isLoggedIn ? (
                  <div className="hidden md:flex items-center gap-3 group">
                    <div className="flex flex-col items-end pt-1 mr-1.5 cursor-default">
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/40 -mb-0.5">{user?.role === 'USER' ? 'GUEST' : user?.role || ''}</span>
                      <span className="text-[15px] font-black tracking-tight text-primary transition-colors">{user?.name}님</span>
                    </div>
                    <Link href="/profile" className="shrink-0 relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-11 w-11 overflow-hidden rounded-[1rem] border-2 border-primary/10 bg-primary/5 p-0 text-primary transition-all duration-500 group-hover:scale-105 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:shadow-sm md:h-12 md:w-12"
                        aria-label="Profile"
                      >
                        {user?.profileImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 md:h-6 md:w-6 opacity-70" />
                        )}
                      </Button>
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-[#768064]" />
                    </Link>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" className="rounded-full text-primary hover:bg-primary/5 px-5 font-black uppercase tracking-widest text-[11px] h-10">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="rounded-full bg-primary text-background hover:bg-primary/90 px-6 font-black uppercase tracking-widest text-[11px] h-10 shadow-sm border border-primary/20">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )
              )}
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
                                  if (child.children) {
                                    const subOpen = openMobileSection === `sub-${child.name}`;
                                    return (
                                      <li key={child.name} className="py-1">
                                        <button
                                          type="button"
                                          onClick={() => setOpenMobileSection(subOpen ? null : `sub-${child.name}`)}
                                          className="flex w-full items-center justify-between px-5 py-3 text-sm font-black text-primary/40 uppercase tracking-[0.18em]"
                                        >
                                          {child.name}
                                          <ChevronDown className={cn("size-4 transition-transform", subOpen && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                          {subOpen && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="overflow-hidden bg-primary/5"
                                            >
                                              <ul className="space-y-1 py-2">
                                                {child.children.map((sub) => (
                                                  <li key={sub.path}>
                                                    <Link
                                                      href={sub.path}
                                                      onClick={() => setIsMobileMenuOpen(false)}
                                                      className={cn(
                                                        "block py-2.5 pl-10 text-[13px] font-black uppercase tracking-[0.15em]",
                                                        pathActive(pathname, sub.path)
                                                          ? "text-primary"
                                                          : "text-primary/50"
                                                      )}
                                                    >
                                                      {sub.name}
                                                    </Link>
                                                  </li>
                                                ))}
                                              </ul>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </li>
                                    );
                                  }
                                  const active = child.path ? pathActive(pathname, child.path) : false;
                                  return (
                                    <li key={child.path || child.name}>
                                      <Link
                                        href={child.path || "#"}
                                        onClick={
                                          child.action === "logout"
                                            ? async (e) => {
                                              e.preventDefault();
                                              await logout();
                                              setIsMobileMenuOpen(false);
                                            }
                                            : () => setIsMobileMenuOpen(false)
                                        }
                                        className={cn(
                                          "block rounded-lg py-3 pl-5 font-black uppercase transition-colors",
                                          item.name === "My"
                                            ? "text-sm tracking-[0.18em]"
                                            : "py-3.5 text-base tracking-[0.22em]",
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
