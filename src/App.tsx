import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import LandingPage from "./app/page";
import ProductPage from "./app/product/page";
import DoctorDashboard from "./app/doctor/page";
import PatientDashboard from "./app/patient/page";
import AboutPage from "./app/about/page";
import ContactPage from "./app/contact/page";
import CollaborationWorkspace from "./app/doctor/collaboration/page";
import PatientAssistantPage from "./app/patient-assistant/page";
import DoctorWorkspacePage from "./app/doctor-workspace/page";
import TrustAndCompliancePage from "./app/trust-and-compliance/page";

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(5px)" }}
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/collaboration" element={<CollaborationWorkspace />} />
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/patient-assistant" element={<PatientAssistantPage />} />
              <Route path="/doctor-workspace" element={<DoctorWorkspacePage />} />
              <Route path="/trust-and-compliance" element={<TrustAndCompliancePage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
