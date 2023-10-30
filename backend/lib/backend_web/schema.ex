defmodule BackendWeb.Schema do
  use Absinthe.Schema

  import_types(BackendWeb.Schema.Types)
  import_types(Absinthe.Type.Custom)
  import_types(BackendWeb.Schema.JsonType)

  alias BackendWeb.Resolvers

  query do
    @desc "Get Order by id"
    field :order, :order do
      arg(:id, :string)

      resolve(&Resolvers.Content.order/2)
    end

    @desc "Get events by stream name"
    field :stream_events, list_of(:stream_event) do
      arg(:stream_name, :string)

      resolve(&Resolvers.Content.stream_events/2)
    end
  end
end
