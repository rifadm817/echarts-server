# Use Node 18 (Debian-based) for best compatibility
FROM node:18-bullseye

# Install native libraries needed by node-canvas
RUN apt-get update && apt-get install -y \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  librsvg2-dev \
  build-essential \
  g++

WORKDIR /app

# Copy package manifests first so Docker can cache npm ci
COPY package*.json ./

# Force canvas to build from source
ENV npm_config_build_from_source=true

# Install dependencies
RUN npm ci

# Now copy the rest of the app
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
