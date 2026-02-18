# =============================================================================
# INDUSTRYVIEW BACKEND - Production Dockerfile
# Dockerfile multi-stage para build de producao otimizado
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# Compila TypeScript e prepara arquivos para producao
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Instala dependencias do sistema necessarias para builds nativos
RUN apk add --no-cache python3 make g++

# Define diretorio de trabalho
WORKDIR /app

# Copia arquivos de dependencias
COPY package*.json ./

# Instala todas as dependencias (incluindo devDependencies para build)
RUN npm ci

# Copia codigo fonte
COPY . .

# Gera cliente Prisma
RUN npx prisma generate

# Compila TypeScript para JavaScript
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production
# Imagem final otimizada apenas com arquivos necessarios
# -----------------------------------------------------------------------------
FROM node:20-alpine

# Define diretorio de trabalho
WORKDIR /app

# Copia arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Copia node_modules (ja tem o cliente Prisma gerado)
COPY --from=builder /app/node_modules ./node_modules

# Copia arquivos de configuracao
COPY --from=builder /app/package.json ./

# Copia schema Prisma (necessario para migrations em runtime)
COPY --from=builder /app/prisma ./prisma

# Define usuario nao-root para seguranca
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expoe porta da aplicacao
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar em modo producao
CMD ["npm", "start"]
