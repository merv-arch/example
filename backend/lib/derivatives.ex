defmodule Derivatives do
  alias Backend.EventStore

  @read_tables %{
    __MODULE__.Order => "orders",
  }

  def rebuild_cached(module) do
    Mongo.find(:mongo, @read_tables[module], %{}, projection: %{_id: 0, id: 1})
    |> Enum.each(fn %{"id" => id} -> rebuild_cache(module, id) end)
  end

  def rebuild_cache(module, id) do
    Mongo.find_one_and_replace(
      :mongo,
      @read_tables[module],
      %{id: id},
      module.by_id(id),
      upsert: true
    )
  end

  defmodule Order do
    def by_id(id) do
      {:ok, events} = EventStore.read_stream_forward("Order:#{id}")

      events
      |> Enum.reduce(%{}, fn event, acc -> on(event, acc) end)
    end

    defp on(%{event_type: "PlacedOrder"} = event, _acc) do
      %{
        id: event.data["order_id"],
        session_id: event.data["session_id"],
        name: event.data["name"],
        product_id: event.data["product_id"],
        status: "placed",
        created_at: event.created_at
      }
    end

    defp on(%{event_type: "UpdatedOrderAttributes"} = event, acc) do
      Map.merge(
        acc,
        MapHelpers.atomize_keys(event.data["updated_attributes"])
      )
      |> Map.merge(%{updated_at: event.created_at})
    end
  end
end
