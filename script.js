const form = document.getElementById("facturaForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensaje.textContent = "Enviando información...";

  const formData = new FormData(form);

  try {
    const response = await fetch("/api/sendMail", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      mensaje.textContent = "✅ Información enviada correctamente.";
      form.reset();
    } else {
      mensaje.textContent = "❌ Error al enviar la información.";
    }
  } catch (error) {
    console.error(error);
    mensaje.textContent = "❌ Error al enviar. Intenta de nuevo.";
  }
});
