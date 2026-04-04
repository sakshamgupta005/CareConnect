import { motion } from "motion/react";
import { CheckCircle2, FileCheck, Lock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export default function TrustAndCompliancePage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.48 }}
          className="space-y-3"
        >
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            Feature Detail
          </p>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Trust and Compliance</h1>
          <p className="text-slate-600">
            Privacy and security controls for every AI chat space in the project.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.36 }}
          className="card p-6 sm:p-7"
        >
          <h2 className="text-lg font-semibold text-slate-900">Security foundations</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {[
              { icon: Lock, text: "Encryption for sensitive clinical data handling" },
              { icon: ShieldCheck, text: "Role-based access and controlled data visibility" },
              { icon: FileCheck, text: "Traceable chat workflows for governance teams" },
            ].map((item, index) => (
              <motion.li
                key={item.text}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * index, duration: 0.26 }}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4 text-secondary" />
                {item.text}
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.38 }}
          className="card p-6 sm:p-7"
        >
          <h2 className="text-lg font-semibold text-slate-900">Compliance focus</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {[
              "Supports HIPAA-oriented data practices",
              "Aligns with privacy-first architecture patterns",
              "Designed for policy review and operational controls",
            ].map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index, duration: 0.24 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }} className="flex flex-wrap gap-3">
          <Link to="/about">
            <Button>Learn More About Us</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
