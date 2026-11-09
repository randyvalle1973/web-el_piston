/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_279994318")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" ",
    "deleteRule": "@request.auth.rol = \"dueno\" ",
    "listRule": "@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\"",
    "updateRule": "@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\"",
    "viewRule": "@request.auth.rol = \"dueno\" || @request.auth.rol = \"recepcionista\" "
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_279994318")

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
