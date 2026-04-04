import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Activity, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { navLinks } from "../../data/mock";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 h-20 flex items-center justify-between",
        isScrolled ? "bg-white/80 backdrop-blur-xl shadow-sm h-16" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black font-headline tracking-tighter text-primary">
            MediBridge AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-secondary",
                location.pathname === link.href ? "text-secondary" : "text-slate-500"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-4 w-px bg-slate-200" />
          <Link to="/doctor" className="text-sm font-medium text-slate-500 hover:text-primary">
            Doctor Portal
          </Link>
          <Button size="sm" onClick={() => (window.location.href = "/contact")}>
            Request Demo
          </Button>
        </nav>

        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-6 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-lg font-semibold text-slate-900 flex items-center justify-between"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
              ))}
              <hr className="border-slate-100" />
              <Link
                to="/doctor"
                className="text-lg font-semibold text-slate-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Doctor Portal
              </Link>
              <Button className="w-full" onClick={() => (window.location.href = "/contact")}>
                Request Demo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
