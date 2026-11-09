
(() => {
  const parts = () => ElPiston.pb.collection("repuestos");
  const used = () => ElPiston.pb.collection("repuestos_usados");

  function toFrontend(record) {
    return {
      id: record.id,
      name: record.nombre,
      code: record.codigo,
      price: Number(record.precio_venta),
      stock: Number(record.existencias),
      min: Number(record.stock_minimo)
    };
  }

  async function modificarExistencias(partId, cantidad) {
    const part = await parts().getOne(partId);
    const nuevoStock = Number(part.existencias) + cantidad;

    if (nuevoStock < 0) {
      throw new Error("No hay existencias suficientes.");
    }

    return parts().update(partId, {
      existencias: nuevoStock
    });
  }

  const api = {
    async listar() {
      ElPiston.requireAuth();
      const records = await parts().getFullList({
        sort: "nombre"
      });
      return records.map(toFrontend);
    },

    async obtener(id) {
      ElPiston.requireAuth();
      return toFrontend(await parts().getOne(id));
    },

    async stockBajo() {
      ElPiston.requireAuth();
      const records = await parts().getFullList({
        sort: "nombre"
      });
      return records.map(toFrontend).filter(p => p.stock <= p.min);
    },

    async crear(part) {
      AuthAPI.requireRole("dueno", "recepcionista");

      const record = await parts().create({
        nombre: part.name,
        codigo: part.code,
        precio_venta: Number(part.price),
        existencias: Number(part.stock),
        stock_minimo: Number(part.min)
      });

      return toFrontend(record);
    },

    async actualizar(id, part) {
      AuthAPI.requireRole("dueno", "recepcionista");

      const record = await parts().update(id, {
        nombre: part.name,
        codigo: part.code,
        precio_venta: Number(part.price),
        existencias: Number(part.stock),
        stock_minimo: Number(part.min)
      });

      return toFrontend(record);
    },

    async actualizarStock(id, stock) {
      AuthAPI.requireRole("dueno", "recepcionista");

      if (Number(stock) < 0) {
        throw new Error("Las existencias no pueden ser negativas.");
      }

      return toFrontend(await parts().update(id, {
        existencias: Number(stock)
      }));
    },

    async registrarUso(orderId, partId, quantity) {
      ElPiston.requireAuth();

      const amount = Number(quantity);

      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("La cantidad debe ser un número entero mayor que cero.");
      }

      const part = await parts().getOne(partId);

      if (Number(part.existencias) < amount) {
        throw new Error("No hay existencias suficientes.");
      }

      await modificarExistencias(partId, -amount);

      try {
        return await used().create({
          orden: orderId,
          repuesto: partId,
          cantidad: amount,
          precio_unitario: Number(part.precio_venta)
        });
      } catch (error) {
        try {
          await modificarExistencias(partId, amount);
        } catch (restoreError) {
          console.error("No se pudo restaurar el inventario:", restoreError);
        }

        throw error;
      }
    },

    async usosDeOrden(orderId) {
      ElPiston.requireAuth();

      return used().getFullList({
        filter: `orden = "${orderId}"`,
        expand: "repuesto",
        sort: "created"
      });
    },

    async eliminarUso(usedId) {
      ElPiston.requireAuth();

      const usage = await used().getOne(usedId);
      const partId = usage.repuesto;
      const amount = Number(usage.cantidad);

      await modificarExistencias(partId, amount);

      try {
        await used().delete(usedId);
      } catch (error) {
        try {
          await modificarExistencias(partId, -amount);
        } catch (restoreError) {
          console.error("No se pudo revertir la devolución:", restoreError);
        }

        throw error;
      }

      return true;
    },

    async eliminar(id) {
      AuthAPI.requireRole("dueno");
      return parts().delete(id);
    }
  };

  window.InventarioAPI = api;
})();
