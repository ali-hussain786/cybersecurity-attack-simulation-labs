import {
  Activity,
  BarChart3,
  Bug,
  FileText,
  FolderOpen,
  Gauge,
  KeyRound,
  Network,
  ScanLine,
  Settings,
  Shield,
} from "lucide-react";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "network", label: "Network Discovery", icon: Network },
  { id: "victims", label: "Victim Management", icon: Bug },
  { id: "scanner", label: "Port Scanner", icon: ScanLine },
  { id: "attack", label: "Ransomware Attack", icon: Shield },
  { id: "recovery", label: "Recovery", icon: KeyRound },
  { id: "files", label: "File Manager", icon: FolderOpen },
  { id: "logs", label: "Logs & Monitoring", icon: Activity },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="cyberlab-mark">
          <div className="cyberlab-mark-inner">
            <Shield size={23} strokeWidth={2.2} />
          </div>
        </div>

        <div className="brand-copy">
          <div className="brand-name">CYBERLAB</div>
          <div className="brand-tagline">ATTACK SIMULATION</div>
        </div>
      </div>

      <div className="sidebar-section-label">OPERATIONS</div>

      <nav className="sidebar-nav">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-link ${activePage === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={17} strokeWidth={1.9} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-system">
          <span className="system-indicator" />
          <div>
            <strong>LAB ONLINE</strong>
            <span>Controlled environment</span>
          </div>
        </div>

        <div className="sidebar-version">
          CYBERLAB <span>v2.0</span>
        </div>
      </div>
    </aside>
  );
}
