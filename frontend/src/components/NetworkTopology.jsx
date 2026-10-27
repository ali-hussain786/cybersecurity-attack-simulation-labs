import {
  Container,
  Globe2,
  Monitor,
  Server,
  Shield,
} from "lucide-react";

function getIcon(name) {
  if (name === "victim") {
    return Server;
  }

  if (name.includes("frontend")) {
    return Monitor;
  }

  if (name.includes("backend")) {
    return Container;
  }

  return Shield;
}

function NetworkTopology({ containers = [] }) {
  const activeContainers = containers.filter(
    (container) => container.reachable
  );

  return (
    <div className="topology">
      <div className="topology-grid" />
      <div className="topology-glow" />

      <div className="topology-core">
        <div className="core-ring ring-one" />
        <div className="core-ring ring-two" />

        <div className="core-node">
          <Globe2 size={27} />
          <span>CYBERLAB</span>
          <small>NETWORK CORE</small>
        </div>
      </div>

      {activeContainers.map((container, index) => {
        const Icon = getIcon(container.name);

        const angle =
          (index / Math.max(activeContainers.length, 1)) *
            Math.PI *
            2 -
          Math.PI / 2;

        const radius = 36;

        const x =
          50 + Math.cos(angle) * radius;

        const y =
          50 + Math.sin(angle) * radius;

        return (
          <div
            key={container.name}
            className={`topology-node ${
              container.name === "victim"
                ? "victim-node"
                : ""
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          >
            <div className="node-connection" />

            <div className="node-icon">
              <Icon size={19} />
            </div>

            <div className="node-info">
              <strong>{container.name}</strong>
              <span>
                {container.ipAddress || "NO IP"}
              </span>
            </div>

            <span className="node-status" />
          </div>
        );
      })}
    </div>
  );
}

export default NetworkTopology;
