#!/bin/bash

mkdir -p ~/.ssh/
echo "$SSH_KEY" > ./deploy.key
chmod 600 ./deploy.key
echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
touch .env
echo "$PRODUCTION_ENV_VARS" > .env
echo "$MAILGUN_DOMAIN" >> .env
echo "$MAILGUN_API_KEY" >> .env
echo "$CLAIMS_ADMIN_RECIPIENTS" >> .env