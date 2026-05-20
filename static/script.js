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
  
  // Observador para scroll reveal
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

  // Observador para skill bars
  const observadorSkill = new IntersectionObserver((entradas, observador) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        const barra = entrada.target;
        barra.style.width = barra.style.width || barra.getAttribute('style').match(/width:\s*(\d+%)/)?.[1] + '%';
        observador.unobserve(barra);
      }
    });
  }, { threshold: 0.5 });

  // Aplica observadores
  DOM.elementosRevelar.forEach(el => observadorRevelar.observe(el));
  DOM.barrasSkill.forEach(barra => observadorSkill.observe(barra));

  // ============================================================
  // 2. LIGHTBOX - Event delegation para melhor performance
  // ============================================================
  
  if (DOM.lightbox && DOM.imagemLightbox && DOM.botaoFechar) {
    // Usa event delegation nas imagens
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

    // Fechar com tecla ESC
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
      
      // Feedback visual imediato
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

        // Barra de progresso
        if (DOM.barraProgresso) {
          DOM.barraProgresso.style.width = percentual + '%';
        }

        // Botão voltar ao topo
        if (DOM.botaoVoltar) {
          DOM.botaoVoltar.classList.toggle('visible', scrollY > 300);
        }

        // Link ativo do menu
        definirLinkAtivo(scrollY);
        
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', atualizarScroll, { passive: true });
  atualizarScroll();

  // Botão voltar ao topo
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
        break; // Sai do loop quando encontra a seção
      }
    }

    DOM.linksMenu.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${secaoAtual}`);
    });
  }

  // Navegação suave com event delegation
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

      // Digitando
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
      // Apagando
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

  // Inicia efeito de digitação
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

  // Observador para animação dos números
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
    // Isso move o scroll para a seção home sem mudar o link na barra
    const secaoHome = document.getElementById('home');
    if (secaoHome) {
      secaoHome.scrollIntoView();
      
      // Isso "limpa" a URL mas mantém o estado interno
      history.replaceState(null, null, ' ');
    }
  }
});
