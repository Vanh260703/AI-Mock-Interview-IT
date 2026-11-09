FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- dev: nodemon + devDependencies, src được bind-mount từ host ----
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- prod-deps: chỉ cài dependencies cần cho runtime ----
FROM base AS prod-deps
RUN npm ci --omit=dev && npm cache clean --force

# ---- prod: image tối giản để deploy ----
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
