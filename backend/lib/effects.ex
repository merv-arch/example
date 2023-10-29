defmodule Effects do
  alias Backend.EventStore

  @map %{
    "PlacedOrder" => ["CacheOrder"],
    "UpdateOrderAttributes" => ["CacheOrder"]
  }

  def handle(event) do
    @map[event.event_type]
    |> Enum.each(fn handler_key -> handle(handler_key, event) end)
  end

  defp handle("CacheOrder", event) do
    Mongo.find_one_and_replace(
      :mongo,
      "orders",
      %{id: event.data["order_id"]},
      Derivatives.Order.by_id(event.data["order_id"]),
      upsert: true
    )
  end
end
