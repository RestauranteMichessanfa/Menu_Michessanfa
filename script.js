const contentContainer = document.getElementById("menu-container");
const facturacionSection = document.getElementById("facturacion");
const navButtons = document.querySelectorAll(".nav-btn");
const facturacionLink = document.querySelector(".facturacion-link"); 

// --- VARIABLES DE MEMORIA PARA EL SCROLL ---
let currentCategory = "comida"; // Categoría inicial por defecto
const scrollPositions = {};     // Diccionario que guardará las alturas

// Lógica de carga del menú
async function loadContent(category) {
    // 1. Guardar la posición de scroll EXACTA de la pestaña actual ANTES de cambiar
    scrollPositions[currentCategory] = window.scrollY;

    // 2. Actualizar la memoria con la nueva pestaña a la que vamos
    currentCategory = category;

    if (category === "facturacion") {
        facturacionSection.classList.remove("hidden");
        contentContainer.innerHTML = "";
        navButtons.forEach(btn => btn.classList.remove("active"));
    } else {
        facturacionSection.classList.add("hidden");
        try {
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

    // 3. Restaurar el scroll a donde nos quedamos (o hasta arriba si es la primera vez)
    // Se usa un pequeño Timeout para darle tiempo al navegador de pintar el HTML antes de moverse
    setTimeout(() => {
        window.scrollTo({
            top: scrollPositions[category] !== undefined ? scrollPositions[category] : 0,
            behavior: 'auto' // Se usa 'auto' (instantáneo) para que no se vea el barrido bajando
        });
    }, 10);
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


// *************** LÓGICA DE VISTA PREVIA (PEEK & POP) ***************
const floatingPreview = document.getElementById("floating-preview");
const previewImg = document.getElementById("preview-img");
const previewDesc = document.getElementById("preview-desc");
let pressTimer;
let startX = 0;
let startY = 0;

function showPreview(item) {
    const imgSrc = item.getAttribute("data-img");
    const descText = item.getAttribute("data-desc");
    
    if (imgSrc && descText) {
        previewImg.src = imgSrc;
        previewDesc.textContent = descText;
        floatingPreview.classList.add("active");
        if (navigator.vibrate) navigator.vibrate(50); // Vibración sutil
    }
}

function hidePreview() {
    clearTimeout(pressTimer);
    floatingPreview.classList.remove("active");
}

// Bloquea el menú contextual nativo
document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".product-item[data-img]")) {
        e.preventDefault();
    }
});

// EVENTOS PARA CELULARES (Táctil)
document.addEventListener("touchstart", (e) => {
    const item = e.target.closest(".product-item");
    if (item && item.hasAttribute("data-img")) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        pressTimer = setTimeout(() => showPreview(item), 300); 
    }
}, { passive: true });

document.addEventListener("touchmove", (e) => {
    if (!floatingPreview.classList.contains("active")) {
        const moveX = Math.abs(e.touches[0].clientX - startX);
        const moveY = Math.abs(e.touches[0].clientY - startY);
        if (moveX > 15 || moveY > 15) {
            clearTimeout(pressTimer);
        }
    }
}, { passive: true });

document.addEventListener("touchend", hidePreview);
document.addEventListener("touchcancel", hidePreview);

// EVENTOS PARA COMPUTADORA (Ratón)
document.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".product-item");
    if (item && item.hasAttribute("data-img")) {
        pressTimer = setTimeout(() => showPreview(item), 300);
    }
});

document.addEventListener("mouseup", hidePreview);
// *************** FIN VISTA PREVIA ***************

// Render inicial automático con la sección de Comida
document.addEventListener("DOMContentLoaded", () => {
    handleNavigation("comida");
});