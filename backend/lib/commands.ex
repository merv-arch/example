defmodule Commands do
  alias EventStore.EventData
  alias Backend.EventStore

  def handle(
      "PlaceOrder",
      %{
        "name" => name,
        "productId" => product_id,
        "sessionId" => session_id
      },
      metadata
    ) do
    # our business doesn't take orders from anyone named Corey
    # just a silly example of this being a place to put your
    # business logic checks
    unless name == "Corey" do
      new_id = UUID.uuid4()

      events = [
        %EventData{
          event_type: "OrderPlaced",
          data: %{
            order_id: new_id,
            session_id: session_id,
            name: name,
            product_id: product_id
          },
          metadata: %{some: "metadata"}
        }
      ]

      EventStore.append_to_stream("Order:#{new_id}", :any_version, events)

      {:ok, %{}}
    else
      {:refused, "No Corey's Allowed"}
    end
  end
end
