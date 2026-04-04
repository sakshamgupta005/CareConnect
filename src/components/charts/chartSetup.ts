import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";

let chartSetupComplete = false;

export function ensureChartSetup(): void {
  if (chartSetupComplete) {
    return;
  }

  ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);
  ChartJS.defaults.font.family = '"Inter", ui-sans-serif, system-ui, sans-serif';
  ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
  ChartJS.defaults.plugins.tooltip.backgroundColor = "#0f172a";
  ChartJS.defaults.plugins.tooltip.titleColor = "#f8fafc";
  ChartJS.defaults.plugins.tooltip.bodyColor = "#e2e8f0";
  ChartJS.defaults.plugins.tooltip.padding = 12;

  chartSetupComplete = true;
}
