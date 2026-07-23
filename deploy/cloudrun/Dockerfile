# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# CorexStack (customized CloudBeaver) — Cloud Run image
#
# Only the frontend (webapp) was customized in this repo, so we:
#   1. build the custom web bundle with Node/Yarn
#   2. overlay it on top of the official CloudBeaver server image
#
# This avoids the heavy Java/Maven backend build entirely.
#
# Build context MUST be the repo `webapp/` directory, e.g.:
#   docker build -f deploy/cloudrun/Dockerfile -t IMAGE ./webapp
# ---------------------------------------------------------------------------

# Must match webapp/packages/product-default/package.json "version".
# Confirm the tag exists on Docker Hub: https://hub.docker.com/r/dbeaver/cloudbeaver/tags
ARG CB_VERSION=26.1.0

# ----------------------------- Stage 1: web build --------------------------
FROM node:22-bookworm AS webbuild

ENV NODE_OPTIONS=--max-old-space-size=6144
WORKDIR /app

# Copy the whole webapp workspace (build context = ./webapp)
COPY . .

# Pin the exact Yarn version declared in package.json "packageManager"
RUN corepack enable && corepack prepare yarn@4.14.1 --activate

# Install deps (Yarn PnP) and produce the production bundle.
# Output lands in packages/product-default/lib (see build-frontend.sh).
RUN yarn install --immutable
RUN yarn workspace @cloudbeaver/product-default run bundle

# ----------------------------- Stage 2: runtime ---------------------------
ARG CB_VERSION
FROM dbeaver/cloudbeaver:${CB_VERSION}

# Replace the stock static frontend with our customized bundle
RUN rm -rf /opt/cloudbeaver/web/*
COPY --from=webbuild /app/packages/product-default/lib/ /opt/cloudbeaver/web/
RUN find /opt/cloudbeaver/web -type d -exec chmod 755 {} \; && \
    find /opt/cloudbeaver/web -type f -exec chmod 644 {} \;

# Cloud Run sends traffic to the container port below; make CloudBeaver listen there.
ENV CLOUDBEAVER_WEB_SERVER_PORT=8080
EXPOSE 8080

# Entrypoint / workdir are inherited from the base image (launch-product.sh).
