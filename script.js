const contentContainer = document.getElementById("menu-container");
const facturacionSection = document.getElementById("facturacion");
const navButtons = document.querySelectorAll(".nav-btn");
// *** CAMBIO AQUÍ: Ahora selecciona el <span> con la nueva clase ***
const facturacionLink = document.querySelector(".facturacion-link"); 

// Función para cargar contenido (Categorías del Menú o Facturación)
async function loadContent(category) {
    // 1. Oculta/Muestra el menú y facturación
    if (category === "facturacion") {
        facturacionSection.classList.remove("hidden");
        contentContainer.innerHTML = "";
        // Desactiva todos los botones del menú al ir a facturación
        navButtons.forEach(btn => btn.classList.remove("active"));
    } else {
        // ... (resto de la lógica)
        facturacionSection.classList.add("hidden");
        try {
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

// Función para manejar la navegación entre categorías (solo botones de NAV)
function handleNavigation(category) {
    // 1. Activa el botón correcto de la barra NAV
    navButtons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-category") === category) {
            btn.classList.add("active");
        }
    });
    // 2. Carga el contenido
    loadContent(category);
}

// Event Listeners para los botones de navegación (Comida, Bebidas, etc.)
navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const category = button.getAttribute("data-category");
        handleNavigation(category);
    });
});

// *** CAMBIO AQUÍ: Event Listener para el nuevo <span> de Facturación ***
facturacionLink.addEventListener("click", () => {
    loadContent("facturacion");
});


// *************** Lógica de Facturación (Mantenida) ***************
// ... (El resto del script, incluyendo el formulario de facturación, se mantiene igual) ...

// Cargar el menú de "Comida" al iniciar
document.addEventListener("DOMContentLoaded", () => {
    handleNavigation("comida");
});