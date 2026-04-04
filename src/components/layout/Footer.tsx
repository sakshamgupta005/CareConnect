import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
        <div className="md:col-span-4 space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black font-headline tracking-tighter text-primary">
              CareConnect AI
            </span>
          </Link>
          <p className="text-slate-500 leading-relaxed max-w-xs">
            Bridging the gap between medical knowledge and human understanding through intelligent, context-aware AI.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer">
              <Mail className="w-5 h-5 text-slate-400" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer">
              <Phone className="w-5 h-5 text-slate-400" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer">
              <MapPin className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h4 className="font-bold text-slate-900">Product</h4>
          <ul className="space-y-4 text-slate-500 text-sm">
            <li><Link to="/product" className="hover:text-secondary transition-colors">Features</Link></li>
            <li><Link to="/product" className="hover:text-secondary transition-colors">Patient AI</Link></li>
            <li><Link to="/product" className="hover:text-secondary transition-colors">Doctor Collab</Link></li>
            <li><Link to="/contact" className="hover:text-secondary transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h4 className="font-bold text-slate-900">Company</h4>
          <ul className="space-y-4 text-slate-500 text-sm">
            <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
            <li><Link to="/about" className="hover:text-secondary transition-colors">Mission</Link></li>
            <li><Link to="/about" className="hover:text-secondary transition-colors">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-6">
          <h4 className="font-bold text-slate-900">Medical Disclaimer</h4>
          <p className="text-slate-400 text-xs leading-loose uppercase tracking-tighter">
            CareConnect AI provides clinical support and information for educational purposes only. Always consult with a qualified healthcare professional for medical advice, diagnosis, or treatment.
          </p>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance</p>
            <div className="flex gap-4 items-center opacity-60">
              <span className="text-[10px] font-bold">HIPAA</span>
              <span className="text-[10px] font-bold">GDPR</span>
              <span className="text-[10px] font-bold">SOC-2</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-200/50 pt-12">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
          © 2024 CareConnect AI. Clinical Decision Support System.
        </p>
        <div className="flex gap-8 text-xs text-slate-400 font-medium uppercase tracking-widest">
          <Link to="#" className="hover:text-secondary transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-secondary transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-secondary transition-colors">Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}

