import {
  CheckCircle2,
  CircleDot,
  XCircle,
} from "lucide-react";

export default function StatusBadge({ status = "offline", label }) {
  const normalized = String(status).toLowerCase();

  const isOnline =
    normalized.includes("up") ||
    normalized.includes("online") ||
    normalized.includes("open") ||
    normalized.includes("running");

  const isOffline =
    normalized.includes("down") ||
    normalized.includes("offline") ||
    normalized.includes("closed") ||
    normalized.includes("exited");

  let variant = "offline";
  let Icon = CircleDot;
  let defaultLabel = "UNKNOWN";

  if (isOnline) {
    variant = "online";
    Icon = CheckCircle2;
    defaultLabel = "ONLINE";
  } else if (isOffline) {
    variant = "offline";
    Icon = XCircle;
    defaultLabel = "OFFLINE";
  }

  return (
    <span className={`status-badge ${variant}`}>
      <Icon size={10} />
      {label || defaultLabel}
    </span>
  );
}
