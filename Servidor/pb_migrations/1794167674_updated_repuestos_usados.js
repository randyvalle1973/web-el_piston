/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3366194521")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || (@request.auth.rol = \"mecanico\" && @collection.ordenes.id ?= @request.body.orden && @collection.ordenes.mecanico ?= @request.auth.id))",
    "deleteRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\")",
    "listRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || orden.mecanico = @request.auth.id) ",
    "updateRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || (orden.mecanico = @request.auth.id && @request.body.orden:changed = false))",
    "viewRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || orden.mecanico = @request.auth.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3366194521")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
