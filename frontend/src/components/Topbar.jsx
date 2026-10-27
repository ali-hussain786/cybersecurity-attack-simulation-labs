import {
  Bell,
  Clock3,
  Container,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Topbar({
  title,
  subtitle,
  dockerConnected,
  onRefresh,
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <div className="topbar-breadcrumb">
          CYBERLAB <span>/</span> SECURITY OPERATIONS
        </div>

        <div className="topbar-title">{title}</div>
        <div className="topbar-subtitle">{subtitle}</div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-time">
          <Clock3 size={14} />
          <span>
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        <div className={`docker-status ${dockerConnected ? "online" : "offline"}`}>
          <Container size={15} />
          <span>DOCKER</span>
          <i />
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onRefresh}
          title="Refresh laboratory"
        >
          <RefreshCw size={16} />
        </button>

        <button type="button" className="icon-button" title="Notifications">
          <Bell size={16} />
          <span className="notification-dot" />
        </button>
      </div>
    </header>
  );
}
