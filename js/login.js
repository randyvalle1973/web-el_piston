
function inicializarLogin() {
  const form = document.querySelector("#loginForm");
  const error = document.querySelector("#loginError");
  const button = document.querySelector("#loginButton");

  if (!form || !error || !button || !window.AuthAPI) {
    console.error("No se encontraron los elementos necesarios para iniciar sesión.");
    return;
  }

 function mostrarAplicacion() {
  document.body.classList.add("authenticated");
  window.dispatchEvent(new Event("elpiston:authenticated"));
}

  if (window.AuthAPI.isAuthenticated()) {
    mostrarAplicacion();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#loginEmail").value.trim();
    const password = document.querySelector("#loginPassword").value;

    error.textContent = "";
    button.disabled = true;
    button.textContent = "Verificando...";

    try {
      await window.AuthAPI.login(email, password);
      mostrarAplicacion();
      form.reset();
    } catch (err) {
      console.error("Error de inicio de sesión:", err);
      error.textContent = err.message || "Correo o contraseña incorrectos.";
    } finally {
      button.disabled = false;
      button.textContent = "Iniciar sesión";
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarLogin);
} else {
  inicializarLogin();
}
