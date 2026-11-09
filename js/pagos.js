(() => {
  const collection = () => ElPiston.pb.collection("pagos");

  function toFrontend(record) {
    const order = record.expand?.orden;
    const vehicle = order?.expand?.vehiculo;
    const client = vehicle?.expand?.cliente;

    return {
      id: record.id,
      order: record.orden,
      client: client?.id || null,
      clientName: client?.nombre || "Cliente no disponible",
      amount: Number(record.monto),
      date: record.fecha,
      method: record.metodo,
      observation: record.observacion || ""
    };
  }

  const api = {
    async listar() {
      AuthAPI.requireRole("dueno", "recepcionista");

      const records = await collection().getFullList({
        sort: "-fecha",
        expand: "orden,orden.vehiculo,orden.vehiculo.cliente"
      });

      return records.map(toFrontend);
    },

    async deOrden(orderId) {
      AuthAPI.requireRole("dueno", "recepcionista");

      const records = await collection().getFullList({
        filter: `orden = "${orderId}"`,
        sort: "-fecha",
        expand: "orden,orden.vehiculo,orden.vehiculo.cliente"
      });

      return records.map(toFrontend);
    },

    async registrar(payment) {
      AuthAPI.requireRole("dueno", "recepcionista");

      if (Number(payment.amount) <= 0) {
        throw new Error("El importe debe ser mayor que cero.");
      }

      const record = await collection().create({
        orden: payment.order,
        monto: Number(payment.amount),
        fecha: payment.date || new Date().toISOString(),
        metodo: payment.method.toLowerCase(),
        observacion: payment.observation || ""
      });

      return toFrontend(record);
    },

    async eliminar(id) {
      AuthAPI.requireRole("dueno");
      return collection().delete(id);
    }
  };

  window.PagosAPI = api;
})();
