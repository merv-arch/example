defmodule BackendWeb.Resolvers.Content do
  def order(%{id: id}, _info) do
    {:ok,
      %{
        id: "123",
        session_id: "session_uuid",
        name: "eric",
        product_id: "999",
        created_at: DateTime.utc_now
      }
      # Mongo.find_one(
      #   :mongo,
      #   "orders",
      #   %{id: id},
      #   projection: %{_id: 0}
      # )
      # |> MapHelpers.atomize_keys()
    }
  end
end
