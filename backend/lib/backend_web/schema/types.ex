defmodule BackendWeb.Schema.Types do
  use Absinthe.Schema.Notation

  alias BackendWeb.Resolvers

  object :order do
    field(:id, non_null(:string))
    field(:session_id, non_null(:string))
    field(:name, non_null(:string))
    field(:product_id, non_null(:string))
    field(:created_at, non_null(:datetime))
    field(:updated_at, :datetime)
    field(:last_csr_to_touch, :string)
  end

  input_object :sort_arg do
    field(:field, non_null(:string))
    field(:direction, non_null(:integer))
  end

  @desc "Stream Event"
  object :stream_event do
    field :event_id, non_null(:string)
    field :event_type, non_null(:string)
    field :data, non_null(:json)
    field :created_at, non_null(:datetime)
  end
end
