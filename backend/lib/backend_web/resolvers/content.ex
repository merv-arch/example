defmodule BackendWeb.Resolvers.Content do
  def order(%{id: id}, _info) do
    {:ok,
      Mongo.find_one(
        :mongo,
        "orders",
        %{id: id},
        projection: %{_id: 0}
      )
      |> MapHelpers.atomize_keys()
    }
  end

  def stream_events(%{stream_name: stream_name}, _info) do
    Backend.EventStore.read_stream_forward(stream_name)
  end
end
