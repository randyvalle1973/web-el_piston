
(() => {
  const api = {
    async login(identity, password) {
      const result = await ElPiston.pb.collection("users").authWithPassword(identity, password);
      if (result.record.activo === false) {
        ElPiston.pb.authStore.clear();
        throw new Error("Esta cuenta está desactivada. Contacta con el dueño del taller.");
      }
      return result.record;
    },

    logout() {
      ElPiston.clearAuth();
      window.location.reload();
    },

    currentUser() {
      return ElPiston.currentUser();
    },

    isAuthenticated() {
      return ElPiston.isAuthenticated();
    },

    role() {
      return ElPiston.currentUser()?.rol || null;
    },

    hasRole(...roles) {
      return roles.includes(api.role());
    },

    requireRole(...roles) {
      ElPiston.requireAuth();
      if (!api.hasRole(...roles)) {
        throw new Error("No tienes permisos para realizar esta operación.");
      }
    },

    async refresh() {
      if (!ElPiston.pb.authStore.isValid) return null;
      try {
        const result = await ElPiston.pb.collection("users").authRefresh();
        return result.record;
      } catch (error) {
        ElPiston.clearAuth();
        throw error;
      }
    }
  };

  window.AuthAPI = api;
})();
