# SafeGuard

SafeGuard replaces these pain points with a fully digitised, interoperable platform featuring real-time alerting, blockchain evidence integrity, AI-powered crime prediction, computer vision surveillance, and end-to-end court readiness tooling.

---

| Planning | Source |
|-------------|--------|
| Domain Model | [Domain Model](https://drive.google.com/file/d/1IjZNRNzhnP6KCjeGb82MKlG7Tz2Q0QOt/view?usp=sharing) |
| UI design    | [Figma Design](https://www.figma.com/design/cIioMsogRR4RvnB3EOxlof/SafeGuard?node-id=0-1&t=yvPa9YwD7HmCwZQk-1) |

---
## Key Features

### Incident Reporting & Alerting
- Multi-channel report submission — web and mobile
- Automated real-time alerts dispatched to police, health, and rescue services
- Live tracking dashboard with GIS incident mapping

### Professional Connection Hub
- Nearest-available-unit dispatch with jurisdiction and skill matching
- Encrypted case-linked messaging between all parties
- Real-time status updates back to victims

### Predictive Crime Intelligence
- ML-powered crime prediction by type, location, and time window
- Interactive GIS heatmaps of current and predicted hotspots
- Patrol route and resource deployment recommendations
- Anomaly detection for incident spikes
- Community risk scoring updated from live data

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

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9)
- [Node.js >= 18](https://nodejs.org/) and npm
- [Docker and Docker Compose](https://docs.docker.com/get-docker/)
- PostgreSQL (or use the Docker setup below)

### Clone the repository

```bash
git clone https://github.com/your-org/SafeGuard.git
cd SafeGuard
```

### Backend (ASP.NET Core)

1. **Configure the database connection** — edit `backend/aspnet-core/src/SafeGuard.Web.Host/appsettings.json` and set your PostgreSQL connection string:

   ```json
   "ConnectionStrings": {
     "Default": "Host=localhost;Port=5432;Database=SafeGuardDb;Username=postgres;Password=yourpassword;"
   }
   ```

2. **Run with Docker** (recommended):

   ```bash
   cd backend/aspnet-core/docker
   DB_CONNECTION_STRING="Host=host.docker.internal;Port=5432;Database=SafeGuardDb;Username=postgres;Password=yourpassword;" docker compose up --build
   ```

   The API will be available at `http://localhost:44311`.

3. **Run locally** (without Docker):

   ```bash
   cd backend/aspnet-core/src/SafeGuard.Web.Host
   dotnet restore
   dotnet run
   ```

### Frontend (Next.js)

```bash
cd frontend/safeguard
npm install
npm run dev
```

### Incident Clustering Workflow

SafeGuard now includes a review-first incident clustering flow built on ML.NET KMeans.

1. Train or retrain the clustering model from the CSV:

   ```bash
   cd backend/aspnet-core/src/SafeGuard.ML.Trainer
   dotnet run -- cluster-train "C:\Users\Aryan\Downloads\incident-training-data.csv"
   ```

2. Start the backend and frontend, then open the new `Incident Graph` page in the app.

3. From the graph page you can:
   - regenerate the model from the CSV
   - fetch graph-ready linked-incident data
   - review suggested-case groups before creating or linking real cases

If no CSV path override is supplied, the backend falls back to the configured path or `~/Downloads/incident-training-data.csv`.

---

## License

SafeGuard is licensed under the [MIT License](LICENSE).

---
