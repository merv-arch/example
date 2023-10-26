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
end
