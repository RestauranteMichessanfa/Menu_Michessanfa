const contentContainer = document.getElementById("menu-container");
const facturacionSection = document.getElementById("facturacion");
const navButtons = document.querySelectorAll(".nav-btn");
const facturacionLink = document.querySelector(".facturacion-link"); 

// Lógica de carga del menú gastronómico
async function loadContent(category) {
    if (category === "facturacion") {
        facturacionSection.classList.remove("hidden");
        contentContainer.innerHTML = "";
        navButtons.forEach(btn => btn.classList.remove("active"));
    } else {
        facturacionSection.classList.add("hidden");
        try {
            // Carga asíncrona modular de los fragmentos HTML
            const response = await fetch(`${category}.html`);
            if (response.ok) {
                contentContainer.innerHTML = await response.text();
            } else {
                contentContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">Error al cargar el menú de ${category}.</p>`;
            }
        } catch (error) {
            console.error("Error de carga:", error);
            contentContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">No se pudo establecer conexión para cargar el menú.</p>`;
        }
    }
}

// Manejo dinámico de la clase activa en barra de navegación
function handleNavigation(category) {
    navButtons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-category") === category) {
            btn.classList.add("active");
        }
    });
    loadContent(category);
}

// Event Listeners de la barra de navegación
navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const category = button.getAttribute("data-category");
        handleNavigation(category);
    });
});

facturacionLink.addEventListener("click", () => {
    handleNavigation("facturacion");
    // Desplaza la pantalla automáticamente arriba al dar click en facturación
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// *************** Lógica de Facturación (ORIGINAL Y FUNCIONAL) ***************
const form = document.getElementById("facturaForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    mensaje.style.color = "var(--accent-gold)";
    mensaje.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Enviando información a administración...`;

    const formData = new FormData(form);

    try {
        const response = await fetch("/api/sendMail", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            mensaje.style.color = "var(--accent-green)";
            mensaje.innerHTML = "<i class='fa-solid fa-circle-check'></i> Solicidud enviada con éxito. Recibirás tu CFDI en tu correo.";
            form.reset();
        } else {
            mensaje.style.color = "#e74c3c";
            mensaje.innerHTML = "<i class='fa-solid fa-circle-xmark'></i> Error en el servidor al enviar la información.";
        }
    } catch (error) {
        console.error(error);
        mensaje.style.color = "#e74c3c";
        mensaje.innerHTML = "<i class='fa-solid fa-wifi'></i> Error de conexión. Inténtalo de nuevo.";
    }
});
// *************** Fin Lógica de Facturación ***************

// Render inicial automático con la sección de Comida
document.addEventListener("DOMContentLoaded", () => {
    handleNavigation("comida");
});