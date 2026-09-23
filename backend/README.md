# CyberLab Backend

Backend API for the Cybersecurity Attack Simulation Labs platform.

## Purpose

This service provides a local REST API for the SOC dashboard and communicates with the Docker-based cybersecurity simulation lab.

It is responsible for:

- Monitoring Docker container status
- Starting the controlled attacker simulation
- Triggering file recovery
- Reading victim and attacker logs
- Reporting runtime file statistics from the victim container

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/status` | Get Docker container status |
| GET | `/api/files` | Get target directory, file statistics, folders, and file paths |
| POST | `/api/attack` | Start the attacker simulation |
| POST | `/api/recover` | Trigger recovery |
| GET | `/api/logs/victim` | Get victim container logs |
| GET | `/api/logs/attacker` | Get attacker container logs |

## Run

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm start
```

The API will be available at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## File Monitoring

The `/api/files` endpoint reads the current contents of the victim's lab target directory.

The default target directory used by the simulation is:

```text
/lab-target
```

The endpoint reports:

- Target directory
- Total file count
- Normal file count
- Locked file count
- Folder count
- Folder names
- File count per folder
- Runtime file paths

Example response structure:

```json
{
  "success": true,
  "targetDirectory": "/lab-target",
  "statistics": {
    "totalFiles": 6,
    "normalFiles": 6,
    "lockedFiles": 0,
    "folderCount": 3
  },
  "folders": [
    {
      "name": "data",
      "count": 2
    },
    {
      "name": "documents",
      "count": 3
    },
    {
      "name": "images",
      "count": 1
    }
  ],
  "files": [
    "data/database.json",
    "data/students.csv",
    "documents/project.txt"
  ]
}
```

The SOC dashboard uses this information to display the current state of the simulated victim filesystem.

## Security Scope

This backend is designed for a controlled cybersecurity simulation environment.

Attack and recovery operations should only be performed against the isolated Docker lab and intentionally created test files.

Do not connect the simulation to systems or files that you do not own or have explicit authorization to test.
