# Build estático do painel servido pelo nginx.
# O envio de e-mail (server/) só existe no npm run dev/preview e não entra nesta imagem:
# publicado, o modal de e-mail avisa que o serviço não está disponível. Ver wiki/integracoes/envio-de-email-smtp.md.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1
