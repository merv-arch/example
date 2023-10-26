defmodule BackendWeb.Schema do
  use Absinthe.Schema

  import_types(BackendWeb.Schema.Types)
  import_types(Absinthe.Type.Custom)

  alias BackendWeb.Resolvers

  query do
    @desc "Get Order by id"
    field :order, :order do
      arg(:id, :string)

      resolve(&Resolvers.Content.order/2)
    end
  end
end
