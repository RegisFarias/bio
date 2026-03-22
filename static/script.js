document.addEventListener('DOMContentLoaded', () => {

  // ===== CONFIG INICIAL =====
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const navLinks = document.querySelectorAll('nav a');
  const screens = document.querySelectorAll('.screen');
  const progressBar = document.querySelector('.progress-bar');
  const backToTop = document.getElementById('back-to-top');
  const contactForm = document.querySelector('.contact form');
  const videos = document.querySelectorAll('video');

  let activeIndex = 0;
  let isAnimating = false;

  // ===== RESTAURA TELA (F5) =====
  const savedScreen = sessionStorage.getItem('activeScreen');
  if (savedScreen !== null) {
    activeIndex = parseInt(savedScreen);
  }

  screens.forEach(screen => screen.scrollTop = 0);

  // ===== SCROLL REVEAL =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

  // ===== SKILLS =====
  const skillObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.style.width;
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.skill-bar div').forEach(bar => skillObserver.observe(bar));

  // ===== TROCA DE TELA =====
  function goToScreen(index) {
    if (index < 0 || index >= screens.length || index === activeIndex || isAnimating) return;

    isAnimating = true;

    const current = screens[activeIndex];
    const next = screens[index];
    const direction = index > activeIndex ? 'right' : 'left';

    next.scrollTop = 0;

    screens.forEach(s => s.classList.remove('from-right', 'from-left', 'to-right', 'to-left'));

    if (direction === 'right') {
      next.classList.add('from-right');
      current.classList.add('to-left');
    } else {
      next.classList.add('from-left');
      current.classList.add('to-right');
    }

    void next.offsetWidth;

    current.classList.remove('active');
    next.classList.add('active');

    activeIndex = index;
    updateUI();
    controlVideos();

    // salva tela
    sessionStorage.setItem('activeScreen', index);

    setTimeout(() => {
      screens.forEach((s, i) => {
        s.style.zIndex = i === activeIndex ? 1 : 0;
        s.classList.remove('to-left', 'to-right');
      });

      isAnimating = false;

      const activeScreen = screens[activeIndex];
      activeScreen.querySelectorAll('.scroll-reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        const screenRect = activeScreen.getBoundingClientRect();

        if (rect.top < screenRect.bottom - 80 && rect.bottom > screenRect.top + 80) {
          el.classList.add('revealed');
        }
      });

    }, 600);
  }

  function updateUI() {
    navLinks.forEach((link, i) => {
      link.classList.toggle('active-link', i === activeIndex);
    });

    progressBar.style.width = ((activeIndex + 1) / screens.length * 100) + '%';
    backToTop.classList.toggle('visible', activeIndex !== 0);
  }

  // ===== CONTROLE DE VÍDEOS =====
  function controlVideos() {
    // Toca o vídeo da tela ativa (se existir)
    const activeScreen = screens[activeIndex];
    const activeVideo = activeScreen.querySelector('video');

    videos.forEach(video => {
      if (video === activeVideo) {
        if (video.readyState < 2) video.load();
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  // ===== NAV =====
  navLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goToScreen(idx);
    });
  });

  // ===== SWIPE =====
  let touchStartX = 0;

  document.addEventListener('touchstart', (e) => {
    if (e.target.closest('model-viewer')) return;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (e.target.closest('model-viewer')) return;

    const touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) > 60) {
      goToScreen(activeIndex + (swipeDistance > 0 ? 1 : -1));
    }
  }, { passive: true });

  // ===== FORM =====
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        contactForm.innerHTML = res.ok
          ? '<p style="background:#2c6e2c;padding:1rem;border-radius:8px;">✅ Mensagem enviada!</p>'
          : '<p style="background:#a12;padding:1rem;border-radius:8px;">❌ Erro ao enviar.</p>';

      } catch {
        contactForm.innerHTML = '<p style="background:#a12;padding:1rem;border-radius:8px;">❌ Erro ao enviar.</p>';
      }
    });
  }

  // ===== LIGHTBOX =====
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox .close");

  if (lightbox && lightboxImg && closeBtn) {
    document.querySelectorAll(".project-images img").forEach(img => {
      img.addEventListener("click", () => {
        lightbox.classList.add("active");
        lightboxImg.src = img.src;
      });
    });

    closeBtn.addEventListener("click", () => {
      lightbox.classList.remove("active");
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target !== lightboxImg) {
        lightbox.classList.remove("active");
      }
    });
  }

  // ===== BOTÃO TOPO =====
  backToTop.addEventListener('click', () => goToScreen(0));

  // ===== INIT =====
  function init() {
    updateUI();

    screens.forEach((screen, i) => {
      screen.style.zIndex = i === activeIndex ? 1 : 0;
      screen.classList.toggle('active', i === activeIndex);
      screen.scrollTop = 0;
    });

    document.querySelectorAll('model-viewer').forEach(model => {
      model.setAttribute('camera-controls', '');
    });

    // pré-carregar vídeos
    videos.forEach(video => video.load());
    controlVideos();

    setTimeout(() => {
      screens[activeIndex]
        .querySelectorAll('.scroll-reveal')
        .forEach(el => el.classList.add('revealed'));
    }, 200);
  }

  init();
});