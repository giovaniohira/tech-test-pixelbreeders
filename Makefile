.PHONY: dev dev-detached prod down down-v logs build config test shell shell-prod createsuperuser

COMPOSE := docker compose

# Development (hot reload)
dev:
	$(COMPOSE) up --build

dev-detached:
	$(COMPOSE) up --build -d

# Production-like stack (Gunicorn + Nginx, no bind mounts)
prod:
	COMPOSE_PROFILES=prod $(COMPOSE) --profile prod up --build -d

down:
	$(COMPOSE) down

down-v:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f

build:
	$(COMPOSE) build
	$(COMPOSE) --profile prod build

config:
	$(COMPOSE) config

config-prod:
	COMPOSE_PROFILES=prod $(COMPOSE) --profile prod config

test:
	$(COMPOSE) exec backend python manage.py test tests

shell:
	$(COMPOSE) exec backend bash

shell-prod:
	COMPOSE_PROFILES=prod $(COMPOSE) --profile prod exec backend-prod sh

createsuperuser:
	$(COMPOSE) --profile dev exec backend python manage.py createsuperuser

createsuperuser-prod:
	COMPOSE_PROFILES=prod $(COMPOSE) --profile prod exec backend-prod python manage.py createsuperuser
