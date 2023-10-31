import Config

config :backend_web, BackendWeb.Endpoint,
  url: [host: "backend-demo.mervarch.com", port: 80],
  check_origin: [
  "//*.mervarch.com",
]

# Configures Swoosh API Client
config :swoosh, api_client: Swoosh.ApiClient.Finch, finch_name: Backend.Finch

# Disable Swoosh Local Memory Storage
config :swoosh, local: false

# Do not print debug messages in production
config :logger, level: :info

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.
