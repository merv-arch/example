defmodule Backend.JsonSerializer do
  @behaviour EventStore.Serializer

  def serialize(term) do
    Jason.encode!(term)
  end

  def deserialize(binary, _config) do
    Jason.decode!(binary)
  end
end
