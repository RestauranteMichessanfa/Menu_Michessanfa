const contentContainer = document.getElementById("menu-container");
const facturacionSection = document.getElementById("facturacion");
const navButtons = document.querySelectorAll(".nav-btn");
// Elemento del footer para Facturación
const facturacionLink = document.querySelector(".facturacion-link"); 

// Lógica de carga del menú
async function loadContent(category) {
    if (category === "facturacion") {
        facturacionSection.classList.remove("hidden");
        contentContainer.innerHTML = "";
        navButtons.forEach(btn => btn.classList.remove("active"));
    } else {
        facturacionSection.classList.add("hidden");
        try {
            // Carga el contenido de los archivos de menú (comida.html, etc.)
            const response = await fetch(`${category}.html`);
            if (response.ok) {
                contentContainer.innerHTML = await response.text();
            } else {
                contentContainer.innerHTML = `<p>Error al cargar el menú de ${category}.</p>`;
            }
        } catch (error) {
            console.error("Error de carga:", error);
            contentContainer.innerHTML = `<p>No se pudo establecer conexión para cargar el menú de ${category}.</p>`;
        }
    }
}

// Función para manejar la navegación entre categorías
function handleNavigation(category) {
    navButtons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-category") === category) {
            btn.classList.add("active");
        }
    });
    loadContent(category);
}

// Event Listeners para la navegación
navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const category = button.getAttribute("data-category");
        handleNavigation(category);
    });
});
facturacionLink.addEventListener("click", () => {
    loadContent("facturacion");
});

// *************** Lógica de Facturación (ORIGINAL Y FUNCIONAL) ***************
// El código debe ser exactamente el que tenías en la base:
const form = document.getElementById("facturaForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Esta línea es VITAL y ya no debe fallar.
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
// *************** Fin Lógica de Facturación ***************


// Cargar el menú de "Comida" al iniciar
document.addEventListener("DOMContentLoaded", () => {
    handleNavigation("comida");
});