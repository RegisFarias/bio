// ============================================================
// CÓDIGO PRINCIPAL OTIMIZADO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  
  // Cache de elementos DOM frequentemente usados
  const DOM = {
    elementosRevelar: document.querySelectorAll('.scroll-reveal'),
    barrasSkill: document.querySelectorAll('.skill-bar div'),
    lightbox: document.getElementById('lightbox'),
    imagemLightbox: document.getElementById('lightbox-img'),
    botaoFechar: document.querySelector('.lightbox .close'),
    imagensProjeto: document.querySelectorAll('.project-images img'),
    formularioContato: document.querySelector('.contact form'),
    botaoVoltar: document.getElementById('back-to-top'),
    barraProgresso: document.querySelector('.progress-bar'),
    linksMenu: document.querySelectorAll('nav a'),
    secoes: document.querySelectorAll('.section'),
    tituloDigitacao: document.getElementById('typing-title'),
    secaoStats: document.querySelector('.stats'),
    numerosEstatisticas: document.querySelectorAll('.stat-number'),
    modelsViewer: document.querySelectorAll('model-viewer')
  };

  // ============================================================
  // 1. OBSERVADORES UNIFICADOS
  // ============================================================
  
  const observadorRevelar = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('revealed');
      }
    });
  }, { 
    threshold: 0.15,
    rootMargin: '0px 0px -30px 0px'
  });

  const observadorSkill = new IntersectionObserver((entradas, observador) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        const barra = entrada.target;
        barra.style.width = barra.style.width || barra.getAttribute('style').match(/width:\s*(\d+%)/)?.[1] + '%';
        observador.unobserve(barra);
      }
    });
  }, { threshold: 0.5 });

  DOM.elementosRevelar.forEach(el => observadorRevelar.observe(el));
  DOM.barrasSkill.forEach(barra => observadorSkill.observe(barra));

  // ============================================================
  // 2. LIGHTBOX - Event delegation para melhor performance
  // ============================================================
  
  if (DOM.lightbox && DOM.imagemLightbox && DOM.botaoFechar) {
    document.querySelector('.projects-list')?.addEventListener('click', (e) => {
      const img = e.target.closest('.project-images img');
      if (img) {
        DOM.lightbox.classList.add('active');
        DOM.imagemLightbox.src = img.src;
      }
    });

    const fecharLightbox = () => DOM.lightbox.classList.remove('active');
    DOM.botaoFechar.addEventListener('click', fecharLightbox);
    
    DOM.lightbox.addEventListener('click', (e) => {
      if (e.target !== DOM.imagemLightbox) fecharLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.lightbox.classList.contains('active')) {
        fecharLightbox();
      }
    });
  }

  // ============================================================
  // 3. FORMULÁRIO DE CONTATO
  // ============================================================
  
  if (DOM.formularioContato) {
    DOM.formularioContato.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const dadosForm = new FormData(DOM.formularioContato);
      const btnSubmit = DOM.formularioContato.querySelector('button[type="submit"]');
      
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Enviando...';
      }

      try {
        const resposta = await fetch(DOM.formularioContato.action, {
          method: 'POST',
          body: dadosForm,
          headers: { 'Accept': 'application/json' }
        });

        const mensagem = resposta.ok 
          ? '<p style="background:#2c6e2c;padding:1rem;border-radius:8px;font-family:\'Cormorant Garamond\',serif;font-size:1.3rem;">✅ Mensagem enviada com sucesso! Entrarei em contato em breve.</p>'
          : '<p style="background:#a12;padding:1rem;border-radius:8px;">❌ Erro ao enviar. Tente novamente.</p>';
        
        DOM.formularioContato.innerHTML = mensagem;
      } catch {
        DOM.formularioContato.innerHTML = '<p style="background:#a12;padding:1rem;border-radius:8px;">❌ Erro de conexão. Verifique sua internet.</p>';
      }
    });
  }

  // ============================================================
  // 4. SCROLL - Funções otimizadas com requestAnimationFrame
  // ============================================================
  
  let ticking = false;
  
  function atualizarScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
        const percentual = alturaTotal > 0 ? (scrollY / alturaTotal) * 100 : 0;

        if (DOM.barraProgresso) {
          DOM.barraProgresso.style.width = percentual + '%';
        }

        if (DOM.botaoVoltar) {
          DOM.botaoVoltar.classList.toggle('visible', scrollY > 300);
        }

        definirLinkAtivo(scrollY);
        
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', atualizarScroll, { passive: true });
  atualizarScroll();

  if (DOM.botaoVoltar) {
    DOM.botaoVoltar.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // 5. NAVEGAÇÃO SUAVE E LINK ATIVO
  // ============================================================
  
  function definirLinkAtivo(scrollY) {
    const posicaoScroll = scrollY + 150;
    let secaoAtual = '';

    for (const section of DOM.secoes) {
      const topo = section.offsetTop;
      const base = topo + section.offsetHeight;
      
      if (posicaoScroll >= topo && posicaoScroll < base) {
        secaoAtual = section.getAttribute('id');
        break;
      }
    }

    DOM.linksMenu.forEach(link => {
      const href = link.getAttribute('href');
      
      if (secaoAtual === 'home' || (scrollY < 100 && href === '#home')) {
        link.classList.add('active-link');
      } else {
        link.classList.toggle('active-link', href === `#${secaoAtual}`);
      }
    });
  }

  document.querySelector('nav')?.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const idAlvo = link.getAttribute('href').substring(1);
      const elementoAlvo = document.getElementById(idAlvo);
      
      if (elementoAlvo) {
        elementoAlvo.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // ============================================================
  // 6. MODEL-VIEWER
  // ============================================================
  
  DOM.modelsViewer.forEach(model => {
    if (!model.hasAttribute('camera-controls')) {
      model.setAttribute('camera-controls', '');
    }
  });

  // ============================================================
  // 7. REVELA ELEMENTOS JÁ VISÍVEIS NO CARREGAMENTO
  // ============================================================
  
  requestAnimationFrame(() => {
    DOM.elementosRevelar.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('revealed');
      }
    });
  });

  // ============================================================
  // 8. EFEITO DE DIGITAÇÃO OTIMIZADO
  // ============================================================
  
  class EfeitoDigitacao {
    constructor(elemento, palavras, opcoes = {}) {
      this.elemento = elemento;
      this.palavras = palavras;
      this.indicePalavra = 0;
      this.indiceChar = 0;
      this.apagando = false;
      this.aguardando = false;
      this.timeout = null;

      this.opcoes = {
        velocidadeDigitacao: 100,
        velocidadeApagar: 50,
        atrasoEntrePalavras: 2000,
        atrasoAleatorio: true,
        minAtrasoAleatorio: 3000,
        maxAtrasoAleatorio: 8000,
        ...opcoes
      };
    }

    parar() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
    }

    async digitar() {
      if (!this.elemento) return;

      const palavraAtual = this.palavras[this.indicePalavra];

      if (!this.apagando && !this.aguardando) {
        if (this.indiceChar <= palavraAtual.length) {
          this.elemento.textContent = palavraAtual.substring(0, this.indiceChar);
          this.indiceChar++;

          let velocidade = this.opcoes.velocidadeDigitacao;
          if (this.opcoes.atrasoAleatorio) {
            velocidade += Math.random() * 50;
          }

          this.timeout = setTimeout(() => this.digitar(), velocidade);
        } else {
          this.aguardando = true;
          let tempoEspera = this.opcoes.atrasoEntrePalavras;

          if (this.opcoes.atrasoAleatorio) {
            tempoEspera = this.opcoes.minAtrasoAleatorio + 
                          Math.random() * (this.opcoes.maxAtrasoAleatorio - this.opcoes.minAtrasoAleatorio);
          }

          this.timeout = setTimeout(() => {
            this.aguardando = false;
            this.apagando = true;
            this.digitar();
          }, tempoEspera);
        }
      } 
      else if (this.apagando && !this.aguardando) {
        if (this.indiceChar > 0) {
          this.elemento.textContent = palavraAtual.substring(0, this.indiceChar - 1);
          this.indiceChar--;

          let velocidade = this.opcoes.velocidadeApagar;
          if (this.opcoes.atrasoAleatorio) {
            velocidade += Math.random() * 30;
          }

          this.timeout = setTimeout(() => this.digitar(), velocidade);
        } else {
          this.apagando = false;
          this.indicePalavra = (this.indicePalavra + 1) % this.palavras.length;
          this.timeout = setTimeout(() => this.digitar(), 300);
        }
      }
    }

    iniciar() {
      this.parar();
      this.digitar();
    }
  }

  if (DOM.tituloDigitacao) {
    const palavras = [
      'Régis Farias',
      'Engenheiro Civil',
      'Projetos e Consultoria',
      'Engenharia com excelência e inovação',
      '"Projetos seguros, econômicos e totalmente executáveis"',
      'Projeto que una segurança, economia e desempenho estrutural',
      'Acompanhamento de Obra',
      'Laudo Técnico'
    ];

    const efeito = new EfeitoDigitacao(DOM.tituloDigitacao, palavras, {
      velocidadeDigitacao: 15,
      velocidadeApagar: 25,
      atrasoEntrePalavras: 10000,
      atrasoAleatorio: true,
      minAtrasoAleatorio: 4000,
      maxAtrasoAleatorio: 15000
    });

    efeito.iniciar();
  }

  // ============================================================
  // 9. CONTADOR ANIMADO OTIMIZADO
  // ============================================================
  
  function animarNumeros() {
    if (!DOM.numerosEstatisticas.length) return;

    DOM.numerosEstatisticas.forEach(stat => {
      const textoOriginal = stat.innerText;
      let valorFinal = 0;
      let sufixo = '';

      if (textoOriginal.includes('anos')) {
        valorFinal = 5;
        sufixo = '+ anos';
      } else if (textoOriginal.includes('Projetos')) {
        valorFinal = 50;
        sufixo = '+ projetos';
      } else {
        valorFinal = 100;
        sufixo = '%';
      }

      const duracao = 2000;
      const inicio = performance.now();
      
      function atualizarContador(timestamp) {
        const decorrido = timestamp - inicio;
        const progresso = Math.min(decorrido / duracao, 1);
        const valorAtual = Math.floor(progresso * valorFinal);

        stat.innerText = valorAtual + sufixo;

        if (progresso < 1) {
          requestAnimationFrame(atualizarContador);
        }
      }

      requestAnimationFrame(atualizarContador);
    });
  }

  if (DOM.secaoStats) {
    const observadorStats = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          animarNumeros();
          observadorStats.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.5 });

    observadorStats.observe(DOM.secaoStats);
  }

  // ============================================================
  // 10. REDIRECIONA PARA HOME SEM EXIBIR NA URL
  // ============================================================
  if (window.location.hash === '' || window.location.hash === '#cartao') {
    const secaoHome = document.getElementById('home');
    if (secaoHome) {
      secaoHome.scrollIntoView();
      history.replaceState(null, null, ' ');
    }
  }

  // ============================================================
  // 11. CARROSSEL DE REVIEWS (Google Style)
  // ============================================================
  
  (function initReviewsCarousel() {
    const track = document.getElementById('rvTrack');
    if (!track) return;

    const IMG_PATH = 'static/Fotos_Perfis/';

    const reviews = [
      { img: 'Luana Melo.png', name: 'Luana Melo', count: '2 avaliações', stars: 5, text: 'Trabalho de excelência, super indico.', reply: { name: 'Eng. Estrutural Régis Farias (proprietário)', text: 'Obrigado Luana!' } },
      { img: 'Rafael hulk (Hulk).png', name: 'Rafael hulk (Hulk)', count: '1 avaliação', stars: 5, text: 'Excelente profissional 👏' },
      { img: 'Thiago Ferreira.png', name: 'Thiago Ferreira', count: '1 avaliação', stars: 5, text: 'Excelente profissional, sempre fazendo um ótimo trabalho.' },
      { img: 'Pietro Roberto Oficial - BJJ.png', name: 'Pietro Roberto Oficial - BJJ', count: '2 avaliações', stars: 5, text: 'Excelente trabalho e Excelente profissional, eu Indico' },
      { img: 'Esther Pereira.png', name: 'Esther Pereira', count: '4 avaliações', stars: 5, text: 'Excelente profissional, Super indico...' },
      { img: 'bruno sanches.png', name: 'bruno sanches', count: '6 avaliações', stars: 5, text: 'Excelente profissional! Altamente capacitado!', reaction: '❤️ 1' },
      { img: 'jordan michael.png', name: 'jordan michael', count: '1 avaliação', stars: 5, text: 'Ótimo atendimento e qualidade de serviço', reaction: '🙏 1' },
      { img: 'Vinicius Lima.png', name: 'Vinicius Lima', count: '1 avaliação', stars: 5, text: 'Muito bom, eu indico', reaction: '❤️ 1' },
      { img: 'Victor Hugo.png', name: 'Victor Hugo', count: '1 avaliação', stars: 5, text: 'Excelente profissional', reaction: '❤️ 1' },
      { img: 'Junior Flôr.png', name: 'Junior Flôr', count: '1 avaliação', stars: 5, text: 'melhor que conheço! nota 💯' },
      { img: 'BRUNO TEIXEIRA FARIAS.png', name: 'BRUNO TEIXEIRA FARIAS', count: '', stars: 5, text: '' },
      { img: 'Dido Zulu.png', name: 'Dido Zulu', count: '', stars: 5, text: '' },
      { img: 'Alice Cavalcante.png', name: 'Alice Cavalcante', count: '', stars: 5, text: '' },
      { img: 'Caio Kyorogg.png', name: 'Caio Kyorogg', count: '', stars: 5, text: '', reply: { name: 'Eng. Estrutural Régis Farias (proprietário)', text: 'grato pela confiança' } },
      { img: 'Tiago Souza.png', name: 'Tiago Souza', count: '1 avaliação', stars: 5, text: '' },
      { img: 'Jonas Ramos.png', name: 'Jonas Ramos', count: '', stars: 5, text: '' },
      { img: 'Jefferson Miranda.png', name: 'Jefferson Miranda', count: '2 avaliações', stars: 5, text: '' }
    ];

    const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z';

    function starsHTML(rating) {
      let out = '';
      for (let i = 0; i < 5; i++) {
        out += `<svg class="rv-star${i < rating ? '' : ' empty'}" viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>`;
      }
      return out;
    }

    const SHARE_ICON = `
      <svg class="rv-share-icon" viewBox="0 0 24 24">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.13 9.81C6.59 9.3 5.88 9 5.1 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.78 0 1.49-.3 2.03-.81l7.06 4.12c-.05.22-.09.45-.09.69 0 1.61 1.31 2.91 2.91 2.91s2.91-1.3 2.91-2.91c0-1.61-1.3-2.91-2.91-2.91z"/>
      </svg>`;

    function initials(name) {
      return name.trim().split(/\s+/).slice(0, 2)
        .map(w => w[0]).join('').toUpperCase();
    }

    const SHARE_URL = 'https://www.google.com/search?q=Eng.+Estrutural+R%C3%A9gis+Farias';

    function cardHTML(r) {
      const ini = initials(r.name);
      const src = `${IMG_PATH}${encodeURIComponent(r.img)}`;
      return `
      <div class="rv-card">
          <div class="rv-user-header">
              <img class="rv-avatar" src="${src}" alt="${r.name}" loading="lazy"
                  onerror="this.onerror=null;this.src='https://placehold.co/80x80/222222/ffffff?text=${ini}'">
              <div class="rv-user-info">
                  <div class="rv-user-name">${r.name}</div>
                  ${r.count ? `<div class="rv-user-count">${r.count}</div>` : ''}
              </div>
          </div>
          <div class="rv-rating-row">
              <div class="rv-stars">${starsHTML(r.stars)}</div>
          </div>
          ${r.text ? `<div class="rv-text">${r.text}</div>` : '<div class="rv-text" style="flex-grow:1;"></div>'}
          ${r.reaction ? `<div class="rv-reaction">${r.reaction}</div>` : ''}
          ${r.reply ? `
          <div class="rv-reply">
              <div class="rv-reply-header"><span class="rv-reply-name">${r.reply.name}</span></div>
              <div class="rv-reply-text">${r.reply.text}</div>
          </div>` : ''}
          <div class="rv-action-bar">
              <a class="rv-action-btn" href="${SHARE_URL}" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar">
                  ${SHARE_ICON}
              </a>
          </div>
      </div>`;
    }

    const html = reviews.map(cardHTML).join('');
    track.innerHTML = html + html;

    track.addEventListener('click', (e) => {
      const card = e.target.closest('.rv-card');
      if (!card) return;
      if (e.target.closest('.rv-action-btn')) return;

      track.querySelectorAll('.rv-card.selected').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });

    const prevBtn = document.getElementById('rvPrevBtn');
    const nextBtn = document.getElementById('rvNextBtn');

    function step() {
      const card = track.querySelector('.rv-card');
      if (!card) return 360;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.gap) || 22;
      return card.offsetWidth + gap;
    }

    let manualOffset = 0;

    function nudge(direction) {
      track.classList.add('paused');
      const halfWidth = track.scrollWidth / 2;
      manualOffset += direction * step();
      manualOffset = ((manualOffset % halfWidth) + halfWidth) % halfWidth;
      track.style.animation = 'none';
      track.style.transform = `translateX(${-manualOffset}px)`;
    }

    let resumeTimer;
    function scheduleResume() {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        track.classList.remove('paused');
        track.style.animation = '';
        track.style.transform = '';
      }, 1200);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { nudge(1); scheduleResume(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nudge(-1); scheduleResume(); });

    const wrap = document.querySelector('.rv-carousel-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => track.classList.add('paused'));
      wrap.addEventListener('mouseleave', () => track.classList.remove('paused'));
    }
  })();

  // ============================================================
  // 12. LUZ QUE SEGUE O CURSOR NA HOME (plano cartesiano)
  // ============================================================
  (function initLuzCursorHome() {
    const home = document.getElementById('home');
    if (!home) return;

    // Só ativa em dispositivos com mouse (evita custo em touch puro)
    const temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!temMouse) return;

    let rafId = null;
    let pendingEvent = null;

    function aplicarLuz() {
      rafId = null;
      if (!pendingEvent) return;

      const rect = home.getBoundingClientRect();
      const x = ((pendingEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((pendingEvent.clientY - rect.top) / rect.height) * 100;

      home.style.setProperty('--mx', x + '%');
      home.style.setProperty('--my', y + '%');
    }

    home.addEventListener('mousemove', (e) => {
      pendingEvent = e;
      if (rafId === null) {
        rafId = requestAnimationFrame(aplicarLuz);
      }
    });

    // Ao sair da home, a luz volta suavemente para o topo central
    home.addEventListener('mouseleave', () => {
      home.style.setProperty('--mx', '50%');
      home.style.setProperty('--my', '15%');
    });
  })();

  // ============================================================
  // 13. TILT DO CARTÃO COM O CURSOR (Home)
  //     Só rotateY — evita flip vertical da face de trás
  // ============================================================
  (function initCardTilt() {
    const wrapper = document.querySelector('.card-3d-wrapper');
    if (!wrapper) return;

    const temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!temMouse) return;

    let rafId = null;
    let ultimoEvento = null;

    function aplicarTilt() {
      rafId = null;
      if (!ultimoEvento) return;

      const rect = wrapper.getBoundingClientRect();
      const x = (ultimoEvento.clientX - rect.left) / rect.width - 0.5;
      const y = (ultimoEvento.clientY - rect.top) / rect.height - 0.5;
      // Máx ±14° apenas no eixo Y (horizontal)
      wrapper.style.transform = `rotate3d(${y}, ${x}, 0, ${Math.hypot(x, y) * 10}deg)`;
    }

    wrapper.addEventListener('mousemove', (e) => {
      ultimoEvento = e;
      if (rafId === null) {
        rafId = requestAnimationFrame(aplicarTilt);
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.transform = '';
    });
  })();
});
