document.addEventListener('DOMContentLoaded', () => {
  // ==================== SCROLL REVEAL (ANIMAÇÕES) ====================
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });
  
  revealElements.forEach(el => revealObserver.observe(el));
  
  // ==================== BARRAS DE HABILIDADE ====================
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
  
  // ==================== LIGHTBOX ====================
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
      if (e.target !== lightboxImg) lightbox.classList.remove("active");
    });
  }
  
  // ==================== FORMULÁRIO ====================
  const contactForm = document.querySelector('.contact form');
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
  
  // ==================== BOTÃO BACK TO TOP ====================
  const backToTop = document.getElementById('back-to-top');
  const progressBar = document.querySelector('.progress-bar');
  
  function updateBackToTopAndProgress() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
    if (progressBar) progressBar.style.width = percent + '%';
    
    if (backToTop) {
      if (scrollY > 300) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }
  }
  
  window.addEventListener('scroll', updateBackToTopAndProgress);
  updateBackToTopAndProgress();
  
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // ==================== NAVEGAÇÃO SUAVE (links do menu) ====================
  document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // ==================== ATIVA LINK ATIVO NO SCROLL ====================
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('nav a');
  
  function setActiveLink() {
    let current = '';
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active-link');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active-link');
      }
    });
  }
  
  window.addEventListener('scroll', setActiveLink);
  setActiveLink();
  
  // ==================== MODEL-VIEWER: garantir camera-controls ====================
  document.querySelectorAll('model-viewer').forEach(model => {
    if (!model.hasAttribute('camera-controls')) model.setAttribute('camera-controls', '');
  });
  
  // ==================== PEQUENO ATRASO PARA GARANTIR REVEAL INICIAL ====================
  setTimeout(() => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) el.classList.add('revealed');
    });
  }, 200);
  
  // ==================== EFEITO DE DIGITAÇÃO ALEATÓRIA ====================
  class TypewriterEffect {
    constructor(element, words, options = {}) {
      this.element = element;
      this.words = words;
      this.currentWordIndex = 0;
      this.currentCharIndex = 0;
      this.isDeleting = false;
      this.isWaiting = false;
      this.options = {
        typeSpeed: 100,
        deleteSpeed: 50,
        delayBetweenWords: 2000,
        randomDelay: true,
        minRandomDelay: 3000,
        maxRandomDelay: 8000,
        ...options
      };
    }

    async wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async type() {
      if (!this.element) return;

      const currentWord = this.words[this.currentWordIndex];
      
      if (!this.isDeleting && !this.isWaiting) {
        // Digitando
        if (this.currentCharIndex <= currentWord.length) {
          this.element.textContent = currentWord.substring(0, this.currentCharIndex);
          this.currentCharIndex++;
          
          let speed = this.options.typeSpeed;
          if (this.options.randomDelay) {
            speed += Math.random() * 50;
          }
          
          setTimeout(() => this.type(), speed);
        } else {
          // Palavra completa, espera antes de apagar
          this.isWaiting = true;
          let waitTime = this.options.delayBetweenWords;
          
          if (this.options.randomDelay) {
            waitTime = this.options.minRandomDelay + 
                      Math.random() * (this.options.maxRandomDelay - this.options.minRandomDelay);
          }
          
          setTimeout(() => {
            this.isWaiting = false;
            this.isDeleting = true;
            this.type();
          }, waitTime);
        }
      } else if (this.isDeleting && !this.isWaiting) {
        // Apagando
        if (this.currentCharIndex > 0) {
          this.element.textContent = currentWord.substring(0, this.currentCharIndex - 1);
          this.currentCharIndex--;
          
          let speed = this.options.deleteSpeed;
          if (this.options.randomDelay) {
            speed += Math.random() * 30;
          }
          
          setTimeout(() => this.type(), speed);
        } else {
          // Palavra completamente apagada, vai para próxima
          this.isDeleting = false;
          this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
          setTimeout(() => this.type(), 300);
        }
      }
    }

    start() {
      this.type();
    }
  }

  // Inicializar o efeito de digitação
  setTimeout(() => {
    const titleElement = document.getElementById('typing-title');
    if (titleElement) {
      const words = ['Régis Farias', 'Engenheiro Civil', 'Projetos e Consultoria', 'Engenharia com excelência e inovação', '"Projetos seguros, econômicos e totalmente executáveis, sempre focados na melhor solução para o cliente"', 'Projeto que una segurança, economia e desempenho estrutural', 'Acompanhamento de Obra', 'Laudo Técnico'];
      
      const typewriter = new TypewriterEffect(titleElement, words, {
        typeSpeed: 15,
        deleteSpeed: 25,
        delayBetweenWords: 10000,
        randomDelay: true,
        minRandomDelay: 4000,
        maxRandomDelay: 15000
      });
      
      typewriter.start();
    }
  }, 100);
  // Contador animado para as estatísticas
  function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
      const targetText = stat.innerText;
      const isYear = targetText.includes('anos');
      const isProjects = targetText.includes('Projetos');
      let targetValue = 0;
      
      if (isYear) targetValue = 5;
      else if (isProjects) targetValue = 50;
      else targetValue = 100;
      
      let currentValue = 0;
      const duration = 2000;
      const increment = targetValue / (duration / 16);
      
      const counter = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          clearInterval(counter);
          currentValue = targetValue;
        }
        if (isYear) stat.innerText = Math.floor(currentValue) + '+ anos';
        else if (isProjects) stat.innerText = Math.floor(currentValue) + '+ projetos';
        else stat.innerText = Math.floor(currentValue) + '%';
      }, 16);
    });
  }

  // Disparar quando a seção de estatísticas aparecer
  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumbers();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(statsSection);
  }
});
