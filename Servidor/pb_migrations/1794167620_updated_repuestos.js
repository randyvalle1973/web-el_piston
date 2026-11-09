/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_590519246")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\")",
    "deleteRule": "@request.auth.id != \"\" && @request.auth.rol = \"dueno\"",
    "listRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || @request.auth.rol = \"mecanico\")",
    "updateRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\")",
    "viewRule": "@request.auth.id != \"\" && (@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" || @request.auth.rol = \"mecanico\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_590519246")

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
