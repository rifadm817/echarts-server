# Force x86_64 build environment
FROM --platform=linux/amd64 node:18-bullseye

# Install native libraries required by node-canvas
RUN apt-get update && apt-get install -y \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  librsvg2-dev \
  build-essential \
  g++

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Set environment variables to force build-from-source and use legacy peer deps if needed
ENV npm_config_build_from_source=true
ENV npm_config_legacy_peer_deps=true

RUN npm ci

# Copy the rest of your source code
COPY . .

EXPOSE 8080
CMD ["npm", "start"]