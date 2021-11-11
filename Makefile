#!make
# Makefile for Docker
.PHONY: help build rebuild-images start npm-watch stop logs deploy php db

DIR = 'docker'

help:
	@echo ""
	@echo "usage: make COMMAND"
	@echo ""
	@echo "Commands:"
	@echo "  build               Build images"
	@echo "  rebuild-images      Build images ignoring cache"
	@echo "  start               Create and start containers"
	@echo "  npm-watch           Execute 'npm run watch' to update assets on the fly for development"
	@echo "  stop                Stop all services"
	@echo "  logs                Follow log output"
	@echo "  php                 Open php container"
	@echo "  db               	 Open db container"

build:
	@cd $(DIR) && docker-compose -f docker-compose.yml build

rebuild-images:
	@cd $(DIR) && docker-compose -f docker-compose.yml build --no-cache

start:
	@cd $(DIR) && docker-compose -f docker-compose.yml up -d

npm-watch:
	npm run watch

stop:
	@cd $(DIR) && docker-compose -f docker-compose.yml down -v

logs:
	@cd $(DIR) && docker-compose logs -f

omeka:
	@cd $(DIR) && docker exec -it $(shell cd $(DIR) && docker-compose ps -q omeka) bash

db:
	@cd $(DIR) && docker exec -it $(shell cd $(DIR) && docker-compose -f docker-compose.yml ps -q db) bash