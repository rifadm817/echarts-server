# Force the Docker build to x86_64 architecture
FROM --platform=linux/amd64 node:18-bullseye

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

# Copy package files first
COPY package*.json ./

# Force canvas to build from source (no prebuilt binaries)
ENV npm_config_build_from_source=true

# Install dependencies
RUN npm ci

# Copy the rest of your code
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
