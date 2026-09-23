import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Container,
  FileText,
  Folder,
  FolderOpen,
  FolderTree,
  LockKeyhole,
  Play,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Terminal,
  UnlockKeyhole,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [containers, setContainers] = useState([]);
  const [victimLogs, setVictimLogs] = useState("");
  const [attackerLogs, setAttackerLogs] = useState("");
  const [filesData, setFilesData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null);
  const [error, setError] = useState("");

  const [expandedFolders, setExpandedFolders] = useState({});

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);

      if (!response.ok) {
        throw new Error("Failed to fetch container status");
      }

      const data = await response.json();
      setContainers(data.containers || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchLogs = async () => {
    try {
      const [victimResponse, attackerResponse] = await Promise.all([
        fetch(`${API_BASE}/logs/victim`),
        fetch(`${API_BASE}/logs/attacker`),
      ]);

      const victimData = await victimResponse.json();
      const attackerData = await attackerResponse.json();

      setVictimLogs(victimData.logs || "");
      setAttackerLogs(attackerData.logs || "");
    } catch (err) {
      console.error("Log fetch error:", err);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/files`);

      if (!response.ok) {
        throw new Error("Failed to fetch lab files");
      }

      const data = await response.json();
      setFilesData(data);
    } catch (err) {
      console.error("File fetch error:", err);
    }
  };

  const refreshDashboard = async () => {
    await Promise.all([
      fetchStatus(),
      fetchLogs(),
      fetchFiles(),
    ]);
  };

  useEffect(() => {
    refreshDashboard();

    const interval = setInterval(() => {
      refreshDashboard();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runAttack = async () => {
    setLoading(true);
    setAction("attack");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/attack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Attack simulation failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      await refreshDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const runRecovery = async () => {
    setLoading(true);
    setAction("recovery");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/recover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Recovery failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      await refreshDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const victim = containers.find(
    (container) => container.name === "victim"
  );

  const attacker = containers.find(
    (container) => container.name === "attacker"
  );

  const victimOnline =
    victim?.status?.toLowerCase().includes("up") || false;

  const attackerOnline =
    attacker?.status?.toLowerCase().includes("up") || false;

  const statistics = filesData?.statistics || {
    totalFiles: 0,
    normalFiles: 0,
    lockedFiles: 0,
    folderCount: 0,
  };

  const folderTree = useMemo(() => {
    if (!filesData?.files) {
      return {};
    }

    const tree = {};

    filesData.files.forEach((filePath) => {
      const parts = filePath.split("/");

      if (parts.length === 1) {
        if (!tree.__root__) {
          tree.__root__ = [];
        }

        tree.__root__.push(parts[0]);
        return;
      }

      const folderName = parts[0];

      if (!tree[folderName]) {
        tree[folderName] = [];
      }

      tree[folderName].push(parts.slice(1).join("/"));
    });

    return tree;
  }, [filesData]);

  const toggleFolder = (folderName) => {
    setExpandedFolders((previous) => ({
      ...previous,
      [folderName]: !previous[folderName],
    }));
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".locked")) {
      return <LockKeyhole size={17} />;
    }

    return <FileText size={17} />;
  };

  return (
    <div className="app-shell">
      {/* TOP NAVIGATION */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <div className="brand-title">CYBERLAB</div>
            <div className="brand-subtitle">
              Cybersecurity Attack Simulation Platform
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <div className="connection-status">
            <Wifi size={16} />
            <span>DOCKER CONNECTED</span>
            <span className="status-dot online" />
          </div>

          <button
            className="refresh-button"
            onClick={refreshDashboard}
            title="Refresh dashboard"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </header>

      <main className="dashboard">
        {/* HERO */}
        <section className="hero-panel">
          <div className="hero-content">
            <div className="eyebrow">
              <CircleDot size={14} />
              SECURITY OPERATIONS CENTER
            </div>

            <h1>
              Attack Simulation
              <span> Laboratory</span>
            </h1>

            <p>
              Controlled ransomware simulation environment for
              cybersecurity analysis, monitoring, detection and recovery.
            </p>
          </div>

          <div className="hero-status">
            <div className="hero-status-icon">
              <ShieldCheck size={30} />
            </div>

            <div>
              <span>LAB STATUS</span>
              <strong>READY</strong>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="error-banner">
            <XCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {/* STATUS CARDS */}
        <section className="status-grid">
          <div className="status-card">
            <div className="status-card-icon blue">
              <Container size={22} />
            </div>

            <div className="status-card-content">
              <span>DOCKER CONTAINERS</span>
              <strong>{containers.length}</strong>
              <small>Active lab components</small>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-icon green">
              <ShieldCheck size={22} />
            </div>

            <div className="status-card-content">
              <span>VICTIM</span>
              <strong>{victimOnline ? "ONLINE" : "OFFLINE"}</strong>
              <small>{victim?.status || "Waiting for container"}</small>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-icon orange">
              <Zap size={22} />
            </div>

            <div className="status-card-content">
              <span>ATTACKER</span>
              <strong>{attackerOnline ? "ACTIVE" : "STANDBY"}</strong>
              <small>{attacker?.status || "Waiting for container"}</small>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-icon purple">
              <FolderTree size={22} />
            </div>

            <div className="status-card-content">
              <span>PROTECTED FILES</span>
              <strong>{statistics.totalFiles}</strong>
              <small>
                {statistics.folderCount} folders detected
              </small>
            </div>
          </div>
        </section>

        {/* FILE MONITOR */}
        <section className="panel file-monitor-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <ScanSearch size={19} />
                FILE SYSTEM MONITOR
              </div>

              <div className="panel-subtitle">
                Live inspection of the ransomware simulation target
              </div>
            </div>

            <div className="target-directory">
              <FolderOpen size={16} />
              <span>
                {filesData?.targetDirectory || "/lab-target"}
              </span>
            </div>
          </div>

          {/* FILE STATISTICS */}
          <div className="file-stat-grid">
            <div className="file-stat">
              <div className="file-stat-icon">
                <FileText size={19} />
              </div>

              <div>
                <span>TOTAL FILES</span>
                <strong>{statistics.totalFiles}</strong>
              </div>
            </div>

            <div className="file-stat">
              <div className="file-stat-icon normal">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>NORMAL</span>
                <strong>{statistics.normalFiles}</strong>
              </div>
            </div>

            <div className="file-stat">
              <div className="file-stat-icon locked">
                <LockKeyhole size={19} />
              </div>

              <div>
                <span>LOCKED</span>
                <strong>{statistics.lockedFiles}</strong>
              </div>
            </div>

            <div className="file-stat">
              <div className="file-stat-icon folders">
                <FolderTree size={19} />
              </div>

              <div>
                <span>FOLDERS</span>
                <strong>{statistics.folderCount}</strong>
              </div>
            </div>
          </div>

          {/* FILE TREE */}
          <div className="file-tree">
            <div className="tree-header">
              <div>
                <FolderOpen size={17} />
                <span>Target Directory</span>
              </div>

              <span className="tree-count">
                {statistics.totalFiles} files
              </span>
            </div>

            {Object.entries(folderTree).map(
              ([folderName, files]) => {
                if (folderName === "__root__") {
                  return null;
                }

                const isExpanded =
                  expandedFolders[folderName] ?? true;

                return (
                  <div className="tree-folder" key={folderName}>
                    <button
                      className="folder-row"
                      onClick={() => toggleFolder(folderName)}
                    >
                      {isExpanded ? (
                        <ChevronDown size={17} />
                      ) : (
                        <ChevronRight size={17} />
                      )}

                      {isExpanded ? (
                        <FolderOpen size={18} />
                      ) : (
                        <Folder size={18} />
                      )}

                      <span>{folderName}</span>

                      <span className="folder-file-count">
                        {files.length} files
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="folder-contents">
                        {files.map((fileName) => {
                          const locked =
                            fileName.endsWith(".locked");

                          return (
                            <div
                              className={`file-row ${
                                locked ? "file-locked" : ""
                              }`}
                              key={`${folderName}/${fileName}`}
                            >
                              <span className="tree-line" />

                              <span className="file-icon">
                                {getFileIcon(fileName)}
                              </span>

                              <span className="file-name">
                                {fileName}
                              </span>

                              <span
                                className={`file-state ${
                                  locked ? "locked" : "normal"
                                }`}
                              >
                                {locked ? (
                                  <>
                                    <LockKeyhole size={13} />
                                    LOCKED
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={13} />
                                    NORMAL
                                  </>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            )}

            {folderTree.__root__?.map((fileName) => (
              <div className="file-row" key={fileName}>
                <span className="tree-line" />

                <span className="file-icon">
                  <FileText size={17} />
                </span>

                <span className="file-name">{fileName}</span>

                <span className="file-state normal">
                  <CheckCircle2 size={13} />
                  NORMAL
                </span>
              </div>
            ))}

            {!filesData?.files?.length && (
              <div className="empty-state">
                <FolderOpen size={28} />
                <span>No files detected in target directory</span>
              </div>
            )}
          </div>
        </section>

        {/* SIMULATION CONTROLS */}
        <section className="panel simulation-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Terminal size={19} />
                RANSOMWARE SIMULATION
              </div>

              <div className="panel-subtitle">
                Execute controlled attack and recovery operations
              </div>
            </div>

            <div className="simulation-badge">
              <CircleDot size={13} />
              LAB MODE
            </div>
          </div>

          <div className="simulation-warning">
            <div className="warning-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <strong>Controlled Environment</strong>
              <p>
                This simulation operates only against the isolated
                Docker victim container and its lab target directory.
              </p>
            </div>
          </div>

          <div className="simulation-actions">
            <button
              className="action-button attack"
              onClick={runAttack}
              disabled={loading}
            >
              {loading && action === "attack" ? (
                <RefreshCw className="spin" size={20} />
              ) : (
                <LockKeyhole size={20} />
              )}

              <span>
                {loading && action === "attack"
                  ? "RUNNING ATTACK..."
                  : "START ATTACK"}
              </span>

              <Play size={15} />
            </button>

            <button
              className="action-button recovery"
              onClick={runRecovery}
              disabled={loading}
            >
              {loading && action === "recovery" ? (
                <RefreshCw className="spin" size={20} />
              ) : (
                <UnlockKeyhole size={20} />
              )}

              <span>
                {loading && action === "recovery"
                  ? "RECOVERING..."
                  : "START RECOVERY"}
              </span>

              <RefreshCw size={15} />
            </button>
          </div>
        </section>

        {/* LIVE LOGS */}
        <section className="logs-grid">
          <div className="panel log-panel">
            <div className="panel-header compact">
              <div>
                <div className="panel-title">
                  <ShieldCheck size={18} />
                  VICTIM LOG
                </div>

                <div className="panel-subtitle">
                  Victim container activity
                </div>
              </div>

              <span className="live-badge">
                <span className="status-dot online" />
                LIVE
              </span>
            </div>

            <div className="terminal-window">
              <div className="terminal-bar">
                <span />
                <span />
                <span />

                <div className="terminal-label">
                  victim@cyberlab
                </div>
              </div>

              <pre>
                {victimLogs || "Waiting for victim logs..."}
              </pre>
            </div>
          </div>

          <div className="panel log-panel">
            <div className="panel-header compact">
              <div>
                <div className="panel-title">
                  <Zap size={18} />
                  ATTACKER LOG
                </div>

                <div className="panel-subtitle">
                  Attacker container activity
                </div>
              </div>

              <span className="live-badge">
                <span className="status-dot online" />
                LIVE
              </span>
            </div>

            <div className="terminal-window">
              <div className="terminal-bar">
                <span />
                <span />
                <span />

                <div className="terminal-label">
                  attacker@cyberlab
                </div>
              </div>

              <pre>
                {attackerLogs || "Waiting for attacker logs..."}
              </pre>
            </div>
          </div>
        </section>

        {/* CONTAINERS */}
        <section className="panel">
          <div className="panel-header compact">
            <div>
              <div className="panel-title">
                <Container size={19} />
                DOCKER CONTAINERS
              </div>

              <div className="panel-subtitle">
                Infrastructure components of the simulation lab
              </div>
            </div>
          </div>

          <div className="container-table">
            <div className="table-head">
              <span>CONTAINER</span>
              <span>STATUS</span>
              <span>IMAGE</span>
              <span>PORTS</span>
            </div>

            {containers.map((container) => (
              <div
                className="table-row"
                key={container.name}
              >
                <div className="container-name">
                  <div className="container-icon">
                    <Container size={17} />
                  </div>

                  <span>{container.name}</span>
                </div>

                <div className="container-status">
                  {container.status?.toLowerCase().includes("up") ? (
                    <>
                      <span className="status-dot online" />
                      RUNNING
                    </>
                  ) : (
                    <>
                      <span className="status-dot offline" />
                      STOPPED
                    </>
                  )}
                </div>

                <span className="image-name">
                  {container.image}
                </span>

                <span className="ports">
                  {container.ports || "—"}
                </span>
              </div>
            ))}

            {!containers.length && (
              <div className="empty-state">
                <Container size={28} />
                <span>No containers detected</span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <ShieldCheck size={16} />
          <span>CYBERLAB</span>
          <span className="footer-separator">•</span>
          <span>Controlled Security Research Environment</span>
        </div>

        <span className="footer-version">
          v1.0.0
        </span>
      </footer>
    </div>
  );
}

export default App;