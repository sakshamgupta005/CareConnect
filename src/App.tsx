import { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import LoginPage from "./app/login/page";
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
import DoctorFaqManagementPage from "./app/doctor/faqs/page";
import DoctorReportDetailsPage from "./app/doctor/reports/report-detail-page";
import PatientReportDetailsPage from "./app/patient/reports/report-detail-page";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
  type AuthSession,
  type UserRole,
  validateLoginPassword,
} from "./lib/auth";
import {
  applyThemeToDocument,
  loadThemePreference,
  saveThemePreference,
  startThemeTransition,
  type ThemeMode,
} from "./lib/theme";

function getDefaultRouteForRole(role: UserRole): string {
  return role === "doctor" ? "/doctor" : "/patient";
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isDoctorOnlyRoute(pathname: string): boolean {
  return matchesPrefix(pathname, "/doctor") || matchesPrefix(pathname, "/doctor-workspace");
}

function isPatientOnlyRoute(pathname: string): boolean {
  return matchesPrefix(pathname, "/patient") || matchesPrefix(pathname, "/patient-assistant");
}

function getRouteGuardRedirect(pathname: string, session: AuthSession | null): string | null {
  if (!session && pathname !== "/login") {
    return "/login";
  }

  if (!session) {
    return null;
  }

  if (pathname === "/login" || pathname === "/") {
    return getDefaultRouteForRole(session.role);
  }

  if (session.role === "doctor" && isPatientOnlyRoute(pathname)) {
    return "/doctor";
  }

  if (session.role === "patient" && isDoctorOnlyRoute(pathname)) {
    return "/patient";
  }

  return null;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(() => loadAuthSession());
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemePreference());

  useEffect(() => {
    const syncSession = () => setSession(loadAuthSession());
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: location.pathname === "/login" ? "auto" : "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    applyThemeToDocument(themeMode);
    saveThemePreference(themeMode);
  }, [themeMode]);

  const redirectPath = getRouteGuardRedirect(location.pathname, session);
  if (redirectPath && redirectPath !== location.pathname) {
    return <Navigate to={redirectPath} replace />;
  }

  const isLoginRoute = location.pathname === "/login";
  const showShell = Boolean(session) && !isLoginRoute;
  const toggleThemeMode = () => {
    startThemeTransition();
    setThemeMode((currentMode) => (currentMode === "light" ? "dark" : "light"));
  };

  const handleLogin = (input: { username: string; password: string; role: UserRole }): boolean => {
    if (!validateLoginPassword(input.password)) {
      return false;
    }

    const nextSession: AuthSession = {
      username: input.username,
      role: input.role,
      loggedInAt: Date.now(),
    };

    saveAuthSession(nextSession);
    setSession(nextSession);
    navigate(getDefaultRouteForRole(input.role), { replace: true });
    return true;
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!showShell ? (
        <div className="fixed right-4 top-4 z-[72] sm:right-6 sm:top-5">
          <ThemeToggle mode={themeMode} onToggle={toggleThemeMode} />
        </div>
      ) : null}
      {showShell ? (
        <Navbar
          session={session as AuthSession}
          onLogout={handleLogout}
          themeMode={themeMode}
          onToggleTheme={toggleThemeMode}
        />
      ) : null}
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={
              themeMode === "dark"
                ? { opacity: 0, y: 10, scale: 0.995 }
                : { opacity: 0, y: 16, filter: "blur(6px)" }
            }
            animate={
              themeMode === "dark"
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            exit={
              themeMode === "dark"
                ? { opacity: 0, y: -8, scale: 0.997 }
                : { opacity: 0, y: -10, filter: "blur(4px)" }
            }
            transition={{ duration: themeMode === "dark" ? 0.5 : 0.44, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/faqs" element={<DoctorFaqManagementPage />} />
              <Route path="/doctor/reports/:reportId" element={<DoctorReportDetailsPage />} />
              <Route path="/doctor/collaboration" element={<CollaborationWorkspace />} />
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/reports/:reportId" element={<PatientReportDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/patient-assistant" element={<PatientAssistantPage />} />
              <Route path="/doctor-workspace" element={<DoctorWorkspacePage />} />
              <Route path="/trust-and-compliance" element={<TrustAndCompliancePage />} />
              <Route path="*" element={<Navigate to={session ? getDefaultRouteForRole(session.role) : "/login"} replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {showShell ? <Footer /> : null}
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
