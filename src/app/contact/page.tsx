import { type FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Link2, Mail, MapPin, MessageCircle, Phone, Share2 } from "lucide-react";
import { Button } from "../../components/ui/Button";

const SITE_URL = "https://CareConnect.com";
const QR_IMAGE_URL =
  "https://res.cloudinary.com/dyxlavy0j/image/upload/v1775298105/WhatsApp_Image_2026-04-04_at_3.49.17_PM_ss4a3g.jpg";
const LOGIN_STORAGE_KEY = "careconnect_logged_in";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsLoggedIn(window.localStorage.getItem(LOGIN_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (shareState === "idle") return;
    const timer = window.setTimeout(() => setShareState("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [shareState]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleLoginStatusChange = (checked: boolean) => {
    setIsLoggedIn(checked);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOGIN_STORAGE_KEY, checked ? "true" : "false");
    }
  };

  const getQrLinkText = () => `QR Image Link: ${QR_IMAGE_URL}\nWebsite Link: ${SITE_URL}`;

  const getAutoMessageText = () => {
    if (!isLoggedIn) {
      return "CareConnect AI explains doctor-uploaded reports clearly.\nPlease log in first, then ask your report questions again.";
    }

    return "CareConnect AI helps patients understand uploaded medical reports.\nTry asking: What does low hemoglobin mean? Why is vitamin D low? What does high cholesterol mean?";
  };

  const getCombinedShareText = () => `${getQrLinkText()}\n\n${getAutoMessageText()}`;

  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(
    getCombinedShareText(),
  )}`;

  const handleNativeShare = async () => {
    const shareText = getCombinedShareText();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "CareConnect AI",
          text: shareText,
          url: SITE_URL,
        });
        setShareState("shared");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  };

  const handleCopyQrLinkText = async () => {
    try {
      await navigator.clipboard.writeText(getQrLinkText());
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  };

  const handleCopyAutoMessageText = async () => {
    try {
      await navigator.clipboard.writeText(getAutoMessageText());
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  };

  return (
    <div className="bg-slate-50 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">We are here to help</h1>
          <p className="max-w-3xl text-slate-600">
            Reach out for a demo, integration planning, or onboarding support.
          </p>
        </motion.section>

        <section className="grid gap-8 lg:grid-cols-2">
          <motion.aside
            initial={{ opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -2 }}
            className="card p-7 sm:p-9"
          >
            <h2 className="text-lg font-semibold text-slate-900">Contact information</h2>
            <div className="mt-6 space-y-5 text-sm text-slate-700">
              {[
                { icon: Mail, text: "sakshamgupta0295@gmil.com" },
                { icon: Phone, text: "7986547697" },
                { icon: MapPin, text: "Ranjit Avenue, Amritsar, Punjab, India" },
              ].map((item, index) => (
                <motion.p
                  key={item.text}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + index * 0.06, duration: 0.28 }}
                  whileHover={{ x: 3 }}
                  className="flex items-start gap-3.5 leading-relaxed"
                >
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span className="break-words">{item.text}</span>
                </motion.p>
              ))}
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -2 }}
            className="card overflow-hidden p-7 sm:p-9"
          >
            <AnimatePresence mode="wait" initial={false}>
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="space-y-4 py-2 text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <CheckCircle2 className="mx-auto h-10 w-10 text-secondary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-900">Message sent</h3>
                  <p className="text-sm text-slate-600">
                    Thank you. Our team will get back to you shortly.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                  onSubmit={handleSubmit}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.22 }}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Name</span>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Email</span>
                      <input
                        required
                        type="email"
                        placeholder="john@hospital.com"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                  </motion.div>

                  <motion.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.22 }}
                    className="space-y-1.5 text-sm text-slate-700"
                  >
                    <span>Role</span>
                    <select className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none">
                      <option>Hospital Administrator</option>
                      <option>Healthcare Provider</option>
                      <option>Clinical Researcher</option>
                      <option>Other</option>
                    </select>
                  </motion.label>

                  <motion.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14, duration: 0.22 }}
                    className="space-y-1.5 text-sm text-slate-700"
                  >
                    <span>Message</span>
                    <textarea
                      required
                      rows={5}
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                    />
                  </motion.label>

                  <Button type="submit" className="w-full">Send Message</Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="card overflow-hidden p-7 sm:p-9"
        >
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
                <img
                  src={QR_IMAGE_URL}
                  alt="CareConnect QR code"
                  className="h-auto w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
              <a
                href={QR_IMAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
              >
                <Link2 className="h-4 w-4" />
                Open QR image
              </a>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  Scan and Share
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">CareConnect QR Access</h2>
                <p className="text-sm text-slate-600">
                  Scan this code to open <span className="font-medium text-slate-900">{SITE_URL}</span>. You can also share it directly with WhatsApp or other apps.
                </p>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isLoggedIn}
                  onChange={(event) => handleLoginStatusChange(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-secondary focus:ring-secondary"
                />
                Logged in user mode for share message
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <a href={whatsappShareLink} target="_blank" rel="noreferrer" className="sm:col-span-2">
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4" />
                    Share on WhatsApp
                  </Button>
                </a>
                <Button variant="outline" onClick={handleNativeShare}>
                  <Share2 className="h-4 w-4" />
                  Share to Other Apps
                </Button>
                <Button variant="ghost" onClick={handleCopyQrLinkText}>
                  Copy QR Link Text
                </Button>
                <Button variant="ghost" onClick={handleCopyAutoMessageText}>
                  Copy Auto Message
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">QR and website link text</p>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">{getQrLinkText()}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Automatic message text</p>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">{getAutoMessageText()}</p>
                </div>
              </div>

              {shareState !== "idle" ? (
                <p className="text-xs font-medium text-secondary">
                  {shareState === "copied" && "Share text copied to clipboard."}
                  {shareState === "shared" && "Shared successfully."}
                  {shareState === "error" && "Could not share. Please try again."}
                </p>
              ) : null}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
