import "dotenv/config";
import express from "express";
import aiRoutes from "./routes/aiRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Parse JSON request bodies.
app.use(express.json({ limit: "10mb" }));

// Health endpoint so you can quickly test whether the server is running.
app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "CareConnect AI Backend",
  });
});

// Main API routes.
app.use("/ai", aiRoutes);
app.use("/reports", reportRoutes);

// Backward-compatible aliases for existing frontend calls.
// These support URLs like /api/ask and /api/upload-report.
app.use("/api", aiRoutes);
app.use("/api", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  console.error("[server] Unhandled error:", error);
  const message = error instanceof Error ? error.message : "Internal server error.";
  res.status(500).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`CareConnect backend running on http://localhost:${PORT}`);
});
