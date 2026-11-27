/**
 * @file packages/ui/src/index.ts
 * @description Public atomic UI components and @yuva-devlab/ui primitives for DevLab AI Studio.
 * @module @devlab-ai-studio/ui
 */

export * from "./components/studio-drawer";
export * from "./components/studio-entity-row";
export * from "./components/studio-form-field";
export * from "./components/studio-kpi-card";
export * from "./components/studio-latency-histogram";
export * from "./components/studio-model-bars";
export * from "./components/studio-page-header";
export * from "./components/studio-panel";
export * from "./components/studio-provider-card";
export * from "./components/studio-runs-table";
export * from "./components/studio-select-field";
export * from "./components/studio-status-pill";
export * from "./components/studio-stream-viewer";
export * from "./components/studio-ui.enums";

export {
  Badge,
  type BadgeProps,
  Button,
  type ButtonProps,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CopyButton,
  EmptyState,
  Input,
  Label,
  LoadingState,
  MetricCard,
  PasswordInput,
  SearchInput,
  SecretRevealCard,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  ThemeProvider,
  Toaster,
  toast,
  useTheme,
} from "@yuva-devlab/ui";

/** Lucide icons used across DevLab AI Studio — import from here, not directly from lucide-react. */
export {
  Activity,
  AppWindow,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Copy,
  Cpu,
  Download,
  Ellipsis,
  ExternalLink,
  Hexagon,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Moon,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Server,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Terminal,
  ToggleLeft,
  Trash2,
  UserRound,
  Workflow,
  X,
} from "lucide-react";
