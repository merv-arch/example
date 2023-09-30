defmodule BackendWeb.CommandsController do
  use BackendWeb, :controller

  def command(%{remote_ip: ip} = conn, %{"command" => command, "data" => data}) do
    case Commands.handle(command, data, %{ip: ip}) do
      {:ok, resp} ->
        json(conn, resp)

      {:refused, reason} ->
        send_resp(conn, 409, reason)
    end
  end
end
