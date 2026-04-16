# Use an official Node.js runtime as a parent image (Bullseye has standard glibc required by Python/Java)
FROM node:22-bullseye

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7860
# Hugging Face enforces running as user 1000
RUN useradd -m -u 1000 user

# Install System Dependencies: Java 17+ and Python 3.10+
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment to avoid PIP externally-managed errors
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install the Python Library (Heavy AI Models)
# Note: In production, we install it globally within the venv
RUN pip install --no-cache-dir "opendataloader-pdf[hybrid]"

# Set working directory
WORKDIR /app

# Switch to the non-root user required by Hugging Face Spaces
RUN chown -R user:user /app
USER user

# Copy Next.js package files
COPY --chown=user:user package.json package-lock.json ./

# Install Node dependencies
RUN npm ci

# Copy the rest of the application
COPY --chown=user:user . .

# Build the Next.js application
RUN npm run build

# Create a master startup script that launches both the Python AI server and the Node server
RUN echo '#!/bin/bash\n\
echo "Starting AI Hybrid Server on Port 5002..."\n\
opendataloader-pdf-hybrid --port 5002 &\n\
echo "Waiting for AI Server to boot..."\n\
sleep 5\n\
echo "Starting Next.js Server on Port 7860..."\n\
HOSTNAME="0.0.0.0" node server.js\n\
' > start.sh

RUN chmod +x start.sh

# Expose the Hugging Face port
EXPOSE 7860

# We use the standalone build folder from `.next/standalone`
WORKDIR /app/.next/standalone

# Copy static assets into the standalone directory so client-side React works
RUN cp -r /app/.next/static /app/.next/standalone/.next/static
RUN cp -r /app/public /app/.next/standalone/public 2>/dev/null || true

# Copy the start script to the standalone dir
RUN cp /app/start.sh /app/.next/standalone/start.sh

# Start both servers
CMD ["./start.sh"]
