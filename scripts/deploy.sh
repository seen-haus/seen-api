#!/bin/bash

mkdir -p ~/.ssh/
echo "$SSH_KEY" > ./deploy.key
chmod 600 ./deploy.key
echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
touch .env
echo "$PRODUCTION_ENV_VARS" > .env