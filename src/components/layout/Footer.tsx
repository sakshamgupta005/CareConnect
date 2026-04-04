import { Link } from "react-router-dom";
import { Activity, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-slate-200 bg-white"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <motion.div className="space-y-3" whileHover={{ y: -2 }} transition={{ duration: 0.25 }}>
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: -7, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 340, damping: 16 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
            >
              <Activity className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-lg font-bold text-primary">CareConnect AI</span>
          </Link>
          <p className="text-sm text-slate-600">
            A simple platform to help patients understand care and help doctors collaborate.
          </p>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.4 }}
        >
          <h4 className="text-sm font-semibold text-slate-900">Quick Links</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            <Link to="/product" className="hover:text-primary">Product</Link>
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
            <Link to="/doctor" className="hover:text-primary">Doctor Portal</Link>
          </div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12, duration: 0.4 }}
        >
          <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> hello@careconnect.ai
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +1 (555) 123-4567
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> San Francisco, CA
            </p>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center">
          <p>© {year} CareConnect AI. Clinical decision support platform.</p>
          <p>For educational use only. Always consult a qualified medical professional.</p>
        </div>
      </div>
    </motion.footer>
  );
}
