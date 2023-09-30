defmodule Commands do
  alias EventStore.EventData
  alias Backend.EventStore

  def handle(
      "PlaceOrder",
      %{
        "name" => name,
        "product" => product
      },
      metadata
    ) do
    # our business doesn't take orders from anyone named Corey
    unless name == "Corey" do
      new_id = UUID.uuid4()

      events = [
        %EventData{
          event_type: "OrderCreated",
          data: %{
            order_id: new_id,
            name: name,
            product: product
          },
          metadata: %{some: "metadata"}
        }
      ]

      EventStore.append_to_stream("Order:#{new_id}", :any_version, events)

      {:ok, %{}}
    else
      {:refused, "No, Corey"}
    end
  end
end
