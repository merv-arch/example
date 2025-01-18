#!/bin/sh

cp /app/docker/dot_env.local /app/.env.local

npm install

npm start
