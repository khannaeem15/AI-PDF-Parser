# Use an official Node.js runtime as a parent image (Bookworm guarantees Python 3.11+)
FROM node:22-bookworm

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7860

# ── Step 1: System dependencies (Java + Python) ──────────────────────────────
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# ── Step 2: Python venv + heavy AI library ───────────────────────────────────
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir "opendataloader-pdf[hybrid]"

# ── Step 3: Node.js app ──────────────────────────────────────────────────────
WORKDIR /app

# Copy manifests first (layer-cache friendly)
COPY package.json package-lock.json ./

# Install Node dependencies (strict mode — requires lock file to be in sync)
RUN npm ci --prefer-offline

# Copy the rest of the application source
COPY . .

# Build the Next.js standalone bundle
ENV NODE_OPTIONS="--max-old-space-size=3072"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Step 4: Assemble the standalone runtime directory ────────────────────────
# Copy static assets into the standalone directory so client-side React works
RUN cp -r /app/.next/static /app/.next/standalone/.next/static
RUN cp -r /app/public /app/.next/standalone/public 2>/dev/null || true

# ── Step 5: Create the startup script ────────────────────────────────────────
# IMPORTANT: Use printf (not echo) so that \n expands into real newlines.
#            The venv is referenced by absolute path to guarantee it is found
#            even if PATH is not fully inherited at CMD runtime.
RUN printf '#!/bin/bash\n\
set -e\n\
echo "==> Starting AI Hybrid Server on port 5002..."\n\
/opt/venv/bin/opendataloader-pdf-hybrid --port 5002 &\n\
echo "==> Waiting for AI server to initialise (15 s)..."\n\
sleep 15\n\
echo "==> Starting Next.js on port 7860..."\n\
cd /app/.next/standalone\n\
exec env HOSTNAME="0.0.0.0" PORT=7860 node server.js\n' \
    > /start.sh && chmod +x /start.sh

# ── Step 6: Hand off ownership to the non-root user ──────────────────────────
# The 'node' image ships with a 'node' user at UID 1000 — exactly what
# Hugging Face Spaces requires.
RUN chown -R node:node /app /opt/venv /start.sh

USER node

# Expose the Hugging Face port
EXPOSE 7860

WORKDIR /app/.next/standalone

# Launch both servers via bash so the shebang line is honoured
CMD ["bash", "/start.sh"]
