(() => {
  const api = {
    async obtenerResumen() {
      AuthAPI.requireRole("dueno");

      const [orders, parts, payments, jobs, usedParts] = await Promise.all([
        ElPiston.pb.collection("ordenes").getFullList({
          expand: "vehiculo,vehiculo.cliente,mecanico"
        }),
        ElPiston.pb.collection("repuestos").getFullList(),
        ElPiston.pb.collection("pagos").getFullList(),
        ElPiston.pb.collection("trabajos").getFullList(),
        ElPiston.pb.collection("repuestos_usados").getFullList()
      ]);

      const totalPagado = payments.reduce((sum, p) => sum + Number(p.monto || 0), 0);
      const totalManoObra = jobs.reduce((sum, j) => sum + Number(j.precio_mano_obra || 0), 0);
      const totalRepuestos = usedParts.reduce((sum, p) => sum + Number(p.cantidad || 0) * Number(p.precio_unitario || 0), 0);
      const abiertas = orders.filter(o => !["entregada", "cancelada"].includes(o.estado));
      const stockBajo = parts.filter(p => Number(p.existencias) <= Number(p.stock_minimo));

      const porEstado = orders.reduce((result, order) => {
        result[order.estado] = (result[order.estado] || 0) + 1;
        return result;
      }, {});

      const porMecanico = orders.reduce((result, order) => {
        const mechanic = order.expand?.mecanico?.nombre || order.expand?.mecanico?.email || order.mecanico;
        result[mechanic] = (result[mechanic] || 0) + 1;
        return result;
      }, {});

      return {
        totalOrdenes: orders.length,
        ordenesAbiertas: abiertas.length,
        ordenesCompletadas: orders.filter(o => o.estado === "entregada").length,
        totalPagado,
        totalManoObra,
        totalRepuestos,
        facturacionCalculada: totalManoObra + totalRepuestos,
        stockBajo: stockBajo.map(p => ({
          id: p.id,
          nombre: p.nombre,
          existencias: Number(p.existencias),
          minimo: Number(p.stock_minimo)
        })),
        porEstado,
        porMecanico
      };
    }
  };

  window.ReportesAPI = api;
})();