/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3299786656")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\")",
    "deleteRule": "@request.auth.id != \"\" && @request.auth.rol = \"dueno\"",
    "listRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || mecanico = @request.auth.id)",
    "updateRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || (mecanico = @request.auth.id && @request.body.mecanico:changed = false && @request.body.vehiculo:changed = false))",
    "viewRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || mecanico = @request.auth.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3299786656")

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
