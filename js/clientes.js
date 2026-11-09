(() => {
  const collection = () => ElPiston.pb.collection("clientes");

  function toFrontend(record) {
    return {
      id: record.id,
      name: record.nombre,
      phone: record.telefono,
      address: record.direccion || ""
    };
  }

  const api = {
    async listar() {
      ElPiston.requireAuth();
      const records = await collection().getFullList({ sort: "nombre" });
      return records.map(toFrontend);
    },

    async obtener(id) {
      ElPiston.requireAuth();
      return toFrontend(await collection().getOne(id));
    },

    async crear(client) {
      ElPiston.requireAuth();
      const record = await collection().create({
        nombre: client.name,
        telefono: client.phone,
        direccion: client.address || ""
      });
      return toFrontend(record);
    },

    async actualizar(id, client) {
      ElPiston.requireAuth();
      const record = await collection().update(id, {
        nombre: client.name,
        telefono: client.phone,
        direccion: client.address || ""
      });
      return toFrontend(record);
    },

    async eliminar(id) {
      AuthAPI.requireRole("dueno");
      return collection().delete(id);
    }
  };

  window.ClientesAPI = api;
})();