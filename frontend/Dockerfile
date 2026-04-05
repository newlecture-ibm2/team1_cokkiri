# ── Stage 1: 의존성 설치 ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# postinstall은 로컬 Git 훅용; 이미지에는 상위 .githooks·git 없음
RUN npm ci --ignore-scripts

# ── Stage 2: 빌드 ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3: 실행 (standalone) ──
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
