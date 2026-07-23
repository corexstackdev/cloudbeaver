# Deploy CorexStack (customized CloudBeaver) to Google Cloud Run

This folder deploys the **customized** build of this repo. Only the frontend
(`webapp/`) was changed, so the image is built by overlaying our custom web
bundle on top of the official `dbeaver/cloudbeaver` server image — no Java/Maven
build required.

Files:

- `Dockerfile` — multi-stage: builds the webapp, then layers it onto the official image.
- `cloudbuild.yaml` — builds, pushes to Artifact Registry, and deploys to Cloud Run.
- `../../.gcloudignore` — trims the Cloud Build upload.

---

## 0. Prerequisites (one-time)

Set your values:

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=europe-southwest1        # same region as your existing deployment
export REPO=corexstack                 # Artifact Registry repo name
export SERVICE=corexstack              # Cloud Run service name
```

Enable APIs and create the Artifact Registry repo:

```bash
gcloud config set project "$PROJECT_ID"

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="CorexStack images"
```

Grant the Cloud Build service account permission to deploy to Cloud Run:

```bash
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" --role="roles/iam.serviceAccountUser"
```

> **Confirm the base image tag exists.** The `Dockerfile`/`cloudbuild.yaml`
> default to `CB_VERSION=26.1.0` (matches `webapp/packages/product-default/package.json`).
> Check https://hub.docker.com/r/dbeaver/cloudbeaver/tags — if `26.1.0` isn't
> published, use the closest published `26.1.x` tag and pass it via
> `_CB_VERSION` (see below). The frontend and server share the same release line,
> so keep them on the same `26.1` minor version.

---

## 1. Build + deploy (one command)

From the **repo root** (`cloudbeaver/`):

```bash
gcloud builds submit \
  --config deploy/cloudrun/cloudbuild.yaml \
  --substitutions=_REGION=$REGION,_SERVICE=$SERVICE,_REPO=$REPO,_CB_VERSION=26.1.0
```

This builds the image, pushes `:latest` + `:<build-id>` to Artifact Registry,
and deploys to Cloud Run. The service URL is printed at the end.

---

## Alternative: build locally, then deploy

If you'd rather build on your machine (needs Docker Desktop; on Windows use
WSL or Git Bash):

```bash
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE:latest"

# context is the webapp folder
docker build -f deploy/cloudrun/Dockerfile --build-arg CB_VERSION=26.1.0 -t "$IMAGE" ./webapp

gcloud auth configure-docker "$REGION-docker.pkg.dev"
docker push "$IMAGE"

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --port 8080 \
  --allow-unauthenticated \
  --execution-environment gen2 \
  --cpu 2 --memory 2Gi --cpu-boost \
  --min-instances 1 --max-instances 1 \
  --timeout 3600 \
  --set-env-vars CLOUDBEAVER_WEB_SERVER_PORT=8080
```

---

## Why these Cloud Run settings

- **`--port 8080` + `CLOUDBEAVER_WEB_SERVER_PORT=8080`** — CloudBeaver listens on
  8978 by default; we point it at Cloud Run's expected port instead.
- **`--memory 2Gi --cpu 2 --cpu-boost`** — the JVM needs headroom; boost speeds
  up the (slow) cold start.
- **`--min-instances 1`** — keeps one warm instance so users don't hit ~30–60s
  JVM cold starts. Set to `0` to cut cost if occasional cold starts are OK.
- **`--max-instances 1`** — **important.** The default config uses an embedded
  **H2** database on the container's local disk. Multiple instances would each
  get their own DB and corrupt the experience, so we cap at 1.
- **`--timeout 3600`** — CloudBeaver uses long-lived requests/websockets.

---

## Important: data persistence on Cloud Run

Cloud Run's filesystem is **ephemeral**. With the default embedded H2 database,
**all state resets on every new revision/restart** — users, saved connections,
saved SQL scripts, etc. That's fine for a demo, but for real use configure
external storage:

### Option A — External metadata DB (recommended for production)

Point CloudBeaver's internal metadata store at Cloud SQL (PostgreSQL) by adding
env vars to the deploy (these map to `config/core/cloudbeaver.conf`):

```
--set-env-vars \
CLOUDBEAVER_DB_DRIVER=postgres-jdbc,\
CLOUDBEAVER_DB_URL=jdbc:postgresql://<host>:5432/cloudbeaver,\
CLOUDBEAVER_DB_USER=<user>,\
CLOUDBEAVER_DB_PASSWORD=<password>
```

Use the Cloud SQL connector (`--add-cloudsql-instances`) or a private IP via a
VPC connector. With an external metadata DB you can raise `--max-instances`
(add `--session-affinity`).

### Option B — Persist the workspace on a bucket

Cloud Run gen2 can mount a GCS bucket:

```
--add-volume=name=ws,type=cloud-storage,bucket=YOUR_BUCKET \
--add-volume-mount=volume=ws,mount-path=/opt/cloudbeaver/workspace
```

Keep `--max-instances 1` with Option B (GCS FUSE is not a substitute for a
transactional DB under concurrency).

---

## Updating after more code changes

Re-run the same `gcloud builds submit` command. Each run publishes a new image
and rolls out a new Cloud Run revision automatically.
