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
          event_type: "PlacedOrder",
          data: %{
            order_id: new_id,
            session_id: session_id,
            name: name,
            product_id: product_id
          },
          metadata: %{}
        }
      ]

      EventStore.append_to_stream("Order:#{new_id}", :any_version, events)

      {:ok, %{}}
    else
      {:refused, "No Corey's Allowed"}
    end
  end

  def handle(
      "UpdateOrderAttributes",
      %{
        "orderId" => order_id,
        "updatedAttributes" => updated_attributes,
        "csrName" => csr_name
      },
      metadata
    ) do
    events = [
      %EventData{
        event_type: "UpdatedOrderAttributes",
        data: %{
          order_id: order_id,
          csr_name: csr_name,
          updated_attributes: MapHelpers.underscore_keys(updated_attributes)
        },
        metadata: %{}
      }
    ]

    EventStore.append_to_stream("Order:#{order_id}", :any_version, events)

    {:ok, %{}}
  end
end
