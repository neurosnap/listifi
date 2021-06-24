BIN=./node_modules/.bin
DOCKER_MACHINE?=lispy-1
PGDATABASE?="postgres"
PGHOST?="db"
PGUSER?="postgres"
PORT?="5432"
DB_CONTAINER?=listifi_db_1
REDIS_CONTAINER?=listifi_redis_1

# run this command to login after adding docker-machine creds
# gcloud auth application-default login
# authenticate to push to image repository
# gcloud auth configure-docker

init:
	gcloud --project $(PROJECT_ID) auth configure-docker
.PHONY: init

provision:
	# --google-address $(SERVER)
	docker-machine create \
		--driver google \
		--google-project $(PROJECT_ID) \
		--google-machine-type f1-micro \
		--google-zone us-east1-b \
		--google-tags http-server,https-server \
		--google-scopes https://www.googleapis.com/auth/devstorage.read_write,https://www.googleapis.com/auth/logging.write \
		--google-username docker-user \
		$(DOCKER_MACHINE)
	docker-machine ssh $(DOCKER_MACHINE) 'bash -s' < ./provision.sh
	$(BIN)/machine-export $(DOCKER_MACHINE)
	gsutil cp $(DOCKER_MACHINE).zip gs://lispy-infra
.PHONY: provision

build:
	docker build -t gcr.io/$(PROJECT_ID)/app --target app .
	docker build -t gcr.io/$(PROJECT_ID)/nginx -f Dockerfile.nginx .
.PHONY: build

push:
	docker push gcr.io/$(PROJECT_ID)/app
	docker push gcr.io/$(PROJECT_ID)/nginx
.PHONY: push

bp: build push
.PHONY: bp

deploy:
	# BE SURE TO SET CORRECT DOCKER ENVIRONMENT
	# eval (docker-machine env lispy-1)
	docker system prune -f
	docker-compose -f production.yml pull --ignore-pull-failures
	docker-compose -f production.yml up --no-deps -d
	# UNSET
	# eval (docker-machine env -u)
.PHONY: deploy

logs:
	docker-compose -f production.yml logs -f --tail="100"
.PHONY: logs

ssh:
	docker-machine ssh $(DOCKER_MACHINE)
.PHONY: ssh

teardown:
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/teardown.sql
.PHONY: teardown

migrate:
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/1-users.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/2-lists.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/3-add-pic-name-to-users.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/4-alter-list-restrictions.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/5-rename-users.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/6-guest-users.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/7-list-title-to-name.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/8-list-stars-and-item-order.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/9-list-stars.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/10-list-item-metadata.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/11-unique-list-name-w-user.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/12-email-verifications.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/13-plugins.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/14-plugin-voting-cascade.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/15-notes-on-list-item.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/16-strict-types.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/17-plugin-suggestions.sql
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/18-activity-feed.sql
.PHONY: migrate

latest:
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/migrations/18-activity-feed.sql
.PHONY: latest

seed:
	docker exec -i $(DB_CONTAINER) psql -U $(PGUSER) -d $(PGDATABASE) < ./sql/seed-plugins.sql
.PHONY: seed

psql:
	docker exec -it $(DB_CONTAINER) psql -U $(PGUSER)
.PHONY: psql

redis:
	docker exec -it $(REDIS_CONTAINER) redis-cli -a '$(REDIS_PASSWORD)'
.PHONY: redis
