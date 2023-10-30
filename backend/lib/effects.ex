defmodule Effects do
  alias Backend.EventStore

  @map %{
    "PlacedOrder" => ["CacheOrder"],
    "UpdatedOrderAttributes" => ["CacheOrder", "InformSession"]
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

  defp handle("InformSession", event) do
    order = Derivatives.Order.by_id(event.data["order_id"])

    BackendWeb.Endpoint.broadcast!(
      "Session:#{order.session_id}",
      "NewOrderStreamEvent", %{ id: order.id }
    )
  end
end
