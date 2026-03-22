document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // CONFIGURAÇÕES INICIAIS E VARIÁVEIS GLOBAIS
  // ==========================================================================
  
  // Desabilita o comportamento padrão do navegador de restaurar a posição de rolagem
  // Isso evita que ao recarregar a página, o scroll volte para onde estava antes
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Seleciona todos os links do menu de navegação
  const navLinks = document.querySelectorAll('nav a');
  
  // Seleciona todas as seções principais do site (Home, Sobre, Serviços, Projetos, Contato)
  const screens = document.querySelectorAll('.screen');
  
  // Barra de progresso que fica no topo da página, indicando em qual seção o usuário está
  const progressBar = document.querySelector('.progress-bar');
  
  // Botão flutuante que aparece quando o usuário não está na primeira seção, para voltar ao topo
  const backToTop = document.getElementById('back-to-top');
  
  // Formulário de contato
  const contactForm = document.querySelector('.contact form');
  
  // Todos os vídeos de fundo das seções
  const videos = document.querySelectorAll('video');

  // Índice da seção atualmente visível (0 = Home, 1 = Sobre, 2 = Serviços, etc.)
  let activeIndex = 0;
  
  // Flag para controlar se uma animação de transição entre seções está em andamento
  // Impede que o usuário faça múltiplas trocas simultâneas
  let isAnimating = false;

  // ==========================================================================
  // RESTAURAÇÃO DO ESTADO APÓS RECARREGAR A PÁGINA (F5)
  // ==========================================================================
  
  // Verifica se existe uma seção salva no sessionStorage (armazenamento temporário da aba)
  // Isso mantém a última seção visitada mesmo após recarregar a página
  const savedScreen = sessionStorage.getItem('activeScreen');
  if (savedScreen !== null) {
    activeIndex = parseInt(savedScreen);
  }

  // Garante que todas as seções comecem com o scroll no topo
  // Isso evita que o conteúdo apareça já rolado para baixo ao trocar de seção
  screens.forEach(screen => screen.scrollTop = 0);

  // ==========================================================================
  // FUNÇÕES DE CONTROLE DAS ANIMAÇÕES DE SCROLL REVEAL
  // ==========================================================================
  
  /**
   * Remove todas as animações de uma seção específica
   * Utilizado quando o usuário sai de uma seção, para que ao voltar,
   * as animações aconteçam novamente como se fosse a primeira vez
   * @param {Element} screen - A seção que terá suas animações resetadas
   */
  function resetScreenReveals(screen) {
    // Seleciona todos os elementos com a classe 'scroll-reveal' dentro da seção
    // Estes são os elementos que aparecem com animação ao rolar a página
    screen.querySelectorAll('.scroll-reveal').forEach(el => {
      // Remove a classe 'revealed' que ativa a animação CSS
      el.classList.remove('revealed');
    });
  }

  /**
   * Ativa as animações dos elementos que estão atualmente visíveis na viewport da seção
   * Utilizado quando o usuário entra em uma seção, para mostrar imediatamente os elementos visíveis
   * @param {Element} screen - A seção que terá suas animações ativadas
   */
  function activateVisibleReveals(screen) {
    screen.querySelectorAll('.scroll-reveal').forEach(el => {
      // Obtém a posição do elemento em relação à viewport
      const rect = el.getBoundingClientRect();
      // Obtém a posição da seção em relação à viewport
      const screenRect = screen.getBoundingClientRect();
      
      // Verifica se o elemento está visível na área visível da seção atual
      // O elemento é considerado visível se:
      // - Seu topo está acima do fundo da seção menos 80px (margem para caber melhor)
      // - E seu fundo está abaixo do topo da seção mais 80px
      if (rect.top < screenRect.bottom - 80 && rect.bottom > screenRect.top + 80) {
        // Adiciona a classe 'revealed' que ativa a animação CSS (fade-in, slide-in, etc.)
        el.classList.add('revealed');
      }
    });
  }

  // ==========================================================================
  // CONFIGURAÇÃO DO OBSERVADOR DE SCROLL PARA ANIMAÇÕES
  // ==========================================================================
  
  // Mapa para armazenar os observadores de cada seção individualmente
  // Cada seção tem seu próprio observer para que possamos controlar quando ele está ativo
  const revealObservers = new Map();

  /**
   * Configura um observador de interseção para uma seção específica
   * Este observador fica monitorando quando os elementos com 'scroll-reveal' entram na viewport
   * @param {Element} screen - A seção que receberá o observador
   */
  function setupRevealObserver(screen) {
    // Cria um novo observador de interseção para esta seção
    const observer = new IntersectionObserver((entries) => {
      // SÓ ativa as animações se esta for a seção atualmente visível
      // Isso evita que elementos de seções ocultas recebam animação enquanto não estão sendo visualizadas
      if (screen.classList.contains('active')) {
        entries.forEach(entry => {
          // Quando um elemento entra na área visível da viewport
          if (entry.isIntersecting) {
            // Adiciona a classe 'revealed' para ativar a animação
            entry.target.classList.add('revealed');
          }
        });
      }
    }, { 
      threshold: 0.15,           // Quando 15% do elemento estiver visível, ativa a animação
      rootMargin: "0px 0px -30px 0px"  // Pequena margem negativa para ativar um pouco antes
    });
    
    // Observa todos os elementos com a classe 'scroll-reveal' dentro desta seção
    screen.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    
    // Armazena o observador no mapa para referência futura
    revealObservers.set(screen, observer);
  }

  // Configura um observador para CADA seção do site
  // Isso é feito no início para que todas as seções estejam prontas para monitorar seus elementos
  screens.forEach(screen => setupRevealObserver(screen));

  // ==========================================================================
  // OBSERVADOR PARA AS BARRAS DE PROGRESSO DAS HABILIDADES (SKILLS)
  // ==========================================================================
  
  // Cria um observador específico para as barras de habilidades
  // Este observador faz as barras "preencherem" quando ficam visíveis na tela
  const skillObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      // Quando a barra de habilidade ficar visível na tela
      if (entry.isIntersecting) {
        const bar = entry.target;
        // Aplica a largura que já estava definida inline (ex: style="width: 95%")
        // Isso faz com que a barra preencha com uma animação CSS suave
        bar.style.width = bar.style.width;
        // Para de observar esta barra após ativar a animação
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.5 }); // Ativa quando 50% do elemento estiver visível

  // Observa todas as barras de progresso (divs dentro de .skill-bar)
  document.querySelectorAll('.skill-bar div').forEach(bar => skillObserver.observe(bar));

  // ==========================================================================
  // FUNÇÃO PRINCIPAL: TROCA ENTRE SEÇÕES
  // ==========================================================================
  
  /**
   * Realiza a transição entre as seções do site
   * @param {number} index - Índice da seção de destino (0 = Home, 1 = Sobre, etc.)
   */
  function goToScreen(index) {
    // Validações para evitar transições inválidas:
    // - Índice fora dos limites
    // - Tentativa de ir para a seção atual
    // - Já está em uma animação
    if (index < 0 || index >= screens.length || index === activeIndex || isAnimating) return;

    // Marca que uma animação está em andamento para evitar múltiplas transições simultâneas
    isAnimating = true;

    // Referências para a seção atual e a próxima seção
    const current = screens[activeIndex];
    const next = screens[index];
    
    // Define a direção da animação baseada no índice (direita para avançar, esquerda para voltar)
    const direction = index > activeIndex ? 'right' : 'left';

    // Reseta o scroll da próxima seção para o topo
    // Isso garante que ao entrar em uma seção, o usuário veja o topo do conteúdo
    next.scrollTop = 0;

    // Remove todas as classes de animação anteriores para evitar conflitos
    screens.forEach(s => s.classList.remove('from-right', 'from-left', 'to-right', 'to-left'));

    // Aplica as classes de animação baseadas na direção da transição
    if (direction === 'right') {
      // Avançando: nova seção entra pela direita, seção atual sai pela esquerda
      next.classList.add('from-right');
      current.classList.add('to-left');
    } else {
      // Voltando: nova seção entra pela esquerda, seção atual sai pela direita
      next.classList.add('from-left');
      current.classList.add('to-right');
    }

    // Força o reflow do navegador para garantir que as classes CSS sejam aplicadas antes da animação
    // Esta técnica é necessária para que a transição CSS funcione corretamente
    void next.offsetWidth;

    // ==================== RESETA AS ANIMAÇÕES ANTES DE SAIR ====================
    // Remove todas as animações ('revealed') dos elementos da seção atual
    // Isso garante que ao voltar para esta seção depois, as animações acontecerão novamente
    resetScreenReveals(current);
    
    // Realiza a troca de classes: remove 'active' da seção atual e adiciona na próxima
    current.classList.remove('active');
    next.classList.add('active');

    // Atualiza o índice da seção ativa
    activeIndex = index;
    
    // Atualiza a interface do usuário (links do menu, barra de progresso, botão de voltar ao topo)
    updateUI();
    
    // Controla qual vídeo de fundo deve estar tocando
    controlVideos();

    // Salva o índice da seção atual no sessionStorage
    // Isso permite que ao recarregar a página, o usuário volte para a mesma seção
    sessionStorage.setItem('activeScreen', index);

    // Aguarda o término da animação CSS (600ms) antes de finalizar a transição
    setTimeout(() => {
      // Ajusta a ordem de empilhamento (z-index) para que a seção ativa fique sobre as demais
      screens.forEach((s, i) => {
        s.style.zIndex = i === activeIndex ? 1 : 0;
        s.classList.remove('to-left', 'to-right');
      });

      // ==================== ATIVA ANIMAÇÕES VISÍVEIS NA NOVA SEÇÃO ====================
      // Após a transição, ativa as animações dos elementos que já estão visíveis
      // Isso garante que o usuário veja imediatamente os elementos no topo da nova seção
      activateVisibleReveals(next);

      // Libera a flag de animação para permitir novas transições
      isAnimating = false;

    }, 600); // Tempo deve corresponder à duração da transição CSS (600ms)
  }

  // ==========================================================================
  // ATUALIZAÇÃO DA INTERFACE DO USUÁRIO
  // ==========================================================================
  
  /**
   * Atualiza elementos visuais baseados na seção ativa:
   * - Links de navegação (destaca o link correspondente)
   * - Barra de progresso no topo
   * - Visibilidade do botão "Voltar ao topo"
   */
  function updateUI() {
    // Atualiza os links de navegação: adiciona a classe 'active-link' apenas no link correspondente à seção atual
    navLinks.forEach((link, i) => {
      link.classList.toggle('active-link', i === activeIndex);
    });

    // Calcula e atualiza a largura da barra de progresso
    // (activeIndex + 1) / screens.length * 100 = porcentagem de progresso
    progressBar.style.width = ((activeIndex + 1) / screens.length * 100) + '%';
    
    // Mostra o botão "Voltar ao topo" apenas quando não estiver na primeira seção (Home)
    backToTop.classList.toggle('visible', activeIndex !== 0);
  }

  // ==========================================================================
  // CONTROLE DOS VÍDEOS DE FUNDO
  // ==========================================================================
  
  /**
   * Controla qual vídeo de fundo deve estar reproduzindo
   * Apenas o vídeo da seção ativa deve tocar; todos os outros devem estar pausados
   * Isso economiza recursos do sistema e evita que múltiplos vídeos toquem simultaneamente
   */
  function controlVideos() {
    // Obtém a seção atualmente visível
    const activeScreen = screens[activeIndex];
    // Encontra o vídeo dentro da seção ativa
    const activeVideo = activeScreen.querySelector('video');

    // Itera sobre todos os vídeos do site
    videos.forEach(video => {
      if (video === activeVideo) {
        // Se for o vídeo da seção ativa:
        // Carrega o vídeo se ainda não estiver pronto e inicia a reprodução
        if (video.readyState < 2) video.load();
        video.play().catch(() => {
          // Captura erros de reprodução automaticamente (ex: política de autoplay do navegador)
          // O erro é ignorado silenciosamente para não quebrar a experiência do usuário
        });
      } else {
        // Se não for o vídeo da seção ativa: pausa a reprodução
        video.pause();
      }
    });
  }

  // ==========================================================================
  // EVENTOS DE NAVEGAÇÃO - CLIQUE NOS LINKS DO MENU
  // ==========================================================================
  
  // Adiciona um evento de clique para cada link do menu de navegação
  navLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Previne o comportamento padrão do link (navegação de âncora)
      goToScreen(idx);    // Navega para a seção correspondente
    });
  });

  // ==========================================================================
  // NAVEGAÇÃO POR SWIPE EM DISPOSITIVOS MÓVEIS
  // ==========================================================================
  
  // Variáveis para armazenar as coordenadas iniciais do toque
  let touchStartX = 0;
  let touchStartY = 0;

  // Evento disparado quando o usuário começa a tocar na tela
  document.addEventListener('touchstart', (e) => {
    // Ignora toques que começam dentro de um model-viewer (modelos 3D interativos)
    // Isso evita conflitos com a navegação 3D dentro desses componentes
    if (e.target.closest('model-viewer')) return;

    // Armazena as coordenadas iniciais do toque
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true }); // passive: true melhora a performance do scroll

  // Evento disparado quando o usuário termina de tocar na tela (remove o dedo)
  document.addEventListener('touchend', (e) => {
    // Ignora toques que terminam dentro de um model-viewer
    if (e.target.closest('model-viewer')) return;

    // Obtém as coordenadas finais do toque
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;

    // Calcula a diferença entre o início e o fim do toque
    const diffX = touchStartX - touchEndX;  // Diferença horizontal
    const diffY = touchStartY - touchEndY;  // Diferença vertical

    // Verifica se foi um swipe horizontal intencional:
    // - Deslocamento horizontal maior que 100px (swipe significativo)
    // - Deslocamento vertical menor que 50px (evita confundir com scroll vertical)
    if (Math.abs(diffX) > 100 && Math.abs(diffY) < 50) {
      // Swipe para a esquerda (diffX > 0) = avançar para próxima seção
      // Swipe para a direita (diffX < 0) = voltar para seção anterior
      goToScreen(activeIndex + (diffX > 0 ? 1 : -1));
    }
  }, { passive: true });

  // ==========================================================================
  // PROCESSAMENTO DO FORMULÁRIO DE CONTATO
  // ==========================================================================
  
  // Verifica se o formulário de contato existe na página
  if (contactForm) {
    // Adiciona um evento de submit para enviar os dados via AJAX (sem recarregar a página)
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Impede o envio tradicional do formulário (que recarregaria a página)
      
      // Coleta os dados do formulário
      const formData = new FormData(contactForm);

      try {
        // Envia os dados para o endpoint do Formspree (serviço de backend para formulários)
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' } // Indica que esperamos uma resposta JSON
        });

        // Substitui o conteúdo do formulário por uma mensagem de sucesso ou erro
        contactForm.innerHTML = res.ok
          ? '<p style="background:#2c6e2c;padding:1rem;border-radius:8px;">✅ Mensagem enviada!</p>'
          : '<p style="background:#a12;padding:1rem;border-radius:8px;">❌ Erro ao enviar.</p>';

      } catch {
        // Caso ocorra algum erro na requisição (ex: falta de internet)
        contactForm.innerHTML = '<p style="background:#a12;padding:1rem;border-radius:8px;">❌ Erro ao enviar.</p>';
      }
    });
  }

  // ==========================================================================
  // LIGHTBOX PARA VISUALIZAÇÃO DE IMAGENS (GALERIA)
  // ==========================================================================
  
  // Seleciona os elementos do lightbox (modal para ampliar imagens)
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox .close");

  // Verifica se todos os elementos do lightbox existem na página
  if (lightbox && lightboxImg && closeBtn) {
    // Adiciona evento de clique em todas as imagens das galerias de projetos
    document.querySelectorAll(".project-images img").forEach(img => {
      img.addEventListener("click", () => {
        // Abre o lightbox e exibe a imagem clicada ampliada
        lightbox.classList.add("active");
        lightboxImg.src = img.src; // Define a fonte da imagem ampliada
      });
    });

    // Fecha o lightbox quando o usuário clica no botão de fechar (X)
    closeBtn.addEventListener("click", () => {
      lightbox.classList.remove("active");
    });

    // Fecha o lightbox quando o usuário clica fora da imagem (no fundo escuro)
    lightbox.addEventListener("click", (e) => {
      // Se o clique não foi diretamente na imagem (foi no fundo do modal)
      if (e.target !== lightboxImg) {
        lightbox.classList.remove("active");
      }
    });
  }

  // ==========================================================================
  // BOTÃO "VOLTAR AO TOPO"
  // ==========================================================================
  
  // Adiciona evento de clique ao botão de voltar ao topo
  // Quando clicado, navega para a primeira seção (Home, índice 0)
  backToTop.addEventListener('click', () => goToScreen(0));

  // ==========================================================================
  // INICIALIZAÇÃO DO SITE
  // ==========================================================================
  
  /**
   * Função executada no carregamento inicial da página
   * Configura o estado inicial de todas as seções e componentes
   */
  function init() {
    // Atualiza a interface (links, barra de progresso, botão topo)
    updateUI();

    // Configura o estado inicial de todas as seções:
    // - Define o z-index (ordem de empilhamento)
    // - Define qual seção está ativa
    // - Garante que o scroll comece no topo
    screens.forEach((screen, i) => {
      screen.style.zIndex = i === activeIndex ? 1 : 0;  // Seção ativa fica sobre as demais
      screen.classList.toggle('active', i === activeIndex); // Marca a seção ativa
      screen.scrollTop = 0;  // Scroll no topo
    });

    // Configura todos os modelos 3D (model-viewer) para permitir controle de câmera
    // Isso garante que o usuário possa interagir com os modelos 3D arrastando e girando
    document.querySelectorAll('model-viewer').forEach(model => {
      model.setAttribute('camera-controls', '');
    });

    // Carrega e inicia a reprodução dos vídeos de fundo
    videos.forEach(video => video.load());
    controlVideos(); // Apenas o vídeo da seção ativa será reproduzido

    // Pequeno atraso para garantir que o DOM esteja completamente renderizado
    setTimeout(() => {
      // Ativa as animações dos elementos que já estão visíveis na seção ativa
      // Isso faz com que os elementos do topo apareçam imediatamente com animação
      activateVisibleReveals(screens[activeIndex]);
    }, 200); // 200ms é tempo suficiente para garantir o render inicial
  }

  // Inicia o site!
  init();
});
