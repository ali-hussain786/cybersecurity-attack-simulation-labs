const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const net = require("net");

const app = express();

const PORT = Number(process.env.PORT || 5000);

const NETWORK_NAME = "cyberlab";
const BACKEND_CONTAINER = "cyberlab-backend";
const FRONTEND_CONTAINER = "cyberlab-frontend";
const VICTIM_CONTAINER = "victim";
const ATTACKER_CONTAINER = "attacker";

app.use(cors());
app.use(express.json());

const labState = {
  selectedVictim: null,
  lastPortScan: null,
};

/* =========================================================
   DOCKER HELPERS
========================================================= */

function docker(args) {
  return new Promise((resolve, reject) => {
    execFile(
      "docker",
      args,
      {
        timeout: 30000,
        maxBuffer: 4 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              (stderr || stdout || error.message).trim()
            )
          );
          return;
        }

        resolve(stdout.trim());
      }
    );
  });
}

async function inspectContainer(name) {
  const output = await docker([
    "inspect",
    name,
  ]);

  const data = JSON.parse(output)[0];

  const networks = data.NetworkSettings?.Networks || {};

  let networkName = NETWORK_NAME;
  let ipAddress = null;

  if (networks[NETWORK_NAME]) {
    ipAddress = networks[NETWORK_NAME].IPAddress || null;
  } else {
    const firstNetwork = Object.entries(networks)[0];

    if (firstNetwork) {
      networkName = firstNetwork[0];
      ipAddress = firstNetwork[1]?.IPAddress || null;
    }
  }

  return {
    name,
    id: data.Id,
    image: data.Config?.Image || null,
    status: data.State?.Status || "unknown",
    running: Boolean(data.State?.Running),
    startedAt: data.State?.StartedAt || null,
    ipAddress,
    network: networkName,
  };
}

async function getLabContainers() {
  const names = [
    BACKEND_CONTAINER,
    FRONTEND_CONTAINER,
    VICTIM_CONTAINER,
    ATTACKER_CONTAINER,
  ];

  const result = [];

  for (const name of names) {
    try {
      result.push(await inspectContainer(name));
    } catch {
      // Container may not exist.
    }
  }

  return result.map((container) => ({
    ...container,
    role:
      container.name === VICTIM_CONTAINER
        ? "victim"
        : container.name === ATTACKER_CONTAINER
          ? "attacker"
          : "lab-node",
  }));
}

/* =========================================================
   CURRENT CONTAINER LOGS
========================================================= */

async function getCurrentLogs(name) {
  const info = await inspectContainer(name);

  if (!info.startedAt) {
    return "";
  }

  try {
    return await docker([
      "logs",
      "--since",
      info.startedAt,
      "--tail",
      "250",
      name,
    ]);
  } catch (error) {
    return error.message || "";
  }
}

/* =========================================================
   FILE STATE
========================================================= */

async function getFiles() {
  const output = await docker([
    "exec",
    VICTIM_CONTAINER,
    "sh",
    "-lc",
    "find /lab-target -type f -printf '%P\\n' | sort",
  ]);

  const paths = output
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const files = paths.map((relativePath) => {
    const locked = relativePath.endsWith(".locked");

    return {
      name: relativePath,
      path: `/lab-target/${relativePath}`,
      locked,
      state: locked ? "locked" : "normal",
    };
  });

  return {
    files,
    statistics: {
      totalFiles: files.length,
      normalFiles: files.filter((file) => !file.locked).length,
      lockedFiles: files.filter((file) => file.locked).length,
      folderCount: new Set(
        files.map((file) => {
          const parts = file.name.split("/");
          return parts.length > 1
            ? parts.slice(0, -1).join("/")
            : "";
        })
      ).size,
    },
  };
}

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", async (req, res) => {
  try {
    await docker(["version"]);

    res.json({
      success: true,
      status: "healthy",
      dockerConnected: true,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "unhealthy",
      dockerConnected: false,
      message: error.message,
    });
  }
});

/* =========================================================
   STATUS
========================================================= */

app.get("/api/status", async (req, res) => {
  try {
    const containers = await getLabContainers();

    res.json({
      success: true,
      dockerConnected: true,
      containers,
      selectedVictim: labState.selectedVictim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      dockerConnected: false,
      message: error.message,
    });
  }
});

/* =========================================================
   NETWORK DISCOVERY
========================================================= */

