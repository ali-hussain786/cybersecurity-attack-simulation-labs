# CyberLab Backend

Node.js and Express REST API for the Cybersecurity Attack Simulation Labs platform.

## Responsibilities

- Check backend and Docker CLI health
- Report configured lab container status
- Discover containers on the lab
- Select or clear the controlled victim
- Probe selected TCP ports on the selected victim
- Report file state under `/lab-target`
- Start the controlled attacker simulation
- Trigger recovery
- Retrieve attacker and victim logs

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health and Docker CLI availability |
| GET | `/api/status` | Get configured container status |
| GET | `/api/network/discovery` | Discover lab containers |
| GET | `/api/victim/selected` | Get current victim selection |
| POST | `/api/victim/select` | Select the controlled victim |
| POST | `/api/victim/clear` | Clear the selected victim |
| POST | `/api/scan` | Check configured TCP ports on the selected victim |
| GET | `/api/scan` | Get the latest scan result |
| GET | `/api/files` | Read files and file-state statistics under `/lab-target` |
| POST | `/api/attack` | Start the controlled attacker simulation |
| POST | `/api/recover` | Trigger recovery |
| GET | `/api/logs/victim` | Retrieve victim logs |
| GET | `/api/logs/attacker` | Retrieve attacker logs |

Browser activity telemetry endpoints have been removed.

## Run

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm start
```

The API listens on port `5000` by default.

Health check:

```bash
curl -i http://localhost:5000/api/health
```

## Security scope

Use the backend only in the authorized, isolated lab. It can control Docker containers through the Docker CLI, so do not expose it or its Docker socket to the public internet.
