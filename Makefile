# Spacelish API Docker Management

.PHONY: help build up down logs clean dev prod restart dev-stop dev-restart stop clean-containers

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development environment
	docker compose -f docker-compose.dev.yml up -d

dev-build: ## Build and start development environment
	docker compose -f docker-compose.dev.yml up --build -d

dev-logs: ## Show development logs
	docker compose -f docker-compose.dev.yml logs -f

dev-stop: ## Stop development environment (keep containers)
	docker compose -f docker-compose.dev.yml stop

dev-down: ## Stop and remove development containers (volumes preserved)
	docker compose -f docker-compose.dev.yml down

dev-restart: ## Restart development environment
	docker compose -f docker-compose.dev.yml restart

# Production commands
build: ## Build production images
	docker compose build

up: ## Start production environment
	docker compose up -d

prod: ## Build and start production environment
	docker compose up --build -d

stop: ## Stop production environment (keep containers)
	docker compose stop

down: ## Stop and remove production containers (volumes preserved)
	docker compose down

restart: ## Restart production environment
	docker compose restart

logs: ## Show production logs
	docker compose logs -f

# Database commands
db-logs: ## Show database logs
	docker compose logs -f postgres

db-shell: ## Access database shell
	docker compose exec postgres psql -U spacelish_user -d spacelish

pgadmin: ## Open pgAdmin in browser
	@echo "Opening pgAdmin at http://localhost:8080"
	@echo "Email: admin@spacelish.com"
	@echo "Password: admin123"
	@open http://localhost:8080 2>/dev/null || echo "Please open http://localhost:8080 manually"

# Maintenance commands
clean: ## Remove containers and volumes (WILL DELETE DATABASE)
	docker compose down -v
	docker compose -f docker-compose.dev.yml down -v
	docker system prune -f

clean-all: ## Remove everything including images (WILL DELETE DATABASE)
	docker compose down -v --rmi all
	docker compose -f docker-compose.dev.yml down -v --rmi all
	docker system prune -af

clean-containers: ## Remove only containers (database preserved)
	docker compose down
	docker compose -f docker-compose.dev.yml down
	docker system prune -f

# Health checks
status: ## Show container status
	docker compose ps

health: ## Check container health
	docker compose exec app wget --no-verbose --tries=1 --spider http://localhost:3000 && echo "App is healthy" || echo "App is not responding"

# Shell access
shell: ## Access app container shell
	docker compose exec app sh
