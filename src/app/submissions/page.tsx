"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, User, Calendar, MessageSquare, Loader, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { deleteContactSubmission, listContactSubmissions, type ContactSubmissionRecord } from "../../lib/contactApi";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await listContactSubmissions();
        setSubmissions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load submissions");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubmissions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    setError("");
    setDeletingId(submissionId);

    try {
      await deleteContactSubmission(submissionId);
      setSubmissions((current) => current.filter((item) => item.id !== submissionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete submission");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Contact Submissions</h1>
          <p className="text-slate-600 dark:text-slate-400">Private doctor view for all contact form submissions</p>
          <Link to="/doctor" className="inline-flex mt-4">
            <Button size="sm" variant="outline">Back to Doctor Dashboard</Button>
          </Link>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading submissions...</p>
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
          >
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </motion.div>
        )}

        {!isLoading && submissions.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-500 dark:text-slate-400 text-lg">No submissions yet</p>
          </motion.div>
        )}

        {!isLoading && submissions.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Total submissions: <span className="font-bold text-slate-900 dark:text-white">{submissions.length}</span>
            </p>

            {submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Header with Name and Date */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{submission.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(submission.createdAt)}
                    </div>
                  </div>

                  <div className="mb-4 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleDeleteSubmission(submission.id)}
                      disabled={deletingId === submission.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === submission.id ? "Removing..." : "Remove"}
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <a href={`mailto:${submission.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 break-all">
                        {submission.email}
                      </a>
                    </div>
                    {submission.phone && (
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <a href={`tel:${submission.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {submission.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Message</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded p-3 text-sm leading-relaxed">
                      {submission.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
