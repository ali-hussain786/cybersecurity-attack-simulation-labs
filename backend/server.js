// // const express = require("express");
// // const cors = require("cors");
// // const { exec } = require("child_process");

// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // /* =========================================
// //    Middleware
// // ========================================= */

// // app.use(cors());
// // app.use(express.json());

// // /* =========================================
// //    Docker Command Helper
// // ========================================= */

// // function runDocker(command) {
// //   return new Promise((resolve, reject) => {
// //     exec(command, (error, stdout, stderr) => {
// //       if (error) {
// //         reject({
// //           message: error.message,
// //           stdout,
// //           stderr,
// //         });
// //         return;
// //       }

// //       resolve({
// //         stdout: stdout.trim(),
// //         stderr: stderr.trim(),
// //       });
// //     });
// //   });
// // }

// // /* =========================================
// //    Health Check
// // ========================================= */

// // app.get("/api/health", (req, res) => {
// //   res.json({
// //     success: true,
// //     service: "Cybersecurity Attack Simulation Labs",
// //     status: "online",
// //   });
// // });

// // /* =========================================
// //    Docker Status
// // ========================================= */

// // app.get("/api/status", async (req, res) => {
// //   try {
// //     const result = await runDocker(
// //       "docker ps -a --format '{{.Names}}|{{.Status}}|{{.Image}}|{{.Ports}}'"
// //     );

// //     const containers = result.stdout
// //       ? result.stdout.split("\n").map((line) => {
// //           const [name, status, image, ports] = line.split("|");

// //           return {
// //             name,
// //             status,
// //             image,
// //             ports: ports || "",
// //           };
// //         })
// //       : [];

// //     res.json({
// //       success: true,
// //       containers,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Unable to read Docker container status.",
// //       error: error.stderr || error.message,
// //     });
// //   }
// // });

// // /* =========================================
// //    File / Folder Statistics
// // ========================================= */

// // app.get("/api/files", async (req, res) => {
// //   try {
// //     /*
// //       Ask the victim container for its complete
// //       runtime file tree.

// //       Each line returned by find represents a file.
// //     */

// //     const result = await runDocker(
// //       "docker exec victim sh -c 'find /lab-target -type f -printf \"%P\\\\n\" 2>/dev/null'"
// //     );

// //     const files = result.stdout
// //       ? result.stdout
// //           .split("\n")
// //           .map((file) => file.trim())
// //           .filter(Boolean)
// //       : [];

// //     const normalFiles = files.filter(
// //       (file) => !file.endsWith(".locked")
// //     );

// //     const lockedFiles = files.filter(
// //       (file) => file.endsWith(".locked")
// //     );

// //     /*
// //       Build folder statistics.

// //       Example:

// //       documents/project.txt
// //       documents/report.txt

// //       becomes:

// //       documents -> 2 files
// //     */

// //     const folderMap = {};

// //     files.forEach((file) => {
// //       const parts = file.split("/");

// //       if (parts.length <= 1) {
// //         const folder = "/";
// //         folderMap[folder] = (folderMap[folder] || 0) + 1;
// //         return;
// //       }

// //       const folder = parts.slice(0, -1).join("/");

// //       folderMap[folder] = (folderMap[folder] || 0) + 1;
// //     });

// //     const folders = Object.entries(folderMap).map(
// //       ([name, count]) => ({
// //         name,
// //         count,
// //       })
// //     );

// //     folders.sort((a, b) => a.name.localeCompare(b.name));

// //     res.json({
// //       success: true,

// //       targetDirectory: "/lab-target",

// //       statistics: {
// //         totalFiles: files.length,
// //         normalFiles: normalFiles.length,
// //         lockedFiles: lockedFiles.length,
// //         folderCount: folders.length,
// //       },

// //       folders,

// //       files: files.sort(),
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Unable to retrieve victim file information.",
// //       error: error.stderr || error.message,
// //     });
// //   }
// // });

// // /* =========================================
// //    Start Attack Simulation
// // ========================================= */

