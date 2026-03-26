# SafeGuard

> **Digitising the Justice System** — An AI-powered platform connecting victims, law enforcement, legal professionals, and the judiciary through a single, intelligent, blockchain-secured ecosystem.

---

## Overview

SafeGuard is a comprehensive digital justice platform designed to modernise every facet of the criminal justice lifecycle — from first incident report to final verdict. It bridges the gap between citizens, law enforcement, legal professionals, healthcare providers, and the judiciary through a unified, AI-driven infrastructure.

### The problem

Traditional justice systems suffer from:

- Slow and fragmented incident response across agencies
- Evidence mismanagement and broken chain of custody
- Reactive policing with no predictive capability
- Inaccessible legal support for victims
- Paper-heavy court preparation that delays justice

### The solution

SafeGuard replaces these pain points with a fully digitised, interoperable platform featuring real-time alerting, blockchain evidence integrity, AI-powered crime prediction, computer vision surveillance, and end-to-end court readiness tooling.

---

## Key Features

### Incident Reporting & Alerting
- Multi-channel report submission — web, mobile, USSD, and walk-in
- Automated real-time alerts dispatched to police, health, and rescue services
- Auto-escalation engine for unacknowledged alerts
- Anonymous tip-off with whistleblower protection
- Live tracking dashboard with GIS incident mapping

### Professional Connection Hub
- Nearest-available-unit dispatch with jurisdiction and skill matching
- AI-powered lawyer matching (pro-bono and paid)
- Hospital referral and trauma counselling integration
- Encrypted case-linked messaging between all parties
- Real-time status updates back to victims

### Predictive Crime Intelligence
- ML-powered crime prediction by type, location, and time window
- Interactive GIS heatmaps of current and predicted hotspots
- Patrol route and resource deployment recommendations
- Anomaly detection for incident spikes
- Community risk scoring updated from live data

### Case Management
- Centralised digital case files with full document and media support
- Suspect profiles with biometric references and alias tracking
- Protected witness management with identity masking
- Investigation workflow with task assignment and deadlines
- NLP-powered case summaries and similar-case linking

### Blockchain Evidence Store
- SHA-256 hashing of all uploaded evidence files
- IPFS-backed distributed file storage
- Immutable chain-of-custody ledger on Hyperledger Fabric
- Smart contracts governing access permissions and custody transfers
- One-click court-ready evidence bundle export with verification proofs

### Computer Vision & AI Surveillance
- Real-time CCTV stream analysis using YOLO v8
- CNN-based deepfake detection on submitted media
- Behaviour anomaly detection (loitering, crowd surges, fights)
- Automatic Number Plate Recognition (ANPR)
- AI-powered forensic video enhancement
- Warrant-gated facial recognition with full audit trail

### Court Readiness
- Digital docket management and hearing scheduling
- Blockchain-verified evidence bundle generation
- Witness confirmation and attendance reminders
- Auto-generated judge briefing packages
- Collaborative legal argument workspace
- Secure virtual hearing integration


---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend (web) | React 18, TypeScript, Tailwind CSS, Mapbox GL JS, Socket.IO |
| Mobile | React Native, Expo (iOS & Android, offline-first) |
| Backend API | Node.js + Express (REST), FastAPI (Python ML services), GraphQL |
| Real-time | WebSockets via Socket.IO, Redis Pub/Sub |
| Database | PostgreSQL, MongoDB, Redis, PostGIS |
| AI / ML | Python, TensorFlow 2, PyTorch, Scikit-learn, Hugging Face, YOLO v8 |
| Computer vision | OpenCV, DeepFace, FaceNet, custom CNN deepfake classifier |
| Blockchain | Hyperledger Fabric (permissioned), IPFS |
| GIS / Mapping | PostGIS, Mapbox, Google Maps API, OpenStreetMap |
| DevOps / Cloud | AWS (EKS, S3, RDS, Lambda), Docker, Kubernetes, GitHub Actions |
| Security | OAuth 2.0 + OpenID Connect, AES-256, TLS 1.3, SIEM |
| Notifications | Firebase Cloud Messaging, Twilio (SMS/Voice), SendGrid |

---

## Domain Model

The platform is modelled around two domains.

### Core domain

| Entity | Description |
|---|---|
| `Person` | Base record for all human actors in the system |
| `UserAccount` | Authentication credential linked to a Person |
| `Incident` | A reported event — the entry point for all case work |
| `Alert` | Automated dispatch event triggered by an Incident |
| `Case` | Central aggregate owning all investigative data |
| `Suspect` | A Person associated with a Case under investigation |
| `Witness` | A Person providing testimony, optionally identity-masked |
| `Professional` | Licensed responder (police, lawyer, medic, judge, etc.) |
| `Assignment` | Association class linking a Professional to a Case with role and dates |
| `Evidence` | A media or document file with SHA-256 hash and IPFS reference |
| `CourtHearing` | A scheduled judicial proceeding linked to a Case |
| `Verdict` | The outcome produced by a CourtHearing |

### Supporting domain

| Entity | Description |
|---|---|
| `Jurisdiction` | Regional governance scope for Cases and CameraFeeds |
| `ChainOfCustody` | Immutable on-chain ledger of all evidence actions |
| `EvidenceBundle` | A signed, court-ready package of Evidence items |
| `MlModel` | A deployed ML model artefact with version and accuracy |
| `CrimePrediction` | A location/time crime prediction generated by an MlModel |
| `CameraFeed` | A CCTV or sensor stream registered in the system |
| `CvDetection` | A computer vision detection event from a CameraFeed |
| `DeepfakeAnalysis` | A manipulation score result for a piece of Evidence |
| `AuditLog` | An immutable record of every user action in the system |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- Docker and Docker Compose
- AWS CLI (for cloud deployment)
- Hyperledger Fabric binaries (for blockchain node setup)

### Clone the repository

```bash
git clone https://github.com/your-org/SafeGuard.git
cd SafeGuard
```

---

## License

SafeGuard is licensed under the [MIT License](LICENSE).

---

*Built to deliver justice faster, fairer, and with full accountability.*