# Docker Setup for Spacelish API

## Overview

This setup includes the following services:
- **App**: NestJS API application
- **PostgreSQL**: Database
- **pgAdmin**: Web interface for PostgreSQL management (replacement for phpmyadmin)
- **Nginx**: Reverse proxy and load balancer

## Directory Structure

```
docker/
├── nginx/
│   ├── nginx.conf          # Main Nginx configuration
│   ├── conf.d/
│   │   └── default.conf    # Virtual host configuration
│   └── ssl/                # Directory for SSL certificates
└── postgres/
    └── init/
        └── 01_init.sql     # Database initialization script
```

## Usage

### 1. Development Environment

```bash
# Start development environment
make dev

# Build and start development environment
make dev-build

# View development logs
make dev-logs

# Stop development environment (keep containers for quick restart)
make dev-stop

# Stop and remove development containers (database preserved)
make dev-down

# Restart development environment
make dev-restart
```

### 2. Production Environment

```bash
# Build production images
make build

# Start production environment
make up

# Build and start production environment
make prod

# Stop production environment (keep containers for quick restart)
make stop

# Stop and remove production containers (database preserved)
make down

# Restart production environment
make restart
```

# Build and start production environment
make prod

# Stop production environment
make down

# Restart containers
make restart

# View logs
make logs
```

### 3. Database Management

```bash
# Open pgAdmin (replacement for phpmyadmin)
make pgadmin

# Access database shell
make db-shell

# View database logs
make db-logs
```

### 4. Maintenance

```bash
# Check container status
make status

# Check application health
make health

# Access app container shell
make shell

# Remove only containers (database preserved)
make clean-containers

# Remove containers and volumes (WILL DELETE DATABASE!)
make clean

# Remove everything including images (WILL DELETE DATABASE!)
make clean-all
```

**⚠️ Important Notes:**
- `dev-stop` / `stop`: Only stops containers, can restart quickly
- `dev-down` / `down`: Removes containers but keeps database volumes
- `clean`: Removes containers AND volumes (database will be lost!)
- `clean-all`: Removes everything including Docker images

## Access Information

- **URL**: http://localhost:8080
- **Email**: admin@spacelish.com
- **Password**: admin123

### PostgreSQL Database
- **Host**: localhost (from host machine) or postgres (from other containers)
- **Port**: 5432
- **Database**: spacelish (production) / spacelish_dev (development)
- **Username**: spacelish_user
- **Password**: spacelish_password

### Application
- **Development**: http://localhost:3000
- **Production** (via Nginx): http://localhost

## Connecting pgAdmin to PostgreSQL

1. Access pgAdmin at http://localhost:8080
2. Login with the credentials above
3. Add new server:
   - **Name**: Spacelish Database
   - **Host**: postgres
   - **Port**: 5432
   - **Database**: spacelish
   - **Username**: spacelish_user
   - **Password**: spacelish_password

## Environment Variables

You can create a `.env` file to override environment variables:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=spacelish_user
DB_PASSWORD=spacelish_password
DB_DATABASE=spacelish

# App
NODE_ENV=production
PORT=3000

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@spacelish.com
PGADMIN_DEFAULT_PASSWORD=admin123
```

## SSL Configuration

To enable HTTPS:

1. Place SSL certificates in `docker/nginx/ssl/` directory
2. Update `docker/nginx/conf.d/default.conf` file to add SSL configuration
3. Restart Nginx container

## Troubleshooting

### Container won't start
```bash
# Check logs
make logs

# Check status
make status
```

### Database connection issues
```bash
# Check database logs
make db-logs

# Test connection
make db-shell
```

### Nginx not working
```bash
# Check Nginx configuration
docker-compose exec nginx nginx -t

# Reload Nginx
docker-compose exec nginx nginx -s reload
```

## Performance Optimization

### Production
- Multi-stage Docker build to reduce image size
- Health checks for all services
- Resource limits (can be added to docker-compose.yml)
- Rate limiting in Nginx

### Development
- Volume mounting for hot reload
- Debug port (9229) exposed
- Separate environment with isolated data
