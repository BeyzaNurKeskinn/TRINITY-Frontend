# Build aşaması
FROM node:18-alpine AS builder

# Çalışma dizinini ayarla
WORKDIR /app

# Bağımlılıkları kopyala ve kur
COPY package.json package-lock.json ./
RUN npm ci

# Proje dosyalarını kopyala ve build al
COPY . .
RUN npm run build

# Nginx aşaması
FROM nginx:alpine

# Build dosyalarını Nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80 portunu aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]