app.get("/api/network/discovery", async (req, res) => {
  try {
    const containers = await getLabContainers();

    res.json({
      success: true,
      network: NETWORK_NAME,
      discoveredAt: new Date().toISOString(),
      containers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================================================
   VICTIM SELECTION
========================================================= */

app.get("/api/victim/selected", (req, res) => {
  res.json({
    success: true,
    victim: labState.selectedVictim,
  });
});

app.post("/api/victim/select", async (req, res) => {
  try {
    const requested = req.body?.container || VICTIM_CONTAINER;

    if (requested !== VICTIM_CONTAINER) {
      return res.status(400).json({
        success: false,
        message: "Only the controlled victim container can be selected.",
      });
    }

    const victim = await inspectContainer(VICTIM_CONTAINER);

    if (!victim.running) {
      return res.status(400).json({
        success: false,
        message: "Victim container is not running.",
      });
    }

    labState.selectedVictim = victim;

    res.json({
      success: true,
      message: "Victim selected.",
      victim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================================================
   PORT SCANNER
========================================================= */

function probePort(host, port, timeout = 700) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    let finished = false;

    const finish = (open) => {
      if (finished) return;

      finished = true;

      socket.destroy();

      resolve(open);
    };

    socket.setTimeout(timeout);

    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));

    socket.connect(port, host);
  });
}

app.post("/api/scan", async (req, res) => {
  try {
    if (!labState.selectedVictim) {
      return res.status(400).json({
        success: false,
        message: "Select a victim before running the port scan.",
      });
    }

    const victim = await inspectContainer(VICTIM_CONTAINER);

    if (!victim.running || !victim.ipAddress) {
      return res.status(400).json({
        success: false,
        message: "Victim has no active CyberLab network address.",
      });
    }

    const targets = [
      {
        port: 22,
        service: "SSH",
      },
      {
        port: 80,
        service: "HTTP",
      },
      {
        port: 443,
        service: "HTTPS",
      },
      {
        port: 8080,
        service: "HTTP / Victim API",
      },
      {
        port: 5000,
        service: "CyberLab Backend",
      },
      {
        port: 5173,
        service: "CyberLab Frontend",
      },
    ];

    const results = await Promise.all(
      targets.map(async ({ port, service }) => ({
        port,
        protocol: "tcp",
        state: (await probePort(victim.ipAddress, port))
          ? "open"
          : "closed",
        service,
      }))
    );

    const openPorts = results.filter(
      (item) => item.state === "open"
    );

    const scan = {
      victim: victim.name,
      ipAddress: victim.ipAddress,
      scannedAt: new Date().toISOString(),
      ports: openPorts,
      allPorts: results,
    };

    labState.lastPortScan = scan;

    res.json({
      success: true,
      target: victim,
      scan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/scan", (req, res) => {
  res.json({
    success: true,
    scan: labState.lastPortScan,
  });
});

/* =========================================================
   FILES
========================================================= */

app.get("/api/files", async (req, res) => {
  try {
    const data = await getFiles();

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================================================
   ATTACK
========================================================= */

app.post("/api/attack", async (req, res) => {
  try {
    if (!labState.selectedVictim) {
      return res.status(400).json({
        success: false,
        message: "Select a victim before starting the attack.",
      });
    }

    const victim = await inspectContainer(VICTIM_CONTAINER);

    if (!victim.running) {
      return res.status(400).json({
        success: false,
        message: "Victim container is not running.",
      });
    }

    const attacker = await inspectContainer(
      ATTACKER_CONTAINER
    );

    if (attacker.running) {
      return res.json({
        success: true,
        status: "already_running",
        message: "Attacker is already running.",
      });
    }

    await docker([
      "start",
      ATTACKER_CONTAINER,
    ]);

    res.json({
      success: true,
      status: "started",
      message: "Attacker container started.",
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================================================
   RECOVERY
========================================================= */

app.post("/api/recover", async (req, res) => {
  try {
    const attacker = await inspectContainer(
      ATTACKER_CONTAINER
    );

    if (!attacker.running) {
      return res.status(400).json({
        success: false,
        message:
          "Attacker is not running. Start the ransomware simulation first.",
      });
    }

    await docker([
      "exec",
      ATTACKER_CONTAINER,
      "touch",
      "/app/recover.trigger",
    ]);

    res.json({
      success: true,
      status: "recovery_triggered",
      message: "Recovery trigger sent to attacker.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================================================
   CURRENT LOGS
========================================================= */

app.get("/api/logs/victim", async (req, res) => {
  try {
    const logs = await getCurrentLogs(
      VICTIM_CONTAINER
    );

    res.json({
      success: true,
      container: VICTIM_CONTAINER,
      scope: "current-container-run",
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      logs: "",
    });
  }
});

app.get("/api/logs/attacker", async (req, res) => {
  try {
    const logs = await getCurrentLogs(
      ATTACKER_CONTAINER
    );

    res.json({
      success: true,
      container: ATTACKER_CONTAINER,
      scope: "current-container-run",
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      logs: "",
    });
  }
});

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    name: "CyberLab Security Simulation Backend",
    version: "2.0",
    status: "online",
  });
});

/* =========================================================
   START SERVER
========================================================= */


app.post("/api/victim/clear", (req, res) => {
  labState.selectedVictim = null;

  res.json({
    success: true,
    message: "Victim selection cleared",
    selectedVictim: null
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================");
  console.log("   CYBERSECURITY LAB WEB BACKEND");
  console.log("==========================================");
  console.log(`API: http://localhost:${PORT}`);
  console.log("Docker integration: ENABLED");
  console.log(`CyberLab network: ${NETWORK_NAME}`);
  console.log("==========================================");
});
