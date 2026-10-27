import {
  Activity,
  Container,
  FileCheck2,
  LockKeyhole,
  Network,
  ShieldCheck,
} from "lucide-react";

import StatCard from "../components/StatCard";
import NetworkTopology from "../components/NetworkTopology";
import StatusBadge from "../components/StatusBadge";

function Dashboard({
  containers,
  filesData,
  selectedVictim,
  onNavigate,
}) {
  const statistics =
    filesData?.statistics || {
      totalFiles: 0,
      normalFiles: 0,
      lockedFiles: 0,
      folderCount: 0,
    };

  const activeContainers = containers.filter(
    (container) => container.reachable
  );

  const victim =
    containers.find(
      (container) =>
        container.name ===
        (selectedVictim?.name || "victim")
    ) || null;

  const victimOnline =
    victim?.reachable || false;

  return (
    <div className="page">
      <section className="dashboard-hero">
        <div className="hero-copy">
          <div className="section-eyebrow">
            <Activity size={14} />
            SECURITY OPERATIONS CENTER
          </div>

          <h1>
            Attack Simulation
            <span> Laboratory</span>
          </h1>

          <p>
            Controlled cybersecurity environment for
            attack simulation, network analysis,
            monitoring and recovery.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() =>
                onNavigate("network")
              }
            >
              <Network size={17} />
              Discover Network
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                onNavigate("attack")
              }
            >
              <ShieldCheck size={17} />
              Attack Console
            </button>
          </div>
        </div>

        <div className="hero-status-card">
          <div className="hero-shield">
            <ShieldCheck size={28} />
          </div>

          <div>
            <span>LAB STATUS</span>
            <strong>READY</strong>
            <small>
              Controlled environment operational
            </small>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={Container}
          label="ACTIVE CONTAINERS"
          value={activeContainers.length}
          description="Running lab components"
          tone="blue"
        />

        <StatCard
          icon={Network}
          label="NETWORK NODES"
          value={activeContainers.length}
          description="Detected active nodes"
          tone="purple"
        />

        <StatCard
          icon={FileCheck2}
          label="NORMAL FILES"
          value={statistics.normalFiles}
          description="Currently accessible"
          tone="green"
        />

        <StatCard
          icon={LockKeyhole}
          label="LOCKED FILES"
          value={statistics.lockedFiles}
          description="Current lab state"
          tone={
            statistics.lockedFiles > 0
              ? "red"
              : "orange"
          }
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel topology-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                NETWORK
              </span>

              <h2>Live Network Topology</h2>
            </div>

            <StatusBadge
              status={
                activeContainers.length
                  ? "online"
                  : "offline"
              }
            />
          </div>

          <NetworkTopology
            containers={containers}
          />
        </div>

        <div className="panel victim-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                TARGET
              </span>

              <h2>Selected Victim</h2>
            </div>

            <StatusBadge
              status={
                victimOnline
                  ? "online"
                  : "offline"
              }
            />
          </div>

          {selectedVictim ? (
            <div className="victim-summary">
              <div className="victim-avatar">
                <ShieldCheck size={23} />
              </div>

              <div className="victim-details">
                <strong>
                  {selectedVictim.name}
                </strong>

                <span>
                  {victim?.ipAddress ||
                    "IP unavailable"}
                </span>

                <small>
                  {selectedVictim.image}
                </small>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck size={28} />

              <strong>
                No victim selected
              </strong>

              <span>
                Discover the network and select a
                lab victim.
              </span>

              <button
                className="secondary-button"
                onClick={() =>
                  onNavigate("victims")
                }
              >
                Victim Management
              </button>
            </div>
          )}

          <div className="victim-actions">
            <button
              className="secondary-button full"
              onClick={() =>
                onNavigate("scanner")
              }
              disabled={!selectedVictim}
            >
              <Network size={16} />
              Scan Victim
            </button>

            <button
              className="primary-button full"
              onClick={() =>
                onNavigate("attack")
              }
              disabled={!selectedVictim}
            >
              <ShieldCheck size={16} />
              Open Attack Console
            </button>
          </div>
        </div>
      </section>

      <section className="panel quick-actions-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              OPERATIONS
            </span>

            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="quick-actions">
          <button
            onClick={() =>
              onNavigate("network")
            }
          >
            <Network size={20} />

            <span>
              <strong>Network Discovery</strong>
              <small>
                Discover active Docker nodes
              </small>
            </span>
          </button>

          <button
            onClick={() =>
              onNavigate("victims")
            }
          >
            <ShieldCheck size={20} />

            <span>
              <strong>Victim Management</strong>
              <small>
                Select the simulation target
              </small>
            </span>
          </button>

          <button
            onClick={() =>
              onNavigate("files")
            }
          >
            <FileCheck2 size={20} />

            <span>
              <strong>File Manager</strong>
              <small>
                Inspect lab target state
              </small>
            </span>
          </button>

          <button
            onClick={() =>
              onNavigate("logs")
            }
          >
            <Activity size={20} />

            <span>
              <strong>Live Monitoring</strong>
              <small>
                Inspect simulation events
              </small>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
