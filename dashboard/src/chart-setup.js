import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);
