FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Entrypoint script: decodes base64 ADC credentials from env var to file
RUN printf '#!/bin/sh\nif [ -n "$GCP_ADC_B64" ]; then\n  echo "$GCP_ADC_B64" | base64 -d > /tmp/gcp-adc.json\n  export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-adc.json\nfi\nexec "$@"\n' > /entrypoint.sh && chmod +x /entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
