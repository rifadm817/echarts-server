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

# Force node-canvas to compile from source, and allow legacy peer deps for jsdom
ENV npm_config_build_from_source=true
ENV npm_config_legacy_peer_deps=true

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Expose the port (Railway will supply process.env.PORT; our server defaults to 8080)
EXPOSE 8080

CMD ["npm", "start"]
