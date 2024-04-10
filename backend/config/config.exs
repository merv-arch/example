# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :backend, Backend.EventStore,
  serializer: Backend.JsonSerializer,
  username: "postgres",
  password: "postgres",
  database: System.get_env("POSTGRES_EVENT_STORE_DB"),
  hostname: System.get_env("POSTGRES_HOSTNAME"),
    parameters: [
    tcp_keepalives_idle: "60",
    tcp_keepalives_interval: "5",
    tcp_keepalives_count: "3"
  ],
  socket_options: [keepalive: true]


config :backend, event_stores: [Backend.EventStore]

# Configures the endpoint
config :backend, BackendWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: BackendWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Backend.PubSub,
  live_view: [signing_salt: "/YNQee88"]

config :backend,
  mongo_seeds: [System.get_env("MONGO_HOSTNAME")],
  mongo_database: System.get_env("MONGO_DATABASE"),
  mongo_pool_size: 10

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :backend, Backend.Mailer, adapter: Swoosh.Adapters.Local

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
