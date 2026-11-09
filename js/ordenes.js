(() => {
  const collection = () => ElPiston.pb.collection("ordenes");

  const estados = {
    recibida: "Recibida",
    en_diagnostico: "En diagnóstico",
    en_reparacion: "En reparación",
    lista_para_entregar: "Lista para entregar",
    entregada: "Entregada",
    cancelada: "Cancelada"
  };

  const estadosInversos = Object.fromEntries(
    Object.entries(estados).map(([key, value]) => [value, key])
  );

  function toFrontend(record) {
  const v = record.expand?.vehiculo;
  const c = v?.expand?.cliente;
  const m = record.expand?.mecanico;

  return {
    id: record.id,
    vehicle: record.vehiculo,
    vehicleInfo: v ? {
      plate: v.matricula,
      brand: v.marca,
      model: v.modelo,
      year: v.anio,
      km: v.kilometraje
    } : null,
    client: v?.cliente || c?.id || null,
    clientName: c?.nombre || "",
    mechanic: m?.nombre || m?.email || "",
    mechanicId: record.mecanico,
    problem: record.problema || "",
    status: estados[record.estado] || record.estado || "Sin estado",
    date: record.fecha_entrada
      ? new Date(record.fecha_entrada).toLocaleDateString("es-ES")
      : "",
    entryMileage: record.kilometraje_entrada
  };
}

  const api = {
    estados,

    async listar() {
      ElPiston.requireAuth();
      const records = await collection().getFullList({
        sort: "-fecha_entrada",
        expand: "vehiculo,vehiculo.cliente,mecanico"
      });
      return records.map(toFrontend);
    },

    async obtener(id) {
      ElPiston.requireAuth();
      const record = await collection().getOne(id, {
        expand: "vehiculo,vehiculo.cliente,mecanico"
      });
      return toFrontend(record);
    },

    async abiertas() {
      ElPiston.requireAuth();
      const records = await collection().getFullList({
        filter: 'estado != "entregada" && estado != "cancelada"',
        sort: "-fecha_entrada",
        expand: "vehiculo,vehiculo.cliente,mecanico"
      });
      return records.map(toFrontend);
    },

    async crear(order) {
      AuthAPI.requireRole("dueno", "recepcionista");
      const status = estadosInversos[order.status] || order.status || "recibida";
      const record = await collection().create({
        vehiculo: order.vehicle,
        mecanico: order.mechanicId || order.mechanic,
        fecha_entrada: order.date || new Date().toISOString(),
        problema: order.problem,
        kilometraje_entrada: Number(order.entryMileage || 0),
        estado: status
      });
      return toFrontend(record);
    },

    async actualizarEstado(id, status) {
      ElPiston.requireAuth();
      const value = estadosInversos[status] || status;
      const user = AuthAPI.currentUser();
      if (user.rol === "mecanico") {
        const order = await collection().getOne(id);
        if (order.mecanico !== user.id) {
          throw new Error("Solo puedes modificar tus propias órdenes.");
        }
      }
      const record = await collection().update(id, { estado: value });
      return toFrontend(record);
    },

    async eliminar(id) {
      AuthAPI.requireRole("dueno");
      return collection().delete(id);
    }
  };

  window.OrdenesAPI = api;
})();