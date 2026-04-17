.PHONY: help up down build restart logs ps clean dev-be dev-fe

help:
	@echo ""
	@echo "  AI Mock Interview IT — Docker Commands"
	@echo "  ======================================="
	@echo ""
	@echo "  make up          Start all services (detached)"
	@echo "  make down        Stop and remove containers"
	@echo "  make build       Build all images"
	@echo "  make restart     Restart all services"
	@echo "  make logs        Follow logs for all services"
	@echo "  make logs-be     Follow backend logs"
	@echo "  make logs-fe     Follow frontend logs"
	@echo "  make logs-mongo  Follow mongo logs"
	@echo "  make logs-redis  Follow redis logs"
	@echo "  make ps          List running containers"
	@echo "  make clean       Remove containers, images, volumes"
	@echo "  make dev-be      Install BE deps locally"
	@echo "  make dev-fe      Install FE deps locally"
	@echo ""

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

restart:
	docker compose down && docker compose up -d

logs:
	docker compose logs -f

logs-be:
	docker compose logs -f backend

logs-fe:
	docker compose logs -f frontend

logs-mongo:
	docker compose logs -f mongo

logs-redis:
	docker compose logs -f redis

ps:
	docker compose ps

clean:
	docker compose down -v --rmi local --remove-orphans

dev-be:
	cd BE && npm install

dev-fe:
	cd FE && npm install
