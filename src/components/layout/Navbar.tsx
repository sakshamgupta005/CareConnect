import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import { navLinks } from "../../data/mock";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-primary">CareConnect AI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href ? "text-primary" : "text-slate-600",
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/doctor" className="text-sm font-medium text-slate-600 hover:text-primary">
            Doctor Portal
          </Link>
          <Link to="/contact">
            <Button size="sm">Request Demo</Button>
          </Link>
        </nav>

        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-slate-100 text-primary"
                    : "text-slate-700 hover:bg-slate-100",
                )}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/doctor"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={closeMenu}
            >
              Doctor Portal
            </Link>
            <Link to="/contact" onClick={closeMenu} className="pt-2">
              <Button className="w-full">Request Demo</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
