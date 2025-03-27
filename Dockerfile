# Force x86_64 build environment
FROM --platform=linux/amd64 node:18-bullseye

# Install native libraries required by node-canvas and Puppeteer
RUN apt-get update && apt-get install -y \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  librsvg2-dev \
  build-essential \
  g++ \
  wget \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Set environment variables to force build-from-source and use legacy peer deps
ENV npm_config_build_from_source=true
ENV npm_config_legacy_peer_deps=true

RUN npm ci

# Copy the rest of the source code
COPY . .

EXPOSE 8080
CMD ["npm", "start"]