# Cybersecurity Attack Simulation Labs

A modular platform for controlled cybersecurity simulation, monitoring, analysis, and recovery.

## Overview

CyberLab is an educational security lab that combines a React/Vite SOC dashboard, a Node.js/Express API, and an isolated Docker lab. The current lab focuses on a controlled ransomware simulation and its defensive observation and recovery workflow.

### Current capabilities

- SOC dashboard and lab status
- Network discovery of configured lab containers
- Manual victim selection
- Selected-port connectivity checks against the selected lab victim
- Controlled ransomware simulation controls
- Victim file-state inspection
- Attacker and victim logs
- Recovery workflow
- Victim desktop access
- Reports and evidence views

**Browser Activity Lab, Browser Activity Monitor, Browser Event History, and the dedicated browser telemetry test page have been removed from the application.** Victim Desktop remains available as a separate lab-access screen.

## Architecture

```text
React + Vite SOC Dashboard
          |
          | HTTP / JSON
          v
Node.js + Express API
          |
          | Docker CLI
          v
Isolated Docker lab
   |             |
Attacker       Victim
```

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| UI icons | Lucide React |
| Backend | Node.js + Express |
| HTTP communication | Fetch API / JSON |
| Lab environment | Docker |
| Simulation components | Python |
| Development platform | Linux / Fedora, Git and GitHub |

Use the package manifests in `frontend/package.json` and `backend/package.json` as the source of truth for installed dependency versions.

## Project structure

```text
cybersecurity-attack-simulation-labs/
├── README.md
├── docker-compose.yml
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── services/
│           └── api.js
└── backend/
    ├── package.json
    └── server.js
```

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check backend and Docker CLI availability |
| `GET` | `/api/status` | Retrieve known lab container status |
| `GET` | `/api/network/discovery` | Discover configured lab containers |
| `GET` | `/api/victim/selected` | Get the selected victim |
| `POST` | `/api/victim/select` | Select the controlled victim container |
| `POST` | `/api/victim/clear` | Clear the current victim selection |
| `POST` | `/api/scan` | Check configured TCP ports on the selected victim |
| `GET` | `/api/scan` | Retrieve the most recent scan result |
| `GET` | `/api/files` | Read current files under the victim's `/lab-target` directory |
| `POST` | `/api/attack` | Start the controlled attacker simulation |
| `POST` | `/api/recover` | Trigger the lab recovery workflow |
| `GET` | `/api/logs/victim` | Retrieve victim container logs for the current run |
| `GET` | `/api/logs/attacker` | Retrieve attacker container logs for the current run |

## Quick start

### Option A: Docker Compose

From the project root, ensure the external `cyberlab` Docker network already exists, then run:

```bash
docker compose up -d
docker compose ps
```

Frontend: <http://localhost:5173>
Backend health: <http://localhost:5000/api/health>

Stop the Compose services with:

```bash
docker compose down
```

This stops the Compose services; it does not intentionally remove the external `cyberlab` network or unrelated lab containers.

### Option B: Run services locally

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend in another terminal:

```bash
cd backend
npm install
npm start
```

Check the backend:

```bash
curl -i http://localhost:5000/api/health
```

Use the project's configured environment and Docker context. Do not expose the Docker-control backend or Docker socket to the public internet.

## Lab scope and safety

This project is for education, defensive security research, and authorized testing in an isolated environment. Run simulations only against intentionally created lab targets that you own or are authorized to test. Preserve evidence and verify file state before claiming an attack or recovery succeeded.

The backend has Docker-control capabilities. Keep it restricted to the local lab environment and protect access to the Docker socket.

## Responsible use

Never use simulation components against systems, networks, or data without explicit authorization.
