defmodule AllEventsSubscriber do
  use GenServer

  alias Backend.EventStore

  def start_link([]) do
    GenServer.start_link(__MODULE__, nil)
  end

  def received_events(subscriber) do
    GenServer.call(subscriber, :received_events)
  end

  def init(events) do
    # Subscribe to events from all streams
    {:ok, subscription} = EventStore.subscribe_to_all_streams("all_events", self())

    {:ok, %{events: events, subscription: subscription}}
  end

  # Successfully subscribed to all streams
  def handle_info({:subscribed, subscription}, %{subscription: subscription} = state) do
    {:noreply, state}
  end

  # Event notification
  def handle_info({:events, events}, state) do
    %{events: _existing_events, subscription: subscription} = state

    # Confirm receipt of received events in bulk
    # :ok = EventStore.ack(subscription, events)

    # IO.puts("all current events")
    # IO.inspect(events)

    Enum.each(events, fn event ->
      Effects.handle(event) && EventStore.ack(subscription, [event])
    end)

    # Effects.Producer.sync_notify(event)

    # event_module = String.to_existing_atom(event.event_type)

    # if function_exported?(event_module, :effect, 1) do
    #   apply(event_module, :effect, [event])
    # end

    {:noreply, state}
  end

  def handle_call(:received_events, _from, %{events: events} = state) do
    {:reply, events, state}
  end
end
