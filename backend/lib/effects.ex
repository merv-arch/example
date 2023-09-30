defmodule Effects do
  alias Backend.EventStore

  @map %{
    "OrderCreated" => ["CacheOrder", "NotifyFulfillment"]
  }

  def handle(event) do
    @map[event.event_type]
    |> Enum.each(fn handler_key -> handle(handler_key, event) end)
  end

  defp handle("CacheOrder", event) do
    # pickup = Derivatives.Pickup.by_id(event.data["pickup_id"])
    # Mongo.find_one_and_replace(:mongo, "orders", %{id: pickup.id}, pickup, upsert: true)
  end

  defp handle("NotifyFulfillment", event) do
    # pickup = Derivatives.Pickup.by_id(event.data["pickup_id"])
    # Mongo.find_one_and_replace(:mongo, "orders", %{id: pickup.id}, pickup, upsert: true)
  end
end
