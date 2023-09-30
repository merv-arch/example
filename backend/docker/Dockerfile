FROM elixir:1.15.4-alpine

WORKDIR /app

# RUN apk add --no-cache inotify-tools
# && rm -rf /var/cache/apk/*

EXPOSE 4000

RUN mix local.hex --force && \
mix local.rebar --force
