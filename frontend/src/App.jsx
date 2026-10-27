import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Cpu,
  Database,
  FileArchive,
  FileCheck2,
  FileLock2,
  FileSearch,
  FolderOpen,
  Globe2,
  HardDrive,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Monitor,
  Network,
  Play,
  Radar,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Square,
  Terminal,
  UserRound,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import "./App.css";
import { api } from "./services/api";

const NAV = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["network", "Network Discovery", Network],
  ["victims", "Victim Management", Server],
  ["scanner", "Port Scanner", ScanLine],
  ["attack", "Attack Configuration", ShieldAlert],
  ["files", "File Manager", FolderOpen],
  ["recovery", "File Recovery", RotateCcw],
  ["desktop", "Victim Desktop", Monitor],
  ["logs", "Container Logs", Terminal],
  ["reports", "Reports & Evidence", BarChart3],
  ["settings", "Lab Settings", Settings],
];

const PAGE_TITLES = {
  dashboard: ["Operations Dashboard", "Cybersecurity attack simulation control center"],
  network: ["Network Discovery", "Discover and map the isolated lab network"],
  victims: ["Victim Management", "Inspect discovered containers and select a lab target"],
  desktop: ["Victim Desktop", "Browser desktop for the isolated cybersecurity lab"],
  scanner: ["Port Scanner", "Inspect exposed services on the selected victim"],
  attack: ["Attack Configuration", "Controlled ransomware execution inside the isolated lab"],
  recovery: ["File Recovery", "Restore encrypted lab files using the verified recovery flow"],
  files: ["File Manager", "Observe protected files and their current state"],
  logs: ["Container Logs", "Current attacker and victim container output"],
  reports: ["Reports & Evidence", "Attack-cycle summary and operational evidence"],
  settings: ["Lab Settings", "CyberLab environment and interface configuration"],
};

function normalizeContainers(data) {
  const raw = data?.containers || data?.nodes || data?.data || [];
  return Array.isArray(raw) ? raw.map((c) => ({
    ...c,
    name: c.name || c.container || c.Names || c.Name || "unknown",
    id: c.id || c.ID || "",
    status: String(c.status || c.State || c.state || "").toLowerCase(),
    ip: c.ip || c.IP || c.ipAddress || null,
    reachable: c.reachable !== false,
  })) : [];
}

function fileArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.files)) return data.files;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function isLocked(data) {
  const files = fileArray(data);
  if (!files.length) return false;
  return files.some((f) =>
    String(f?.name || f?.path || f || "").endsWith(".locked")
  );
}

function fileCount(data) {
  return fileArray(data).length;
}

function cleanLogs(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split("\n").filter(Boolean);
  if (value?.logs) return cleanLogs(value.logs);
  if (value?.data) return cleanLogs(value.data);
  return [];
}

function currentSessionLogs(lines, type) {
  if (!lines.length) return [];

  const markers =
    type === "victim"
      ? [
          "ENCRYPTION REQUEST RECEIVED",
          "Target directory:",
          "Scanning target for runtime-created files"
        ]
      : [
          "Lab key:",
          "Sending attacker-controlled encryption key",
          "Victim encryption response:",
          "Encryption operation requested by attacker"
        ];

  let start = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = String(lines[i]);

    if (markers.some((marker) => line.includes(marker))) {
      start = i;
      break;
    }
  }

  return start >= 0 ? lines.slice(start) : [];
}

function nodeStatus(c) {
  const s = String(c.status || "").toLowerCase();
  if (s.includes("running") || s.includes("up") || s.includes("online")) return "running";
  return "stopped";
}

