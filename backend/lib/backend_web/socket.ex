defmodule BackendWeb.Socket do
  use Phoenix.Socket

  ## Channels
  channel "Session:*", BackendWeb.SessionChannel

  def connect(%{"sessionId" => session_id} = _params, socket, _connect_info) do
    {:ok, assign(socket, :session_id, session_id)}
    # {:ok, socket}
  end

  def id(_socket), do: nil
end
