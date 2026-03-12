// Año footer
document.getElementById("year").textContent = new Date().getFullYear();

// Form validation (Bootstrap-style)
(() => {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    status.textContent = "Enviado con éxito.";
    form.reset();
  });
})();

// Counter animation - SOLO UNA VEZ
(() => {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
    const duration = 5000; 
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const val = Math.floor(target * (1 - Math.pow(1 - t, 3)));
      el.textContent = val.toLocaleString("es-CL");
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      counters.forEach(animateCounter);
      // ✅ Se detiene aquí para que no se repita nunca más
      io.disconnect();
    }
  }, { threshold: 0.3 });

  const section = document.getElementById("datos");
  if (section) io.observe(section);
})();

// HERO SLIDER
(() => {
  const bg = document.querySelector(".hero-bg");
  if (!bg) return;
  const slides = ["assets/img/hero.png", "assets/img/hero2.png", "assets/img/hero3.png", "assets/img/hero4.png"];
  let i = 0;
  bg.style.backgroundImage = `url("${slides[0]}")`;
  setInterval(() => {
    i = (i + 1) % slides.length;
    bg.style.opacity = "0";
    setTimeout(() => {
      bg.style.backgroundImage = `url("${slides[i]}")`;
      bg.style.opacity = "1";
    }, 350);
  }, 10000);
})();

// Lógica de Pop-up Emergencia Nocturna (23:00 a 08:00)
(() => {
  const popup = document.getElementById("nightPopup");
  const closeBtn = document.getElementById("closePopup");
  
  if (!popup) return;

  const checkSchedule = () => {
    const now = new Date();
    const hour = now.getHours();

    // Si la hora es >= 23 o < 8 (de 11 PM a 7:59 AM)
    if (hour >= 23 || hour < 8) {
      popup.style.display = "flex";
    } else {
      popup.style.display = "none";
    }
  };

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  // Ejecutar al cargar
  checkSchedule();
})();