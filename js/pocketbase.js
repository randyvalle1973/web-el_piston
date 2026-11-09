(() => {
  const URL_BASE = "http://127.0.0.1:8090";
  const pb = new PocketBase(URL_BASE);
  pb.autoCancellation(false);

  const collections = {
    users: "users",
    clientes: "clientes",
    vehiculos: "vehiculos",
    ordenes: "ordenes",
    trabajos: "trabajos",
    repuestos: "repuestos",
    repuestosUsados: "repuestos_usados",
    pagos: "pagos"
  };

  function requireAuth() {
    if (!pb.authStore.isValid || !pb.authStore.record) {
      throw new Error("Debes iniciar sesión para realizar esta operación.");
    }
    return pb.authStore.record;
  }

  function errorMessage(error) {
    if (error?.response?.message) return error.response.message;
    if (error?.response?.data) {
      const messages = Object.values(error.response.data)
        .map(item => item?.message)
        .filter(Boolean);
      if (messages.length) return messages.join(" ");
    }
    return error?.message || "Ha ocurrido un error al comunicarse con el servidor.";
  }

  window.ElPiston = {
    pb,
    URL_BASE,
    collections,
    requireAuth,
    errorMessage,
    isAuthenticated: () => pb.authStore.isValid && !!pb.authStore.record,
    currentUser: () => pb.authStore.record,
    clearAuth: () => pb.authStore.clear()
  };
})();