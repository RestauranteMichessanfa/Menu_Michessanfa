const contentContainer = document.getElementById("menu-container");
const facturacionSection = document.getElementById("facturacion");
const navButtons = document.querySelectorAll(".nav-btn");
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


// *************** LÓGICA DE VISTA PREVIA (PEEK & POP) ***************
const floatingPreview = document.getElementById("floating-preview");
const previewImg = document.getElementById("preview-img");
const previewDesc = document.getElementById("preview-desc");
let pressTimer;

// Función para mostrar la ventana flotante
function showPreview(item) {
    const imgSrc = item.getAttribute("data-img");
    const descText = item.getAttribute("data-desc");
    
    // Solo mostramos si el producto en el HTML tiene la imagen y la descripción configuradas
    if (imgSrc && descText) {
        previewImg.src = imgSrc;
        previewDesc.textContent = descText;
        floatingPreview.classList.add("active");
        
        // Vibración háptica muy sutil al abrir (solo si el celular lo soporta)
        if (navigator.vibrate) navigator.vibrate(50);
    }
}

// Función para ocultar la ventana flotante
function hidePreview() {
    clearTimeout(pressTimer);
    floatingPreview.classList.remove("active");
}

// 1. Evitar que salga el menú predeterminado del celular al dejar presionado
document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".product-item[data-img]")) {
        e.preventDefault();
    }
});

// 2. Eventos Táctiles para el Celular
document.addEventListener("touchstart", (e) => {
    const item = e.target.closest(".product-item");
    if (item && item.hasAttribute("data-img")) {
        // Empieza a contar: si pasan 400ms y no suelta el dedo, se abre.
        pressTimer = setTimeout(() => showPreview(item), 400); 
    }
}, { passive: true });

document.addEventListener("touchend", hidePreview); // Al soltar el dedo
document.addEventListener("touchmove", hidePreview); // Si desliza el dedo para hacer scroll, cancela la acción

// 3. Eventos de Ratón (por si alguien lo abre en computadora)
document.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".product-item");
    if (item && item.hasAttribute("data-img")) {
        pressTimer = setTimeout(() => showPreview(item), 400);
    }
});

document.addEventListener("mouseup", hidePreview);
document.addEventListener("mousemove", hidePreview);
// *************** FIN VISTA PREVIA ***************


// Render inicial automático con la sección de Comida
document.addEventListener("DOMContentLoaded", () => {
    handleNavigation("comida");
});