// // app.post("/api/attack", async (req, res) => {
// //   try {
// //     await runDocker("docker start attacker");

// //     res.json({
// //       success: true,
// //       message: "Attack simulation started.",
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Unable to start attack simulation.",
// //       error: error.stderr || error.message,
// //     });
// //   }
// // });

// // /* =========================================
// //    Recovery
// // ========================================= */

// // app.post("/api/recover", async (req, res) => {
// //   try {
// //     await runDocker(
// //       "docker exec attacker touch /app/recover.trigger"
// //     );

// //     res.json({
// //       success: true,
// //       message: "Recovery signal sent.",
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Unable to send recovery signal.",
// //       error: error.stderr || error.message,
// //     });
// //   }
// // });

// // /* =========================================
// //    Victim Logs
// // ========================================= */

// // app.get("/api/logs/victim", async (req, res) => {
// //   try {
// //     const result = await runDocker(
// //       "docker logs --tail 200 victim"
// //     );

// //     res.json({
// //       success: true,
// //       container: "victim",
// //       logs: result.stdout,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Unable to retrieve victim logs.",
// //       error: error.stderr || error.message,
// //     });
// //   }
// // });

// // /* =========================================
// //    Attacker Logs
// // ========================================= */

// // app.get("/api/logs/attacker", async (req, res) => {
// //   try {
// //     const result = await runDocker(
// //       "docker logs --tail 200 attacker"
// //     );

// //     res.json({
// //       success: true,
// //       container: "attacker",
// //       logs: result.stdout,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Unable to retrieve attacker logs.",
// //       error: error.stderr || error.message,
// //     });
// //   }
// // });

// // /* =========================================
// //    Root Endpoint
// // ========================================= */

// // app.get("/", (req, res) => {
// //   res.json({
// //     service: "Cybersecurity Attack Simulation Labs",
// //     backend: "online",
// //   });
// // });

// // /* =========================================
// //    Start Server
// // ========================================= */

// // app.listen(PORT, () => {
// //   console.log("");
// //   console.log("==========================================");
// //   console.log("   CYBERSECURITY LAB WEB BACKEND");
// //   console.log("==========================================");
// //   console.log(`API: http://localhost:${PORT}`);
// //   console.log("Docker integration: ENABLED");
// //   console.log("File monitoring: ENABLED");
// //   console.log("==========================================");
// //   console.log("");
// // });

// const express = require("express");
// const cors = require("cors");
// const { exec } = require("child_process");

// const app = express();
// const PORT = process.env.PORT || 5000;

// /* =========================================
//    Middleware
// ========================================= */

// app.use(cors());
// app.use(express.json());

// /* =========================================
//    CyberLab Runtime State
// ========================================= */

// const labState = {
//   selectedVictim: null,
// };

// /* =========================================
//    Docker Command Helper
// ========================================= */

// function runDocker(command) {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject({
//           message: error.message,
//           stdout,
//           stderr,
//         });
//         return;
//       }

//       resolve({
//         stdout: stdout.trim(),
//         stderr: stderr.trim(),
//       });
//     });
//   });
// }

// /* =========================================
//    Docker Discovery Helpers
// ========================================= */

// async function getDockerContainers() {
//   const result = await runDocker(
//     "docker ps -a --format '{{.Names}}|{{.Status}}|{{.Image}}|{{.Ports}}'"
//   );

//   if (!result.stdout) {
//     return [];
//   }

//   return result.stdout.split("\n").map((line) => {
//     const [name, status, image, ports] = line.split("|");

//     return {
//       name,
//       status,
//       image,
//       ports: ports || "",
//     };
//   });
// }

// async function getContainerNetworkInfo(containerName) {
//   try {
//     const result = await runDocker(
//       `docker inspect -f '{{range .NetworkSettings.Networks}}{{.NetworkID}}|{{.IPAddress}}|{{.Gateway}}{{end}}' ${containerName}`
//     );

