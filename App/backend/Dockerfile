# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src

# ---- Runtime stage ----
FROM node:20-alpine AS runtime

ARG BUILD_NUMBER=local
ARG GIT_COMMIT=unknown
ARG BUILD_TIMESTAMP
ENV BUILD_NUMBER=${BUILD_NUMBER} \
    GIT_COMMIT=${GIT_COMMIT} \
    BUILD_TIMESTAMP=${BUILD_TIMESTAMP}

# Patch OS-level packages (fixes the libcrypto3/libssl3 CVEs)
RUN apk update && apk upgrade --no-cache

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Remove npm's own CLI and its bundled deps from the final image —
# this is what was triggering nearly all the Node.js findings
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm /usr/local/bin/npx \
    /opt/yarn-v1.22.22 /usr/local/bin/yarn /usr/local/bin/yarnpkg

EXPOSE 5000
CMD ["node", "src/server.js"]