function Icon({ icon: I, size = 18 }) {
  return <I size={size} strokeWidth={1.8} />;
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Stat({ icon, label, value, detail, tone = "" }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon"><Icon icon={icon} /></div>
      <div className="stat-copy">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-detail">{detail}</div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const item = ([id, name, I]) => (
    <button
      key={id}
      className={`nav-item ${page === id ? "active" : ""}`}
      onClick={() => setPage(id)}
      title={collapsed ? name : undefined}
    >
      <Icon icon={I} />
      {!collapsed && <span>{name}</span>}
      {!collapsed && page === id && <ChevronRight size={15} className="nav-arrow" />}
    </button>
  );

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-mark">
          <div className="brand-core"><ShieldCheck size={23} /></div>
        </div>
        {!collapsed && (
          <div>
            <div className="brand-name">CYBERLAB</div>
            <div className="brand-sub">SECURITY OPERATIONS</div>
          </div>
        )}
      </div>

      <div className="side-section">
        {!collapsed && <div className="side-label">OPERATIONS</div>}
        {NAV.filter(([id]) => ["dashboard", "network", "victims", "scanner"].includes(id)).map(item)}
      </div>

      <div className="side-section">
        {!collapsed && <div className="side-label">RANSOMWARE SIMULATION</div>}
        {NAV.filter(([id]) => ["attack", "files", "recovery"].includes(id)).map(item)}
      </div>

      <div className="side-section">
        {!collapsed && <div className="side-label">LAB ACCESS</div>}
        {NAV.filter(([id]) => id === "desktop").map(item)}
      </div>

      <div className="side-section">
        {!collapsed && <div className="side-label">OBSERVABILITY</div>}
        {NAV.filter(([id]) => id === "logs").map(item)}
      </div>

      <div className="side-bottom">
        {NAV.filter(([id]) => ["reports", "settings"].includes(id)).map(item)}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={18} />
          {!collapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
function Topbar({ page, refresh, refreshing, onMenu }) {
  const [title, subtitle] = PAGE_TITLES[page];
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu" onClick={onMenu}><Menu size={20} /></button>
        <div>
          <div className="crumb">CYBERLAB / <span>{title.toUpperCase()}</span></div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="system-status">
          <span className="pulse-dot" />
          <span>LAB ONLINE</span>
        </div>
        <button className={`icon-btn ${refreshing ? "spinning" : ""}`} onClick={refresh}>
          <RefreshCw size={17} />
        </button>
        <button className="icon-btn"><Bell size={17} /></button>
        <div className="operator">
          <div className="operator-avatar"><UserRound size={16} /></div>
          <div>
            <strong>Operator</strong>
            <span>Local session</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Topology({ containers, selected, phase }) {
  const visible = containers.filter((c) => c.reachable !== false);
  const attacker = visible.find((c) => c.name === "attacker");
  const victim = visible.find((c) => c.name === "victim");
  const others = visible.filter((c) => !["attacker", "victim"].includes(c.name));

  const positions = [
    { x: 180, y: 115 },
    { x: 500, y: 75 },
    { x: 820, y: 115 },
    { x: 250, y: 290 },
    { x: 750, y: 290 },
    { x: 180, y: 445 },
    { x: 820, y: 445 },
  ];

  const nodes = [];
  if (attacker) nodes.push({ ...attacker, x: 180, y: 290, kind: "attacker" });
  if (victim) nodes.push({ ...victim, x: 820, y: 290, kind: "victim" });
  others.forEach((c, i) => nodes.push({ ...c, ...positions[i % positions.length], kind: "other" }));

  const activeTraffic =
    (phase === "attack-starting" ||
      phase === "attacking" ||
      phase === "attack-complete" ||
      phase === "recovering") &&
    attacker &&
    victim;

  return (
    <div className="topology-card">
      <div className="card-heading">
        <div>
          <span className="eyebrow">NETWORK VISUALIZATION</span>
          <h3>Live Lab Topology</h3>
        </div>
        <Badge tone={activeTraffic ? "danger" : "success"}>
          {activeTraffic
            ? phase === "recovering"
              ? "RECOVERY CHANNEL ACTIVE"
              : "ATTACK CHANNEL ACTIVE"
            : "MONITORED"}
        </Badge>
      </div>

      <div className="topology-wrap">
        <svg viewBox="0 0 1000 540" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <line x1="500" y1="270" x2="180" y2="290" className="link" />
          <line x1="500" y1="270" x2="820" y2="290" className="link" />

          {nodes.filter((n) => n.kind === "other").map((n) => (
            <line key={`l-${n.name}`} x1="500" y1="270" x2={n.x} y2={n.y} className="link" />
          ))}

          {activeTraffic && (
            <>
              <line
                x1={phase === "recovering" ? 820 : 180}
                y1="290"
                x2={phase === "recovering" ? 180 : 820}
                y2="290"
                className="traffic-glow"
              />

              <line
                x1={phase === "recovering" ? 820 : 180}
                y1="290"
                x2={phase === "recovering" ? 180 : 820}
                y2="290"
                className="traffic-line"
              />

              <text
                x="500"
                y="258"
                textAnchor="middle"
                className="traffic-label"
              >
                {phase === "recovering"
                  ? "RECOVERY CHANNEL"
                  : "ENCRYPTION CHANNEL"}
              </text>

              <circle
                className="packet"
                cx={phase === "recovering" ? 820 : 180}
                cy="290"
                r="7"
              >
                <animate
                  attributeName="cx"
                  from={phase === "recovering" ? "820" : "180"}
                  to={phase === "recovering" ? "180" : "820"}
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle
                className="packet packet-delay"
                cx={phase === "recovering" ? 820 : 180}
                cy="290"
                r="5"
              >
                <animate
                  attributeName="cx"
                  from={phase === "recovering" ? "820" : "180"}
                  to={phase === "recovering" ? "180" : "820"}
                  dur="1s"
                  begin=".28s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle
                className="packet packet-delay"
                cx={phase === "recovering" ? 820 : 180}
                cy="290"
                r="4"
              >
                <animate
                  attributeName="cx"
                  from={phase === "recovering" ? "820" : "180"}
                  to={phase === "recovering" ? "180" : "820"}
                  dur="1s"
                  begin=".55s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}

          <g className="core-node">
            <circle cx="500" cy="270" r="62" className="core-ring" />
            <circle cx="500" cy="270" r="43" className="core-circle" />
            <text x="500" y="264" textAnchor="middle">CYBER</text>
            <text x="500" y="282" textAnchor="middle">LAB</text>
          </g>

          {nodes.map((n) => {
            const selectedNode = selected === n.name;
            const state = nodeStatus(n);
            const attackNode = (phase === "attacking" || phase === "recovering") &&
              (n.kind === "attacker" || n.kind === "victim");

            return (
              <g key={n.name} className={`topo-node ${state} ${selectedNode ? "selected" : ""} ${attackNode ? "engaged" : ""}`}>
                <circle cx={n.x} cy={n.y} r="43" className="node-circle" />
                <circle cx={n.x} cy={n.y} r="49" className="node-halo" />
                <foreignObject x={n.x - 14} y={n.y - 15} width="30" height="30">
                  <div className="svg-node-icon">
                    {n.kind === "victim" ? <ShieldAlert size={25} /> :
                      n.kind === "attacker" ? <Zap size={25} /> :
                      <Server size={23} />}
                  </div>
                </foreignObject>
                <text x={n.x} y={n.y + 72} textAnchor="middle" className="node-name">{n.name}</text>
                <text x={n.x} y={n.y + 91} textAnchor="middle" className="node-ip">
                  {n.ip || (state === "running" ? "RUNNING" : "STOPPED")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="topology-legend">
        <span><i className="legend-dot running" /> Running</span>
        <span><i className="legend-dot stopped" /> Stopped</span>
        <span><i className="legend-dot target" /> Selected target</span>
        <span><i className="legend-line" /> Traffic</span>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon icon={icon} size={30} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function Dashboard({
  containers,
  discovered,
  selected,
  files,
  phase,
  setPage,
  discover,
  discovering,
}) {
  const running = containers.filter((c) => nodeStatus(c) === "running").length;
  const locked = isLocked(files);
  const count = fileCount(files);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-tag"><Activity size={14} /> ISOLATED SECURITY LAB</div>
          <h2>Attack simulation.<br /><span>Observe every transition.</span></h2>
          <p>Control the verified ransomware lifecycle while keeping every action inside the isolated Docker lab.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => setPage("network")}>
              <Radar size={17} /> Open Discovery
            </button>
            <button className="ghost-btn" onClick={() => setPage("logs")}>
              <Terminal size={17} /> Live Telemetry
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="hero-core"><ShieldCheck size={46} /></div>
          <div className="hero-node hn-a"><Server size={16} /></div>
          <div className="hero-node hn-b"><Network size={16} /></div>
          <div className="hero-node hn-c"><LockKeyhole size={16} /></div>
        </div>
      </div>

      <div className="stats-grid">
        <Stat icon={Network} label="Discovered Nodes" value={discovered ? containers.length : "—"} detail={discovered ? `${running} currently running` : "Discovery required"} />
        <Stat icon={ShieldAlert} label="Selected Victim" value={selected || "NONE"} detail={selected ? "Manual target selected" : "Awaiting selection"} tone={selected ? "blue" : ""} />
        <Stat icon={FileArchive} label="Protected Files" value={discovered ? count : "—"} detail={locked ? "Encrypted / locked" : "Normal state"} tone={locked ? "danger" : ""} />
        <Stat icon={Activity} label="Lab Phase" value={phase === "idle" ? "READY" : phase.toUpperCase()} detail="Live lifecycle state" tone={phase !== "idle" ? "blue" : ""} />
      </div>

      {!discovered ? (
        <div className="discovery-callout">
          <div className="callout-icon"><Radar size={22} /></div>
          <div>
            <strong>Network discovery has not been executed.</strong>
            <span>The dashboard intentionally stays quiet until you discover the isolated lab.</span>
          </div>
          <button className="primary-btn small" onClick={discover} disabled={discovering}>
            {discovering ? <RefreshCw className="spin" size={16} /> : <Radar size={16} />}
            {discovering ? "Discovering..." : "Discover Network"}
          </button>
        </div>
      ) : (
        <Topology containers={containers} selected={selected} phase={phase} />
      )}

      <div className="dashboard-grid">
        <div className="panel">
          <div className="card-heading">
            <div><span className="eyebrow">TARGET CONTROL</span><h3>Current Victim</h3></div>
            {selected ? <Badge tone="success">SELECTED</Badge> : <Badge>UNSELECTED</Badge>}
          </div>
          {selected ? (
            <div className="selected-target">
              <div className="target-icon"><ShieldAlert size={28} /></div>
              <div><strong>{selected}</strong><span>Manual lab target</span></div>
              <button className="outline-btn" onClick={() => setPage("victims")}>Manage <ChevronRight size={15} /></button>
            </div>
          ) : (
            <EmptyState icon={UserRound} title="No victim selected" text="Discover the network, then manually choose the actual lab victim." action={<button className="outline-btn" onClick={() => setPage("victims")}>Select Victim</button>} />
          )}
        </div>

        <div className="panel">
          <div className="card-heading">
            <div><span className="eyebrow">QUICK OPERATIONS</span><h3>Lab Controls</h3></div>
          </div>
          <div className="quick-grid">
            <button onClick={() => setPage("scanner")}><ScanLine /><span>Port Scan</span><small>Inspect victim</small></button>
            <button onClick={() => setPage("attack")}><ShieldAlert /><span>Attack</span><small>Execute flow</small></button>
            <button onClick={() => setPage("recovery")}><RotateCcw /><span>Recovery</span><small>Restore files</small></button>
            <button onClick={() => setPage("logs")}><Terminal /><span>Logs</span><small>Session telemetry</small></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkPage({ containers, discovered, discover, discovering }) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="01 / DISCOVERY"
        title="Network Discovery"
        description="Explicitly discover the Docker lab before any target selection or scanning."
        action={
          <button className="primary-btn" onClick={discover} disabled={discovering}>
            {discovering ? <RefreshCw className="spin" /> : <Radar />}
            {discovering ? "Discovering..." : discovered ? "Rediscover Network" : "Discover Network"}
          </button>
        }
      />

      {!discovered ? (
        <div className="large-empty">
          <Radar size={48} />
          <h3>Discovery not started</h3>
          <p>Click <b>Discover Network</b> to enumerate the isolated Docker environment.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <Stat icon={Network} label="Nodes Found" value={containers.length} detail="Docker containers" />
            <Stat icon={Wifi} label="Reachable" value={containers.filter(c => c.reachable !== false).length} detail="Network visible" />
            <Stat icon={Activity} label="Running" value={containers.filter(c => nodeStatus(c) === "running").length} detail="Active containers" />
            <Stat icon={Square} label="Stopped" value={containers.filter(c => nodeStatus(c) !== "running").length} detail="Inactive containers" />
          </div>
          <Topology containers={containers} phase="idle" />
        </>
      )}
    </div>
  );
}

function VictimsPage({ containers, discovered, selected, selectVictim, selecting }) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="02 / TARGET MANAGEMENT"
        title="Victim Management"
        description="All discovered containers are visible. Only the verified lab victim is targetable."
      />

      {!discovered ? (
        <EmptyState icon={Network} title="Discover the network first" text="Victim management is gated until network discovery completes." />
      ) : (
        <div className="container-grid">
          {containers.map((c) => {
            const actualVictim = c.name === "victim";
            const running = nodeStatus(c) === "running";
            const isSelected = selected === c.name;

            return (
              <div key={c.id || c.name} className={`container-card ${isSelected ? "selected" : ""} ${!running ? "stopped" : ""}`}>
                <div className="container-top">
                  <div className={`container-icon ${actualVictim ? "victim" : ""}`}>
                    {actualVictim ? <ShieldAlert /> : <Server />}
                  </div>
                  <Badge tone={running ? "success" : "neutral"}>
                    {running ? "RUNNING" : "STOPPED"}
                  </Badge>
                </div>
                <h3>{c.name}</h3>
                <div className="container-meta">
                  <span><Database size={14} /> {c.id ? c.id.slice(0, 12) : "—"}</span>
                  <span><Globe2 size={14} /> {c.ip || "No IP"}</span>
                </div>
                <div className="container-role">
                  {actualVictim ? (
                    <><ShieldCheck size={15} /> VERIFIED LAB VICTIM</>
                  ) : (
                    <><CircleDot size={15} /> OBSERVATION ONLY</>
                  )}
                </div>
                {actualVictim && running ? (
                  <button
                    className={`select-btn ${isSelected ? "selected-btn" : ""}`}
                    disabled={selecting}
                    onClick={() => selectVictim(c.name)}
                  >
                    {isSelected ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                    {isSelected ? "Selected Victim" : "Select as Victim"}
                  </button>
                ) : (
                  <button className="disabled-btn" disabled>
                    {running ? "Not a targetable container" : "Container stopped"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScannerPage({ selected, scan, scanResult, scanning }) {
  const ports = scanResult?.ports || scanResult?.results || [];

  return (
    <div className="page">
      <PageHeader
        eyebrow="03 / RECONNAISSANCE"
        title="Port Scanner"
        description="Run the controlled scanner against the manually selected victim."
        action={
          <button className={`primary-btn ${scanning ? "active-btn" : ""}`} disabled={!selected || scanning} onClick={scan}>
            {scanning ? <RefreshCw className="spin" /> : <ScanLine />}
            {scanning ? "Scanning..." : "Run Port Scan"}
          </button>
        }
      />

      {!selected ? (
        <EmptyState icon={ShieldAlert} title="No victim selected" text="Select the verified victim before starting a scan." />
      ) : (
        <>
          <div className="target-strip">
            <div className="target-icon"><ShieldAlert size={22} /></div>
            <div><span>SCAN TARGET</span><strong>{selected}</strong></div>
            <Badge tone={scanResult ? "success" : "neutral"}>{scanResult ? "SCAN COMPLETE" : "READY"}</Badge>
          </div>

          {scanning ? (
            <div className="scanner-progress">
              <div className="radar-animation"><Radar size={42} /></div>
              <h3>Scanning target...</h3>
              <p>Inspecting exposed services inside the isolated container.</p>
              <div className="progress-line"><span /></div>
            </div>
          ) : scanResult ? (
            <div className="scan-results">
              <div className="results-head">
                <div><span className="eyebrow">RESULTS</span><h3>Open Services</h3></div>
                <Badge tone="success">{ports.length || 1} FOUND</Badge>
              </div>
              {ports.length ? ports.map((p, i) => (
                <div className="port-row" key={i}>
                  <div className="port-number">{p.port || p.portNumber || "8080"}</div>
                  <div><strong>{p.service || "HTTP / Victim API"}</strong><span>{p.host || "127.0.0.1"}</span></div>
                  <Badge tone="success">{p.status || "OPEN"}</Badge>
                </div>
              )) : (
                <div className="port-row">
                  <div className="port-number">8080</div>
                  <div><strong>HTTP / Victim API</strong><span>127.0.0.1</span></div>
                  <Badge tone="success">OPEN</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="large-empty">
              <ScanLine size={48} />
              <h3>Ready to scan</h3>
              <p>Start a port scan to inspect the selected victim.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AttackPage({ selected, phase, startAttack, files, logs }) {
  const locked = isLocked(files);
  const running = phase === "attack-starting" || phase === "attacking";

  return (
    <div className="page">
      <PageHeader
        eyebrow="04 / OFFENSIVE SIMULATION"
        title="Ransomware Attack"
        description="Start the existing verified attacker → victim ransomware flow."
        action={
          <button
            className={`attack-btn ${running ? "executing" : ""}`}
            disabled={!selected || running || phase === "recovering"}
            onClick={startAttack}
          >
            {running ? <RefreshCw className="spin" /> : <Zap />}
            {running ? "ATTACK IN PROGRESS" : locked ? "FILES CURRENTLY LOCKED" : "START RANSOMWARE"}
          </button>
        }
      />

      {!selected ? (
        <EmptyState icon={ShieldAlert} title="No victim selected" text="Manually select the verified victim before starting the attack." />
      ) : (
        <>
          <div className={`operation-banner ${running ? "danger" : locked ? "complete" : ""}`}>
            <div className="operation-icon">
              {running ? <Activity /> : locked ? <FileLock2 /> : <ShieldAlert />}
            </div>
            <div>
              <span>TARGET</span>
              <strong>{selected}</strong>
              <small>{running ? "Attacker is communicating with victim..." : locked ? "Encryption completed — recovery is now available." : "Ready for controlled execution."}</small>
            </div>
            <div className="operation-state">
              {running ? "EXECUTING" : locked ? "LOCKED" : "READY"}
            </div>
          </div>

          <div className="attack-grid">
            <div className="panel">
              <div className="card-heading"><div><span className="eyebrow">ATTACK CHAIN</span><h3>Execution Flow</h3></div></div>
              <div className="timeline">
                <TimelineItem active icon={Server} title="Attacker container" text="Existing ransomware engine started" done={phase !== "idle"} />
                <TimelineItem active={running} icon={ArrowLeftRight} title="Victim communication" text="HTTP request to victim API" done={locked} />
                <TimelineItem active={locked} icon={FileLock2} title="File encryption" text="Protected files moved to locked state" done={locked} />
                <TimelineItem active={locked} icon={CheckCircle2} title="Attack complete" text="Encryption response received" done={locked} />
              </div>
            </div>
            <LogBox title="Attacker Session" icon={Zap} logs={logs.attacker} tone="attacker" />
            <LogBox title="Victim Session" icon={ShieldAlert} logs={logs.victim} tone="victim" />
          </div>
        </>
      )}
    </div>
  );
}

function TimelineItem({ icon, title, text, active, done }) {
  return (
    <div className={`timeline-item ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <div className="timeline-icon"><Icon icon={done ? CheckCircle2 : icon} /></div>
      <div><strong>{title}</strong><span>{text}</span></div>
    </div>
  );
}

function RecoveryPage({ selected, phase, recover, files, logs }) {
  const locked = isLocked(files);
  const running = phase === "recovering";

  return (
    <div className="page">
      <PageHeader
        eyebrow="05 / RECOVERY"
        title="File Recovery"
        description="Trigger the existing attacker-held-key recovery flow."
        action={
          <button
            className={`recovery-btn ${running ? "recovering" : ""}`}
            disabled={!locked || running}
            onClick={recover}
          >
            {running ? <RefreshCw className="spin" /> : <RotateCcw />}
            {running ? "RECOVERY IN PROGRESS" : locked ? "START RECOVERY" : "NO LOCKED FILES"}
          </button>
        }
      />

      {!selected ? (
        <EmptyState icon={RotateCcw} title="Recovery target unavailable" text="Select a victim and complete an attack cycle before recovery." />
      ) : (
        <>
          <div className={`recovery-hero ${running ? "active" : ""}`}>
            <div className="recovery-symbol"><RotateCcw size={42} /></div>
            <div>
              <span>RECOVERY TARGET</span>
              <h3>{selected}</h3>
              <p>{running ? "Restoring protected files using the existing recovery trigger..." : locked ? "Encrypted files detected and ready for restoration." : "No encrypted files detected."}</p>
            </div>
            <div className="recovery-status">{running ? "RESTORING" : locked ? "READY" : "IDLE"}</div>
          </div>

          <div className="recovery-grid">
            <div className="panel">
              <div className="card-heading"><div><span className="eyebrow">FILE STATE</span><h3>Protected Data</h3></div></div>
              <div className="file-state">
                <div className={`state-box ${locked ? "locked" : "normal"}`}>
                  {locked ? <FileLock2 /> : <FileCheck2 />}
                  <strong>{locked ? "LOCKED" : "NORMAL"}</strong>
                  <span>{fileArray(files).length} files observed</span>
                </div>
                <ArrowLeftRight className="state-arrow" />
                <div className={`state-box ${running ? "restoring" : "normal"}`}>
                  <FileCheck2 />
                  <strong>NORMAL</strong>
                  <span>Expected after recovery</span>
                </div>
              </div>
            </div>
            <LogBox title="Recovery Session" icon={RotateCcw} logs={logs.attacker} tone="recovery" />
          </div>
        </>
      )}
    </div>
  );
}

function FilePage({ files }) {
  const arr = fileArray(files);
  return (
    <div className="page">
      <PageHeader eyebrow="06 / FILE STATE" title="File Manager" description="Live view of the files exposed by the lab victim." />
      {!arr.length ? (
        <EmptyState icon={FolderOpen} title="No file data available" text="Discover and select the victim to inspect its protected files." />
      ) : (
        <div className="file-table">
          <div className="table-head"><span>FILE</span><span>STATE</span><span>TYPE</span></div>
          {arr.map((f, i) => {
            const name = f?.name || f?.path || String(f);
            const locked = name.endsWith(".locked");
            return (
              <div className="file-row" key={`${name}-${i}`}>
                <div className="file-name"><FileArchive size={17} /><strong>{name}</strong></div>
                <Badge tone={locked ? "danger" : "success"}>{locked ? "LOCKED" : "NORMAL"}</Badge>
                <span>{name.includes(".") ? name.split(".").pop().toUpperCase() : "FILE"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LogBox({ title, icon, logs, tone }) {
  return (
    <div className={`log-box ${tone}`}>
      <div className="log-head">
        <div><Icon icon={icon} /><strong>{title}</strong></div>
        <span>{logs.length} events</span>
      </div>
      <div className="log-content">
        {logs.length ? logs.map((line, i) => (
          <div className="log-line" key={i}>
            <span className="log-index">{String(i + 1).padStart(2, "0")}</span>
            <code>{line}</code>
          </div>
        )) : <div className="log-empty">Waiting for session telemetry...</div>}
      </div>
    </div>
  );
}

function LogsPage({ logs, phase }) {
  return (
    <div className="page">
      <PageHeader eyebrow="07 / OBSERVABILITY" title="Logs & Monitoring" description="Only the current attack/recovery session is displayed." />
      <div className="session-bar">
        <div><span>SESSION STATUS</span><strong>{phase === "idle" ? "READY" : phase.toUpperCase()}</strong></div>
        <div><span>HISTORY</span><strong>NEW SESSION ON NEXT ATTACK</strong></div>
      </div>
      <div className="logs-grid">
        <LogBox title="Attacker Container" icon={Zap} logs={logs.attacker} tone="attacker" />
        <LogBox title="Victim Container" icon={ShieldAlert} logs={logs.victim} tone="victim" />
      </div>
    </div>
  );
}

function ReportsPage({ containers, selected, files, phase, logs }) {
  const locked = isLocked(files);
  const events = logs.attacker.length + logs.victim.length;

  return (
    <div className="page">
      <PageHeader eyebrow="08 / EVIDENCE" title="Reports" description="Compact evidence view for the current controlled simulation cycle." />
      <div className="report-grid">
        <div className="report-card"><Network /><span>Nodes</span><strong>{containers.length}</strong></div>
        <div className="report-card"><ShieldAlert /><span>Target</span><strong>{selected || "None"}</strong></div>
        <div className="report-card"><FileLock2 /><span>File State</span><strong>{locked ? "LOCKED" : "NORMAL"}</strong></div>
        <div className="report-card"><Terminal /><span>Session Events</span><strong>{events}</strong></div>
      </div>

      <div className="panel report-summary">
        <div className="card-heading"><div><span className="eyebrow">SIMULATION SUMMARY</span><h3>Current Cycle</h3></div><Badge tone={locked ? "danger" : "success"}>{phase.toUpperCase()}</Badge></div>
        <div className="report-lines">
          <div><span>Network discovery</span><strong>{containers.length ? "Completed" : "Not executed"}</strong></div>
          <div><span>Victim selection</span><strong>{selected || "None"}</strong></div>
          <div><span>Ransomware lifecycle</span><strong>{locked ? "Encryption completed" : "Not completed"}</strong></div>
          <div><span>Recovery lifecycle</span><strong>{!locked && events ? "Ready / restored" : "Pending"}</strong></div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="page">
      <PageHeader eyebrow="09 / CONFIGURATION" title="Settings" description="Environment information and interface behavior." />
      <div className="settings-grid">
        <div className="setting-card">
          <div className="setting-icon"><ShieldCheck /></div>
          <div><strong>Isolation</strong><span>Docker-based lab execution</span></div>
          <Badge tone="success">ENABLED</Badge>
        </div>
        <div className="setting-card">
          <div className="setting-icon"><Database /></div>
          <div><strong>Backend API</strong><span>Express + Docker integration</span></div>
          <Badge tone="success">CONNECTED</Badge>
        </div>
        <div className="setting-card">
          <div className="setting-icon"><Activity /></div>
          <div><strong>Live polling</strong><span>State refresh every 2 seconds</span></div>
          <Badge>ACTIVE</Badge>
        </div>
        <div className="setting-card">
          <div className="setting-icon"><Terminal /></div>
          <div><strong>Session logs</strong><span>Historical logs hidden from UI</span></div>
          <Badge tone="success">ENABLED</Badge>
        </div>
      </div>
    </div>
  );
}

function DesktopPage() {
  return (
    <section className="page victim-desktop-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">LAB ENVIRONMENT / DESKTOP</div>
          <h1>Victim Desktop</h1>
          <p>Use the isolated Firefox desktop for authorized lab testing.</p>
        </div>
        <a
          className="desktop-open-link"
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
        >
          Open desktop separately
        </a>
      </div>

      <div className="desktop-notice">
        <strong>Controlled lab browser</strong>
        <span>
          Use a dedicated test page for submitted search events. Do not enter
          real passwords or sensitive information into test activity.
        </span>
      </div>

      <div className="desktop-frame-wrap">
        <iframe
          className="victim-desktop-frame"
          src="http://localhost:3000/"
          title="CyberLab Victim Firefox Desktop"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </section>
  );
}


function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [containers, setContainers] = useState([]);
  const [discovered, setDiscovered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [logs, setLogs] = useState({ attacker: [], victim: [] });
  const [phase, setPhase] = useState("idle");
  const [discovering, setDiscovering] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const previousLocked = useRef(false);
  const discoveredRef = useRef(false);
  discoveredRef.current = discovered;

  const refresh = useCallback(async () => {
    try {
      const isDiscovered = discoveredRef.current;

      const [status, f] = await Promise.all([
        api.status().catch(() => null),
        isDiscovered
          ? api.files().catch(() => null)
          : Promise.resolve(null),
      ]);

      if (isDiscovered && status) {
        const cs = normalizeContainers(status);
        setContainers(cs);
      }

      if (isDiscovered && f) {
        setFiles(f);
      }

      if (phase !== "idle") {
        const [a, v] = await Promise.all([
          api.attackerLogs().catch(() => null),
          api.victimLogs().catch(() => null),
        ]);

        const attacker = currentSessionLogs(cleanLogs(a), "attacker");
        const victim = currentSessionLogs(cleanLogs(v), "victim");

        setLogs({ attacker, victim });
      }
    } catch {
      // Keep last known UI state.
    }
  }, [phase]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 2000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const locked = isLocked(files);

    if (phase === "attack-starting" || phase === "attacking") {
      if (locked) {
        previousLocked.current = true;
        setPhase("attack-complete");
      }
    }

    if (phase === "recovering" && !locked && previousLocked.current) {
      setPhase("recovery-complete");
      setTimeout(async () => {
        await api.clearVictim().catch(() => null);
        setSelected(null);
        setPhase("idle");
        previousLocked.current = false;
      }, 1200);
    }
  }, [files, phase]);

  const discover = async () => {
    setDiscovering(true);
    try {
      const data = await api.discovery();

      // Discovery never selects a victim automatically.
      await api.clearVictim().catch(() => null);

      setSelected(null);
      setScanResult(null);
      setLogs({ attacker: [], victim: [] });
      setPhase("idle");

      const discoveredContainers = normalizeContainers(data);

      discoveredRef.current = true;
    setContainers(discoveredContainers);
      setDiscovered(true);

      // Load file state only after discovery has actually completed.
      const discoveredFiles = await api.files().catch(() => null);
      setFiles(discoveredFiles);

      setPage("network");
    } catch (e) {
      alert(e.message);
    } finally {
      setDiscovering(false);
    }
  };

  const selectVictim = async (name) => {
    setSelecting(true);
    try {
      const result = await api.selectVictim(name);

      const raw =
        result?.selectedVictim ||
        result?.selected ||
        result?.victim ||
        name;

      const value =
        typeof raw === "string"
          ? raw
          : raw?.name || raw?.container || raw?.Names || raw?.Name || name;

      setSelected(value);
    } catch (e) {
      alert(e.message);
    } finally {
      setSelecting(false);
    }
  };

  const scan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const data = await api.scan();
      setScanResult(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setScanning(false);
    }
  };

  const startAttack = async () => {
    if (!selected) return;

    try {
      // Start a completely new UI session.
      // Historical Docker logs are intentionally not rendered.
      setLogs({ attacker: [], victim: [] });
      previousLocked.current = false;
      setPhase("attack-starting");

      await api.attack();
      setPhase("attacking");
      setPage("attack");
    } catch (e) {
      setPhase("idle");
      alert(e.message);
    }
  };

  const recover = async () => {
    if (!isLocked(files)) return;

    setPhase("recovering");
    setPage("recovery");

    try {
      await api.recover();
    } catch (e) {
      setPhase("attack-complete");
      alert(e.message);
    }
  };

  const manualRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const pageProps = useMemo(() => ({
    containers,
    discovered,
    selected,
    files,
    phase,
    logs,
  }), [containers, discovered, selected, files, phase, logs]);

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`main ${collapsed ? "expanded" : ""}`}>
        <Topbar page={page} refresh={manualRefresh} refreshing={refreshing} onMenu={() => setCollapsed(!collapsed)} />

        <div className="content">
          {page === "dashboard" && (
            <Dashboard
              {...pageProps}
              setPage={setPage}
              discover={discover}
              discovering={discovering}
            />
          )}

          {page === "network" && (
            <NetworkPage
              containers={containers}
              discovered={discovered}
              discover={discover}
              discovering={discovering}
            />
          )}

          {page === "victims" && (
            <VictimsPage
              containers={containers}
              discovered={discovered}
              selected={selected}
              selectVictim={selectVictim}
              selecting={selecting}
            />
          )}

          {page === "scanner" && (
            <ScannerPage
              selected={selected}
              scan={scan}
              scanResult={scanResult}
              scanning={scanning}
            />
          )}

          {page === "attack" && (
            <AttackPage
              selected={selected}
              phase={phase}
              startAttack={startAttack}
              files={files}
              logs={logs}
            />
          )}

          {page === "recovery" && (
            <RecoveryPage
              selected={selected}
              phase={phase}
              recover={recover}
              files={files}
              logs={logs}
            />
          )}

          {page === "desktop" && <DesktopPage />}

          {page === "files" && <FilePage files={files} />}

          {page === "logs" && <LogsPage logs={logs} phase={phase} />}

          {page === "reports" && (
            <ReportsPage
              containers={containers}
              selected={selected}
              files={files}
              phase={phase}
              logs={logs}
            />
          )}

          {page === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