//     if (!result.stdout) {
//       return {
//         networkId: null,
//         ipAddress: null,
//         gateway: null,
//       };
//     }

//     const [networkId, ipAddress, gateway] =
//       result.stdout.split("|");

//     return {
//       networkId: networkId || null,
//       ipAddress: ipAddress || null,
//       gateway: gateway || null,
//     };
//   } catch {
//     return {
//       networkId: null,
//       ipAddress: null,
//       gateway: null,
//     };
//   }
// }

// /* =========================================
//    Health Check
// ========================================= */

// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     service: "Cybersecurity Attack Simulation Labs",
//     status: "online",
//   });
// });

// /* =========================================
//    Docker Status
// ========================================= */

// app.get("/api/status", async (req, res) => {
//   try {
//     const containers = await getDockerContainers();

//     res.json({
//       success: true,
//       containers,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to read Docker container status.",
//       error: error.stderr || error.message,
//     });
//   }
// });

// /* =========================================
//    Network Discovery
// ========================================= */

// app.get("/api/network/discovery", async (req, res) => {
//   try {
//     const containers = await getDockerContainers();

//     const discovered = await Promise.all(
//       containers.map(async (container) => {
//         const network = await getContainerNetworkInfo(
//           container.name
//         );

//         return {
//           ...container,
//           ipAddress: network.ipAddress,
//           gateway: network.gateway,
//           networkId: network.networkId,
//           reachable: container.status.startsWith("Up"),
//         };
//       })
//     );

//     res.json({
//       success: true,
//       network: "cyberlab",
//       discoveredAt: new Date().toISOString(),
//       count: discovered.length,
//       containers: discovered,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to discover CyberLab network.",
//       error: error.stderr || error.message,
//     });
//   }
// });

// /* =========================================
//    Victim Selection
// ========================================= */

// app.post("/api/victim/select", async (req, res) => {
//   try {
//     const { container } = req.body;

//     if (!container) {
//       return res.status(400).json({
//         success: false,
//         message: "Container name is required.",
//       });
//     }

//     const containers = await getDockerContainers();

//     const target = containers.find(
//       (item) => item.name === container
//     );

//     if (!target) {
//       return res.status(404).json({
//         success: false,
//         message: `Container '${container}' was not found.`,
//       });
//     }

//     labState.selectedVictim = {
//       name: target.name,
//       image: target.image,
//       status: target.status,
//       selectedAt: new Date().toISOString(),
//     };

//     res.json({
//       success: true,
//       message: "Victim selected successfully.",
//       victim: labState.selectedVictim,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to select victim.",
//       error: error.stderr || error.message,
//     });
//   }
// });

// /* =========================================
//    Get Selected Victim
// ========================================= */

// app.get("/api/victim/selected", (req, res) => {
//   res.json({
//     success: true,
//     victim: labState.selectedVictim,
//   });
// });

// /* =========================================
//    File / Folder Statistics
// ========================================= */

// app.get("/api/files", async (req, res) => {
//   try {
//     /*
//       Ask the victim container for its complete
//       runtime file tree.

//       Each line returned by find represents a file.
//     */

//     const result = await runDocker(
//       "docker exec victim sh -c 'find /lab-target -type f -printf \"%P\\\\n\" 2>/dev/null'"
//     );

//     const files = result.stdout
//       ? result.stdout
//           .split("\n")
//           .map((file) => file.trim())
//           .filter(Boolean)
//       : [];

//     const normalFiles = files.filter(
//       (file) => !file.endsWith(".locked")
//     );

//     const lockedFiles = files.filter(
//       (file) => file.endsWith(".locked")
//     );

//     /*
//       Build folder statistics.

//       Example:

//       documents/project.txt
//       documents/report.txt

//       becomes:

//       documents -> 2 files
//     */

//     const folderMap = {};

//     files.forEach((file) => {
//       const parts = file.split("/");

//       if (parts.length <= 1) {
//         const folder = "/";
//         folderMap[folder] = (folderMap[folder] || 0) + 1;
//         return;
//       }

