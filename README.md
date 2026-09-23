# 🛡️ Cybersecurity Attack Simulation Labs

> A modular platform for controlled cybersecurity simulation, monitoring, analysis, and recovery.

<p align="center">

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Lab-Docker-2496ED?logo=docker&logoColor=white)
![Linux](https://img.shields.io/badge/OS-Fedora-51A2DA?logo=fedora&logoColor=white)

</p>

---

## 🎯 Overview

**Cybersecurity Attack Simulation Labs** is a controlled security laboratory platform for learning, research, and defensive security testing.

It combines a **React SOC dashboard**, **Node.js backend**, and **isolated Docker laboratories** to provide a single interface for:

- 📊 Monitoring laboratory status
- ⚡ Running controlled simulations
- 📜 Viewing security telemetry
- 🔄 Testing recovery workflows

### Current Laboratory

🦠 **Ransomware Simulation Lab**

The architecture is designed so additional cybersecurity laboratories can be added later.

---

## 🏗️ System Architecture

```text
┌───────────────────────────────────────────────┐
│              🖥️ SOC DASHBOARD                │
│                                               │
│  📊 Status   ⚡ Attack   🔄 Recovery   📜 Logs │
│                                               │
│              React + Vite                     │
└───────────────────────┬───────────────────────┘
                        │
                     REST API
                        │
                        ▼
┌───────────────────────────────────────────────┐
│               ⚙️ BACKEND API                  │
│                                               │
│             Node.js + Express                 │
│                                               │
│  Health │ Status │ Attack │ Recovery │ Logs  │
└───────────────────────┬───────────────────────┘
                        │
                    Docker CLI
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              🐳 ISOLATED LAB                  │
│                                               │
│     ┌──────────────┐     ┌──────────────┐     │
│     │ ⚠️ ATTACKER  │ ──▶ │ 🖥️ VICTIM    │     │
│     │  Container   │     │  Container   │     │
│     └──────────────┘     └──────────────┘     │
└───────────────────────────────────────────────┘
```

---

## 🔄 Simulation Flow

```text
┌──────────────┐
│ 👤 SOC User  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Start Simulation │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ ⚠️ Attacker Lab  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 🖥️ Victim Lab    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 📜 Logs & Events │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 🔍 Security View │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 🔄 Recovery      │
└──────────────────┘
```

---

## 🧩 Technology Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | React + Vite |
| 🧩 UI Icons | Lucide React |
| ⚙️ Backend | Node.js + Express |
| 🐳 Laboratory | Docker |
| 🐍 Simulation | Python |
| 🐧 Operating System | Linux / Fedora |
| 🔧 Development | Git + GitHub |

---

## 📁 Project Structure

```text
cybersecurity-attack-simulation-labs/
│
├── README.md
├── .gitignore
│
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
└── labs/
    └── ransomware/
        ├── attacker/
        └── victim/
```

---

## 🔌 API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check backend health |
| `GET` | `/api/status` | Check Docker containers |
| `POST` | `/api/attack` | Start controlled simulation |
| `POST` | `/api/recover` | Start recovery workflow |
| `GET` | `/api/logs/victim` | Read victim logs |
| `GET` | `/api/logs/attacker` | Read attacker logs |

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone git@github.com:ali-hussain786/cybersecurity-attack-simulation-labs.git
cd cybersecurity-attack-simulation-labs
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

### 3. Start the Backend

Open another terminal:

```bash
cd backend
npm install
node server.js
```

Backend:

```text
http://localhost:5000
```

Test:

```bash
curl http://localhost:5000/api/health
```

---

## 🐳 Laboratory Environment

The laboratory uses Docker to keep simulation components isolated from the host's production environment.

```text
                 🐧 LOCAL HOST
                       │
                       ▼
                ┌─────────────┐
                │ 🐳 Docker   │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
       ┌─────────────┐   ┌─────────────┐
       │ ⚠️ Attacker │──▶│ 🖥️ Victim   │
       │  Container  │   │  Container  │
       └─────────────┘   └─────────────┘
```

---

## 🔐 Security

This project is intended for:

- 🎓 Education
- 🔬 Security research
- 🧪 Controlled laboratory testing
- 🛡️ Defensive security analysis

Only run simulations against systems you own or are explicitly authorized to test.

The Docker-control backend should remain within the controlled laboratory environment and should **not be exposed directly to the public internet**.

---

## 🔮 Future Laboratories

The platform is designed to support additional security scenarios:

```text
🦠 Ransomware Simulation
        │
        ├── 🌐 Web Security
        ├── 🎣 Phishing Awareness
        ├── 🔑 Authentication Security
        ├── 📡 Network Security
        ├── 🔍 Malware Analysis
        ├── 🚨 Incident Response
        └── 🛡️ Defensive Monitoring
```

---

## 📈 Development Roadmap

```text
Phase 1 ──► 🧪 Laboratory
             Docker + Attacker + Victim

Phase 2 ──► 🖥️ SOC Dashboard
             React + Express + Logs

Phase 3 ──► 🔍 Security Monitoring
             Events + Detection + Analysis

Phase 4 ──► 🧩 Multi-Lab Platform
             Multiple cybersecurity scenarios
```

---

## ⚖️ Responsible Use

This platform is developed for educational and defensive-security purposes.

Use it only in authorized and isolated environments.

**Never use the simulation components against systems, networks, or data without explicit permission.**

---

## 👨‍💻 Author

**Ali Hussain**

Cybersecurity Attack Simulation Labs

> **Controlled Simulation • Security Research • Defensive Analysis**
