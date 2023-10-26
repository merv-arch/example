defmodule BackendWeb.SessionChannel do
  use Phoenix.Channel

  def join("Session:" <> session_id, _message, socket) do
    {:ok, %{messages: []}, socket}
  end

  # def handle_in("LoginWithShortId", %{"sessionId" => session_id, "shortId" => short_id, "userType" => user_type}, socket) do
  #   LoginRequests.login_with_short_id(session_id: session_id, short_id: short_id, user_type: user_type)
  #   {:noreply, socket}
  # end

  # def handle_in("LoginWithKey", %{"sessionId" => session_id, "loginKey" => login_key}, socket) do
  #   LoginRequests.consume_login_key(session_id: session_id, login_key: login_key)
  #   {:noreply, socket}
  # end
end