//       const folder = parts.slice(0, -1).join("/");

//       folderMap[folder] = (folderMap[folder] || 0) + 1;
//     });

//     const folders = Object.entries(folderMap).map(
//       ([name, count]) => ({
//         name,
//         count,
//       })
//     );

//     folders.sort((a, b) => a.name.localeCompare(b.name));

//     res.json({
//       success: true,

//       targetDirectory: "/lab-target",

//       statistics: {
//         totalFiles: files.length,
//         normalFiles: normalFiles.length,
//         lockedFiles: lockedFiles.length,
//         folderCount: folders.length,
//       },

//       folders,

//       files: files.sort(),
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to retrieve victim file information.",
//       error: error.stderr || error.message,
//     });
//   }
// });

// /* =========================================
//    Start Attack Simulation
// ========================================= */

// app.post("/api/attack", async (req, res) => {
//   try {
//     await runDocker("docker start attacker");

//     res.json({
//       success: true,
//       message: "Attack simulation started.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to start attack simulation.",
//       error: error.stderr || error.message,
//     });
//   }
// });

// /* =========================================
//    Recovery
// ========================================= */

// app.post("/api/recover", async (req, res) => {
//   try {
//     await runDocker(
//       "docker exec attacker touch /app/recover.trigger"
//     );

//     res.json({
//       success: true,
//       message: "Recovery signal sent.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to send recovery signal.",
//       error: error.stderr || error.message,
//     });
//   }
// });

// /* =========================================
//    Victim Logs
// ========================================= */

// app.get("/api/logs/victim", async (req, res) => {
//   try {
//     const result = await runDocker(
//       "docker logs --tail 200 victim"
//     );

//     res.json({
//       success: true,
//       container: "victim",
//       logs: result.stdout,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to retrieve victim logs.",
//       error: error.stderr || error.message,
//     });
//   }
// });

// /* =========================================
//    Attacker Logs
// ========================================= */

// app.get("/api/logs/attacker", async (req, res) => {
//   try {
//     const result = await runDocker(
//       "docker logs --tail 200 attacker"
//     );

//     res.json({
//       success: true,
//       container: "attacker",
//       logs: result.stdout,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to retrieve attacker logs.",
//       error: error.stderr || error.message,
//     });
//   }
// });

// /* =========================================
//    Root Endpoint
// ========================================= */

// app.get("/", (req, res) => {
//   res.json({
//     service: "Cybersecurity Attack Simulation Labs",
//     backend: "online",
//   });
// });

// /* =========================================
//    Start Server
// ========================================= */

// app.listen(PORT, () => {
//   console.log("");
//   console.log("==========================================");
//   console.log("   CYBERSECURITY LAB WEB BACKEND");
//   console.log("==========================================");
//   console.log(`API: http://localhost:${PORT}`);
//   console.log("Docker integration: ENABLED");
//   console.log("File monitoring: ENABLED");
//   console.log("Network discovery: ENABLED");
//   console.log("Victim selection: ENABLED");
//   console.log("==========================================");
//   console.log("");
// });
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================================
   Middleware
========================================= */

app.use(cors());
app.use(express.json());

/* =========================================
   CyberLab Runtime State
========================================= */

const labState = {
  selectedVictim: null,
  lastPortScan: null,
};

/* =========================================
   Docker Command Helper
========================================= */

function runDocker(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({
          message: error.message,
          stdout,
          stderr,
        });
        return;
      }

      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

/* =========================================
   Docker Discovery Helpers
========================================= */

async function getDockerContainers() {
  const result = await runDocker(
    "docker ps -a --format '{{.Names}}|{{.Status}}|{{.Image}}|{{.Ports}}'"
  );

  if (!result.stdout) {
    return [];
  }

  return result.stdout.split("\n").map((line) => {
    const [name, status, image, ports] = line.split("|");

    return {
      name,
      status,
      image,
      ports: ports || "",
    };
  });
}

