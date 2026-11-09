/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3299786656")

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "select643686883",
    "maxSelect": 0,
    "name": "estado",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "recibida",
      "en_diagnostico",
      "en_reparacion",
      "lista_para_entregar",
      "entregada",
      "cancelada"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3299786656")

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "select643686883",
    "maxSelect": 0,
    "name": "estado",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "recibida",
      "en_diagnostico",
      "en_reparacion",
      "lsita_para_entregar",
      "entregada",
      "cancelada"
    ]
  }))

  return app.save(collection)
})
