# 🐳 Docker Deployment Guide

Panduan lengkap untuk deploy Esgriba LMS menggunakan Docker.

---

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- Minimal 2GB RAM
- Minimal 10GB storage

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/rizkylutfi07/lms-esgriba.git
cd lms-esgriba
```

### 2. Setup Environment Variables

Backend sudah menggunakan environment variables dari docker-compose.yml. Jika ingin customize:

```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Update environment variables:
# - DATABASE_URL
# - JWT_SECRET
# - NEXT_PUBLIC_API_URL
```

### 3. Build dan Run

```bash
# Build semua images
docker compose build

# Start semua services
docker compose up -d

# Lihat logs
docker compose logs -f
```

### 4. Initial Setup

```bash
# Jalankan database migration (otomatis saat start)
# Atau manual:
docker compose exec backend sh -c "cd prisma && npx prisma migrate deploy"

# (Opsional) Seed database
docker compose exec backend sh -c "cd prisma && npx prisma db seed"
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

---

## 🛠️ Docker Commands

### Service Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart backend
docker compose restart frontend

# View logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Check service status
docker compose ps
```

### Database Management

```bash
# Access PostgreSQL CLI
docker compose exec postgres psql -U esgriba -d esgribadb

# Backup database
docker compose exec postgres pg_dump -U esgriba esgribadb > backup.sql

# Restore database
docker compose exec -T postgres psql -U esgriba esgribadb < backup.sql

# Run migrations
docker compose exec backend sh -c "cd prisma && npx prisma migrate deploy"

# Reset database (DANGER!)
docker compose exec backend sh -c "cd prisma && npx prisma migrate reset --force"
```

### Development

```bash
# Build without cache
docker compose build --no-cache

# View service logs real-time
docker compose logs -f backend

# Execute command in container
docker compose exec backend sh

# Rebuild and restart specific service
docker compose up -d --build backend
```

---

## 📦 Architecture

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Frontend │  │ Backend  │  │ Postgres│
│  │ Next.js  │◄─┤ NestJS   │◄─┤ DB 16  │ │
│  │ :3000    │  │ :4000    │  │ :5432  │ │
│  └──────────┘  └──────────┘  └───────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Networks:**
- `esgriba-network` - Bridge network untuk komunikasi antar container

**Volumes:**
- `pgdata` - Persistent storage untuk PostgreSQL

---

## ⚙️ Configuration

### Environment Variables

**Backend:**
```env
DATABASE_URL=postgresql://esgriba:esgriba123@postgres:5432/esgribadb?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Port Mapping

| Service  | Container Port | Host Port |
|----------|---------------|-----------|
| Frontend | 3000          | 3000      |
| Backend  | 4000          | 4000      |
| Postgres | 5432          | 5432      |

### Resource Limits (Optional)

Add to docker-compose.yml:

```yaml
backend:
  # ... existing config
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
      reservations:
        memory: 512M
```

---

## 🔧 Troubleshooting

### Issue 1: Port Already in Use

**Error:** `bind: address already in use`

**Solution:**
```bash
# Find process using port
lsof -i :3000
lsof -i :4000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use different host port
```

### Issue 2: Database Connection Failed

**Error:** `Can't reach database server`

**Solution:**
```bash
# Check if postgres is healthy
docker compose ps

# Check postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres

# Wait for healthcheck
docker compose up -d
```

### Issue 3: Backend "Cannot find module" Error

**Error:** `Error: Cannot find module '@nestjs/core'`

**Root Cause:** pnpm uses symlinks in node_modules that point to `.pnpm` directory

**Solution:** The Dockerfile now copies the entire root node_modules including `.pnpm` directory:
```dockerfile
COPY --from=builder /app/node_modules /app/node_modules
```

This ensures all symlinks resolve correctly in the container.

### Issue 4: Migration Failed

**Error:** `Migration failed`

**Solution:**
```bash
# Migrations should be run from host machine, not inside container
cd my-turborepo/packages/prisma
DATABASE_URL="postgresql://esgriba:esgriba123@localhost:5432/esgribadb?schema=public" pnpm prisma migrate deploy

# Check migration status
cd my-turborepo/packages/prisma
DATABASE_URL="postgresql://esgriba:esgriba123@localhost:5432/esgribadb?schema=public" pnpm prisma migrate status
```

### Issue 5: Container Won't Start

**Error:** Container exits immediately

**Solution:**
```bash
# Check logs
docker compose logs backend

# Try running container interactively
docker compose run --rm backend sh

# Check if build was successful
docker compose build backend

# Remove and rebuild
docker compose down
docker compose up -d --build
```

### Issue 5: Changes Not Reflecting

**Problem:** Code changes not visible

**Solution:**
```bash
# Rebuild images
docker compose build --no-cache

# Restart services
docker compose down
docker compose up -d
```

---

## 🚀 Production Deployment

### 1. Security Checklist

```bash
# ✓ Change default passwords
# ✓ Use strong JWT secret
# ✓ Enable HTTPS
# ✓ Set NODE_ENV=production
# ✓ Disable debug logs
# ✓ Setup firewall rules
```

### 2. Update docker-compose.yml for Production

```yaml
services:
  postgres:
    # Remove port exposure for security
    # ports:
    #   - "5432:5432"
    
  backend:
    environment:
      JWT_SECRET: ${JWT_SECRET}  # Use secret from .env
      
  frontend:
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com
```

### 3. Setup Reverse Proxy (Nginx)

```bash
# Create nginx config
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:4000;
    }
}
EOF
```

### 4. SSL/TLS with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 5. Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T postgres pg_dump -U esgriba esgribadb > backup_$DATE.sql
gzip backup_$DATE.sql
# Upload to cloud storage
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

---

## 📊 Monitoring

### Health Checks

```bash
# Check all services
docker compose ps

# Check specific service health
docker inspect --format='{{.State.Health.Status}}' esgriba-backend

# View health check logs
docker inspect --format='{{json .State.Health}}' esgriba-postgres | jq
```

### Resource Usage

```bash
# Check container stats
docker stats

# Check specific container
docker stats esgriba-backend
```

---

## 🔄 Update & Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker compose build

# Restart with new images
docker compose up -d

# Run migrations if needed
docker compose exec backend sh -c "cd prisma && npx prisma migrate deploy"
```

### Clean Up

```bash
# Remove stopped containers
docker compose down

# Remove unused images
docker image prune -a

# Remove unused volumes (DANGER!)
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

---

## 📝 Docker Compose Commands Reference

```bash
# Build
docker compose build                    # Build all services
docker compose build --no-cache         # Build without cache
docker compose build backend            # Build specific service

# Start/Stop
docker compose up                       # Start in foreground
docker compose up -d                    # Start in background
docker compose down                     # Stop and remove containers
docker compose stop                     # Stop containers
docker compose start                    # Start stopped containers
docker compose restart                  # Restart containers

# Logs
docker compose logs                     # View all logs
docker compose logs -f                  # Follow logs
docker compose logs -f backend          # Follow specific service
docker compose logs --tail=100          # Last 100 lines

# Execute Commands
docker compose exec backend sh          # Open shell in backend
docker compose run --rm backend sh      # Run temporary container

# Status
docker compose ps                       # List containers
docker compose top                      # View running processes
```

---

## 🆘 Support

- Check logs: `docker compose logs -f`
- GitHub Issues: https://github.com/rizkylutfi07/lms-esgriba/issues
- Documentation: See WORKFLOW.md and README.md

---

**Last Updated:** December 9, 2025  
**Docker Version:** 24.0+  
**Docker Compose Version:** 2.23+