async function getContainerNetworkInfo(containerName) {
  try {
    const result = await runDocker(
      `docker inspect -f '{{range .NetworkSettings.Networks}}{{.NetworkID}}|{{.IPAddress}}|{{.Gateway}}{{end}}' ${containerName}`
    );

    if (!result.stdout) {
      return {
        networkId: null,
        ipAddress: null,
        gateway: null,
      };
    }

    const [networkId, ipAddress, gateway] =
      result.stdout.split("|");

    return {
      networkId: networkId || null,
      ipAddress: ipAddress || null,
      gateway: gateway || null,
    };
  } catch {
    return {
      networkId: null,
      ipAddress: null,
      gateway: null,
    };
  }
}

/* =========================================
   Health Check
========================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Cybersecurity Attack Simulation Labs",
    status: "online",
  });
});

/* =========================================
   Docker Status
========================================= */

app.get("/api/status", async (req, res) => {
  try {
    const containers = await getDockerContainers();

    res.json({
      success: true,
      containers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to read Docker container status.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Network Discovery
========================================= */

app.get("/api/network/discovery", async (req, res) => {
  try {
    const containers = await getDockerContainers();

    const discovered = await Promise.all(
      containers.map(async (container) => {
        const network = await getContainerNetworkInfo(
          container.name
        );

        return {
          ...container,
          ipAddress: network.ipAddress,
          gateway: network.gateway,
          networkId: network.networkId,
          reachable: container.status.startsWith("Up"),
        };
      })
    );

    res.json({
      success: true,
      network: "cyberlab",
      discoveredAt: new Date().toISOString(),
      count: discovered.length,
      containers: discovered,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to discover CyberLab network.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Victim Selection
========================================= */

app.post("/api/victim/select", async (req, res) => {
  try {
    const { container } = req.body;

    if (!container) {
      return res.status(400).json({
        success: false,
        message: "Container name is required.",
      });
    }

    const containers = await getDockerContainers();

    const target = containers.find(
      (item) => item.name === container
    );

    if (!target) {
      return res.status(404).json({
        success: false,
        message: `Container '${container}' was not found.`,
      });
    }

    labState.selectedVictim = {
      name: target.name,
      image: target.image,
      status: target.status,
      selectedAt: new Date().toISOString(),
    };

    /*
      New victim selection invalidates the previous
      port-scan result.
    */

    labState.lastPortScan = null;

    res.json({
      success: true,
      message: "Victim selected successfully.",
      victim: labState.selectedVictim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to select victim.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Get Selected Victim
========================================= */

app.get("/api/victim/selected", (req, res) => {
  res.json({
    success: true,
    victim: labState.selectedVictim,
  });
});

/* =========================================
   Port Scanner
========================================= */

/*
  The scanner operates ONLY against the currently
  selected Docker victim.

  It does not accept arbitrary external targets.
*/

app.post("/api/scan", async (req, res) => {
  try {
    if (!labState.selectedVictim) {
      return res.status(400).json({
        success: false,
        message: "No victim has been selected.",
      });
    }

    const victimName = labState.selectedVictim.name;

    const network = await getContainerNetworkInfo(
      victimName
    );

    if (!network.ipAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Selected victim does not currently have a Docker IP address.",
      });
    }

    /*
      Check the known lab service port first.

      The existing victim application listens on TCP 8080.
      We use Docker's own network namespace to test the
      selected victim's service.
    */

    const scanCommand =
      `docker run --rm --network container:${victimName} ` +
      `alpine:3.20 sh -c ` +
      `"apk add --no-cache busybox-extras >/dev/null 2>&1 && ` +
      `nc -zvw1 127.0.0.1 8080"`;

    let portStatus = "closed";
    let scanOutput = "";

    try {
      const result = await runDocker(scanCommand);

      scanOutput = [result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n");

      portStatus = "open";
    } catch (error) {
      scanOutput = [
        error.stdout,
        error.stderr,
        error.message,
      ]
        .filter(Boolean)
        .join("\n");

      portStatus = "closed";
    }

    const ports = [
      {
        port: 8080,
        protocol: "tcp",
        state: portStatus,
        service: portStatus === "open"
          ? "HTTP / Victim API"
          : "unknown",
      },
    ];

    labState.lastPortScan = {
      victim: victimName,
      ipAddress: network.ipAddress,
      scannedAt: new Date().toISOString(),
      ports,
      output: scanOutput,
    };

    res.json({
      success: true,
      target: {
        name: victimName,
        ipAddress: network.ipAddress,
      },
      scan: labState.lastPortScan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to perform port scan.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Get Last Port Scan
========================================= */

app.get("/api/scan", (req, res) => {
  res.json({
    success: true,
    scan: labState.lastPortScan,
  });
});

/* =========================================
   File / Folder Statistics
========================================= */

app.get("/api/files", async (req, res) => {
  try {
    /*
      Ask the victim container for its complete
      runtime file tree.

      Each line returned by find represents a file.
    */

    const result = await runDocker(
      "docker exec victim sh -c 'find /lab-target -type f -printf \"%P\\\\n\" 2>/dev/null'"
    );

    const files = result.stdout
      ? result.stdout
          .split("\n")
          .map((file) => file.trim())
          .filter(Boolean)
      : [];

    const normalFiles = files.filter(
      (file) => !file.endsWith(".locked")
    );

    const lockedFiles = files.filter(
      (file) => file.endsWith(".locked")
    );

    /*
      Build folder statistics.
    */

    const folderMap = {};

    files.forEach((file) => {
      const parts = file.split("/");

      if (parts.length <= 1) {
        const folder = "/";
        folderMap[folder] = (folderMap[folder] || 0) + 1;
        return;
      }

      const folder = parts.slice(0, -1).join("/");

      folderMap[folder] = (folderMap[folder] || 0) + 1;
    });

    const folders = Object.entries(folderMap).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    folders.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,

      targetDirectory: "/lab-target",

      statistics: {
        totalFiles: files.length,
        normalFiles: normalFiles.length,
        lockedFiles: lockedFiles.length,
        folderCount: folders.length,
      },

      folders,

      files: files.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve victim file information.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Start Attack Simulation
========================================= */

app.post("/api/attack", async (req, res) => {
  try {
    await runDocker("docker start attacker");

    res.json({
      success: true,
      message: "Attack simulation started.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to start attack simulation.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Recovery
========================================= */

app.post("/api/recover", async (req, res) => {
  try {
    await runDocker(
      "docker exec attacker touch /app/recover.trigger"
    );

    res.json({
      success: true,
      message: "Recovery signal sent.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to send recovery signal.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Victim Logs
========================================= */

app.get("/api/logs/victim", async (req, res) => {
  try {
    const result = await runDocker(
      "docker logs --tail 200 victim"
    );

    res.json({
      success: true,
      container: "victim",
      logs: result.stdout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve victim logs.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Attacker Logs
========================================= */

app.get("/api/logs/attacker", async (req, res) => {
  try {
    const result = await runDocker(
      "docker logs --tail 200 attacker"
    );

    res.json({
      success: true,
      container: "attacker",
      logs: result.stdout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve attacker logs.",
      error: error.stderr || error.message,
    });
  }
});

/* =========================================
   Root Endpoint
========================================= */

app.get("/", (req, res) => {
  res.json({
    service: "Cybersecurity Attack Simulation Labs",
    backend: "online",
  });
});

/* =========================================
   Start Server
========================================= */

app.listen(PORT, () => {
  console.log("");
  console.log("==========================================");
  console.log("   CYBERSECURITY LAB WEB BACKEND");
  console.log("==========================================");
  console.log(`API: http://localhost:${PORT}`);
  console.log("Docker integration: ENABLED");
  console.log("File monitoring: ENABLED");
  console.log("Network discovery: ENABLED");
  console.log("Victim selection: ENABLED");
  console.log("Port scanner: ENABLED");
  console.log("==========================================");
  console.log("");
});