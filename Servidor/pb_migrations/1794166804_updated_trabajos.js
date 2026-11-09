/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3144198324")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2687119104",
    "max": 0,
    "min": 0,
    "name": "descripcion",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "number1042778973",
    "max": null,
    "min": null,
    "name": "precio_mano_obra",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3144198324")

  // remove field
  collection.fields.removeById("text2687119104")

  // remove field
  collection.fields.removeById("number1042778973")

  return app.save(collection)
})
