defmodule MongoDatabaseWatcher do
  use GenServer

  # require Logger

  @me __MODULE__

  def start_link([]) do
    GenServer.start_link(@me, nil, name: @me)
  end

  def new_token(token) do
    GenServer.cast(@me, {:token, token})
  end

  def new_doc(doc) do
    GenServer.cast(@me, {:doc, doc})
  end

  def init(_) do
    state = %{last_resume_token: nil}
    Process.send_after(self(), :connect, 3000)
    {:ok, state}
  end

  def handle_info({:DOWN, _, :process, _pid, _reason}, state) do
    # Logger.info("#Cursor process is down: #{inspect reason}")
    Process.send_after(self(), :connect, 3000)
    {:noreply, state}
  end

  def handle_info(:connect, state) do
    # Logger.info("Connecting change stream for #{@collection}")
    # Span a new process
    pid = spawn(fn -> Enum.each(get_cursor(state), fn doc -> new_doc(doc) end) end)

    # Monitor the process
    Process.monitor(pid)

    {:noreply, state}
  end

  def handle_cast({:doc, doc}, state) do
    process_doc(doc)
    {:noreply, state}
  end

  def handle_cast({:token, token}, state) do
    # Logger.info("Receiving new token #{inspect token}")
    {:noreply, %{state | last_resume_token: token}}
  end

  defp process_doc(
         %{
           "operationType" => "insert",
           "ns" => %{"coll" => "orders"},
           "fullDocument" => %{
             "id" => order_id,
             "session_id" => session_id
           }
         }
       ) do
    BackendWeb.Endpoint.broadcast!(
      "Session:#{session_id}",
      "OrderInserted", %{ orderId: order_id }
    )
  end

  defp process_doc(
         %{
           "operationType" => "replace",
           "ns" => %{"coll" => "orders"},
           "fullDocument" => %{
             "id" => order_id,
             "session_id" => session_id
           }
         }
       ) do
    BackendWeb.Endpoint.broadcast!(
      "Session:#{session_id}",
      "OrderReplaced", %{ id: order_id }
    )
  end

  defp process_doc(doc) do
    IO.puts("processing unmatched doc")
    IO.inspect(doc)
    # if needed I can implement partial "udpates" on cached items later
    # maybe not though because mongo only reports the native _id on update
    # Logger.info("MISSED #{inspect doc}")
  end

  defp get_cursor(%{last_resume_token: nil}) do
    Mongo.watch_db(:mongo, [], fn token -> new_token(token) end, max_time: 2_000)
  end

  defp get_cursor(%{last_resume_token: token}) do
    Mongo.watch_db(:mongo, [], fn token -> new_token(token) end,
      max_time: 2_000,
      resume_after: token
    )
  end
end
