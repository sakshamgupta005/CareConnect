import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import LandingPage from "./app/page";
import ProductPage from "./app/product/page";
import DoctorDashboard from "./app/doctor/page";
import PatientDashboard from "./app/patient/page";
import AboutPage from "./app/about/page";
import ContactPage from "./app/contact/page";
import CollaborationWorkspace from "./app/doctor/collaboration/page";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/collaboration" element={<CollaborationWorkspace />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
