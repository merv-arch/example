#!/bin/sh

cp /app/docker/dot_env.local /app/.env.local

yarn

yarn start
