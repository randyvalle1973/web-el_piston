(() => {
  const collection = () => ElPiston.pb.collection("vehiculos");

  function toFrontend(record) {
    return {
      id: record.id,
      plate: record.matricula,
      brand: record.marca,
      model: record.modelo,
      year: record.anio,
      km: record.kilometraje,
      client: record.cliente
    };
  }

  const api = {
    async listar() {
      ElPiston.requireAuth();
      const records = await collection().getFullList({
        sort: "-created",
        expand: "cliente"
      });
      return records.map(toFrontend);
    },

    async obtener(id) {
      ElPiston.requireAuth();
      return toFrontend(await collection().getOne(id, { expand: "cliente" }));
    },

    async porCliente(clienteId) {
      ElPiston.requireAuth();
      const records = await collection().getFullList({
        filter: `cliente = "${clienteId}"`,
        sort: "matricula"
      });
      return records.map(toFrontend);
    },

    async crear(vehicle) {
      ElPiston.requireAuth();
      const record = await collection().create({
        cliente: vehicle.client,
        matricula: vehicle.plate.trim().toUpperCase(),
        marca: vehicle.brand,
        modelo: vehicle.model,
        anio: Number(vehicle.year),
        kilometraje: Number(vehicle.km)
      });
      return toFrontend(record);
    },

    async actualizar(id, vehicle) {
      ElPiston.requireAuth();
      const record = await collection().update(id, {
        cliente: vehicle.client,
        matricula: vehicle.plate.trim().toUpperCase(),
        marca: vehicle.brand,
        modelo: vehicle.model,
        anio: Number(vehicle.year),
        kilometraje: Number(vehicle.km)
      });
      return toFrontend(record);
    },

    async actualizarKilometraje(id, km) {
      ElPiston.requireAuth();
      const record = await collection().update(id, { kilometraje: Number(km) });
      return toFrontend(record);
    },

    async eliminar(id) {
      AuthAPI.requireRole("dueno", "recepcionista");
      return collection().delete(id);
    }
  };

  window.VehiculosAPI = api;
})();