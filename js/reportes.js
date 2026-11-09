(() => {
  const api = {
    async obtenerResumen(periodo = "Este mes") {
      AuthAPI.requireRole("dueno");

      const [orders, parts, payments, jobs, usedParts] = await Promise.all([
        ElPiston.pb.collection("ordenes").getFullList({
          sort: "-fecha_entrada",
          expand: "vehiculo,vehiculo.cliente,mecanico"
        }),
        ElPiston.pb.collection("repuestos").getFullList(),
        ElPiston.pb.collection("pagos").getFullList(),
        ElPiston.pb.collection("trabajos").getFullList(),
        ElPiston.pb.collection("repuestos_usados").getFullList()
      ]);

      const ahora = new Date();
      const inicio = new Date(ahora);

      if (periodo === "Últimos 7 días") {
        inicio.setDate(ahora.getDate() - 6);
        inicio.setHours(0, 0, 0, 0);
      } else if (periodo === "Este mes") {
        inicio.setDate(1);
        inicio.setHours(0, 0, 0, 0);
      } else {
        inicio.setMonth(0, 1);
        inicio.setHours(0, 0, 0, 0);
      }

      const fechaDentroPeriodo = fecha => {
        if (!fecha) return false;
        const valor = new Date(fecha);
        return !Number.isNaN(valor.getTime()) &&
          valor >= inicio &&
          valor <= ahora;
      };

      const pagosPeriodo = payments.filter(p =>
        fechaDentroPeriodo(p.fecha)
      );

      const ordenesPeriodo = orders.filter(o =>
        fechaDentroPeriodo(o.fecha_entrada)
      );

      const totalPagado = payments.reduce(
        (sum, p) => sum + Number(p.monto || 0),
        0
      );

      const facturacionPeriodo = pagosPeriodo.reduce(
        (sum, p) => sum + Number(p.monto || 0),
        0
      );

      const totalManoObra = jobs.reduce(
        (sum, j) => sum + Number(j.precio_mano_obra || 0),
        0
      );

      const totalRepuestos = usedParts.reduce(
        (sum, p) => sum +
          Number(p.cantidad || 0) *
          Number(p.precio_unitario || 0),
        0
      );

      const abiertas = orders.filter(o =>
        !["entregada", "cancelada"].includes(o.estado)
      );

      const completadas = ordenesPeriodo.filter(
        o => o.estado === "entregada"
      );

      const clientesAtendidos = new Set(
        completadas
          .map(o => o.expand?.vehiculo?.cliente)
          .filter(Boolean)
      );

      const stockBajo = parts.filter(
        p => Number(p.existencias) <= Number(p.stock_minimo)
      );

      const porEstado = orders.reduce((result, order) => {
        result[order.estado] = (result[order.estado] || 0) + 1;
        return result;
      }, {});

      const porMecanico = orders.reduce((result, order) => {
        const mechanic =
          order.expand?.mecanico?.nombre ||
          order.expand?.mecanico?.email ||
          order.mecanico ||
          "Sin asignar";

        result[mechanic] = (result[mechanic] || 0) + 1;
        return result;
      }, {});

      const semanas = Array.from({ length: 7 }, (_, i) => ({
        etiqueta: "",
        fecha: new Date(inicio),
        ingresos: 0
      }));

      if (periodo === "Últimos 7 días") {
        semanas.forEach((semana, i) => {
          semana.fecha.setDate(inicio.getDate() + i);
          semana.etiqueta = semana.fecha.toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric"
          });
        });
      } else {
        semanas.length = 0;
        const cantidadSemanas = Math.ceil(ahora.getDate() / 7);

        for (let i = 0; i < cantidadSemanas; i++) {
          const fecha = new Date(inicio);
          fecha.setDate(1 + i * 7);

          semanas.push({
            etiqueta: `Semana ${i + 1}`,
            fecha,
            ingresos: 0
          });
        }
      }

      pagosPeriodo.forEach(p => {
        const fecha = new Date(p.fecha);
        let indice;

        if (periodo === "Últimos 7 días") {
          indice = Math.round(
            (new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) -
              new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) /
            86400000
          );
        } else {
          indice = Math.floor((fecha.getDate() - 1) / 7);
        }

        if (semanas[indice]) {
          semanas[indice].ingresos += Number(p.monto || 0);
        }
      });

      return {
        totalOrdenes: orders.length,
        ordenesAbiertas: abiertas.length,
        ordenesCompletadas: completadas.length,
        totalPagado,
        facturacionPeriodo,
        ticketPromedio: completadas.length
          ? facturacionPeriodo / completadas.length
          : 0,
        clientesAtendidos: clientesAtendidos.size,
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
        porMecanico,
        ingresosPorSemana: semanas.map(s => ({
          etiqueta: s.etiqueta,
          ingresos: s.ingresos
        }))
      };
    }
  };

  window.ReportesAPI = api;
})();
