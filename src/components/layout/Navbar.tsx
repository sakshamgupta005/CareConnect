import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";
import { cn } from "../../lib/utils";
import { navLinks } from "../../data/mock";
import { type AuthSession } from "../../lib/auth";
import { type ThemeMode } from "../../lib/theme";

const topNavItem = {
  hidden: { opacity: 0, y: -8 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.05 + index * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

type NavbarProps = {
  session: AuthSession;
  onLogout: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
};

export function Navbar({ session, onLogout, themeMode, onToggleTheme }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const rolePortal = session.role === "doctor"
    ? { name: "Doctor Portal", href: "/doctor" }
    : { name: "Patient Portal", href: "/patient" };

  const closeMenu = () => setIsOpen(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 350, damping: 16 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
          >
            <Activity className="h-5 w-5 text-white" />
          </motion.div>
          <motion.span layout className="text-lg font-bold text-primary">
            CareConnect AI
          </motion.span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link, index) => (
            <motion.div key={link.name} custom={index} initial="hidden" animate="visible" variants={topNavItem}>
              <Link
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href ? "text-primary" : "text-slate-600",
                )}
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
          <motion.div custom={3} initial="hidden" animate="visible" variants={topNavItem}>
            <Link to={rolePortal.href} className="text-sm font-medium text-slate-600 hover:text-primary">
              {rolePortal.name}
            </Link>
          </motion.div>
          <motion.div custom={4} initial="hidden" animate="visible" variants={topNavItem}>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{session.username}</span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary">
                {session.role}
              </span>
            </div>
          </motion.div>
          <motion.div custom={5} initial="hidden" animate="visible" variants={topNavItem}>
            <Button size="sm" variant="outline" onClick={onLogout}>Logout</Button>
          </motion.div>
          <motion.div custom={6} initial="hidden" animate="visible" variants={topNavItem}>
            <Link to="/contact">
              <Button size="sm">Request Demo</Button>
            </Link>
          </motion.div>
          <motion.div custom={7} initial="hidden" animate="visible" variants={topNavItem}>
            <ThemeToggle mode={themeMode} onToggle={onToggleTheme} compact />
          </motion.div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle mode={themeMode} onToggle={onToggleTheme} compact />
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -60, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 60, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 60, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -60, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * index, duration: 0.22 }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname === link.href
                        ? "bg-slate-100 text-primary"
                        : "text-slate-700 hover:bg-slate-100",
                    )}
                    onClick={closeMenu}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16, duration: 0.22 }}>
                <Link
                  to={rolePortal.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={closeMenu}
                >
                  {rolePortal.name}
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.22 }}>
                <div className="mx-1 mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{session.username}</span>
                  <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary">
                    {session.role}
                  </span>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.22 }}>
                <Button variant="outline" className="w-full" onClick={() => {
                  closeMenu();
                  onLogout();
                }}>
                  Logout
                </Button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.24 }}>
                <Link to="/contact" onClick={closeMenu} className="block pt-2">
                  <Button className="w-full">Request Demo</Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
