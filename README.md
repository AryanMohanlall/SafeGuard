# SafeGuard

SafeGuard is a web-based incident management platform built with:

- ASP.NET Boilerplate / ABP Zero on .NET 9
- PostgreSQL with Entity Framework Core
- Next.js 16 + Ant Design frontend

The current codebase focuses on incident intake, case management, monitoring, alerting, and ML-assisted review workflows.

---

| Planning | Source |
|-------------|--------|
| Domain Model | [Drawio](https://drive.google.com/file/d/1IjZNRNzhnP6KCjeGb82MKlG7Tz2Q0QOt/view?usp=sharing)  [Lucid Chart](https://lucid.app/lucidchart/3763e170-761d-4660-b8b9-c2d0937cc5c1/edit?viewport_loc=-1521%2C2208%2C4068%2C1948%2CfwZn4bwXoePRd&invitationId=inv_4f4f9ef8-0bbe-4007-8fc6-89e1e1b91ef8) |
| UI design    | [Figma Design](https://www.figma.com/design/cIioMsogRR4RvnB3EOxlof/SafeGuard?node-id=0-1&t=yvPa9YwD7HmCwZQk-1) |

---

## Implemented Features

### Incident Reporting
- Web-based incident submission flow
- Optional anonymous reporting
- GPS coordinate capture when browser location access is granted
- Audio and image attachment support

### Incident Management
- Incident list and detail views
- Search and pagination
- Table and map views for incidents
- AI-derived case likelihood badges and detected-object tags

### Case Management
- Case CRUD workflows
- Link incidents to cases
- Case status transitions
- Case detail views for linked incidents and notes/history

### Alerts and Dispatch Operations
- Alerts page for active incidents and queue review
- Dispatch management and responder status transitions
- SignalR-backed alert and dispatch notification plumbing in the backend

### Monitoring
- Live monitor page for configured camera feeds
- Configurable live-stream records in the backend
- Stream proxy support for approved external camera sources

### ML-Assisted Review
- Incident prediction service used to derive case likelihood / priority
- Incident clustering graph for reviewing related incidents
- ML.NET trainer project for clustering and prediction workflows

### Evidence and Ledger Services
- Evidence entity and CRUD backend service
- Ledger service and blockchain-style append/verification backend endpoints

---

## What Is Not Implemented Here

The repository does not currently implement several ideas that may have been part of earlier planning, including:

- native mobile clients
- encrypted in-app messaging between parties
- IPFS or Hyperledger Fabric integration
- ANPR, facial recognition, or forensic video enhancement
- court scheduling, witness reminders, or virtual hearing tooling

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

### Backend

1. Configure the database connection in `backend/aspnet-core/src/SafeGuard.Web.Host/appsettings.json`:

   ```json
   "ConnectionStrings": {
     "Default": "Host=localhost;Port=5432;Database=SafeGuardDb;Username=postgres;Password=yourpassword;"
   }
   ```

2. Run with Docker:

   ```bash
   cd backend/aspnet-core/docker
   DB_CONNECTION_STRING="Host=host.docker.internal;Port=5432;Database=SafeGuardDb;Username=postgres;Password=yourpassword;" docker compose up --build
   ```

   The API will be available at `http://localhost:44311`.

3. Or run locally:

   ```bash
   cd backend/aspnet-core/src/SafeGuard.Web.Host
   dotnet restore
   dotnet run
   ```

### Frontend

```bash
cd frontend/safeguard
npm install
npm run dev
```

---

## Incident Clustering Workflow

SafeGuard includes an incident clustering flow built on ML.NET KMeans.

1. Train or retrain the clustering model from a CSV file:

   ```bash
   cd backend/aspnet-core/src/SafeGuard.ML.Trainer
   dotnet run -- cluster-train "C:\Users\Aryan\Downloads\incident-training-data.csv"
   ```

2. Start the backend and frontend.

3. Open the `Incident Graph` page in the web app to:
- regenerate the model from the CSV
- fetch graph-ready linked-incident data
- review suggested case groups before creating or linking real cases

If no CSV path override is supplied, the backend falls back to the configured path or `~/Downloads/incident-training-data.csv`.

---

## License

SafeGuard is licensed under the [MIT License](LICENSE).
