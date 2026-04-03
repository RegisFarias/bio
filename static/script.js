// ============================================================
// CÓDIGO PRINCIPAL - EXECUTA QUANDO TODO O HTML ESTIVER CARREGADO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // 1. ANIMAÇÃO DE ELEMENTOS QUE APARECEM AO ROLAR A PÁGINA (SCROLL REVEAL)
  // -----------------------------------------------------------------
  // Seleciona todos os elementos que têm a classe 'scroll-reveal'
  const elementosRevelar = document.querySelectorAll('.scroll-reveal');

  // Cria um observador que fica monitorando quando esses elementos entram na tela
  const observadorRevelar = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      // Se o elemento está visível na tela
      if (entrada.isIntersecting) {
        // Adiciona a classe 'revealed', que faz a animação de aparecer
        entrada.target.classList.add('revealed');
      }
    });
  }, { 
    threshold: 0.15,        // 15% do elemento precisa estar visível para disparar
    rootMargin: "0px 0px -30px 0px"  // Pequeno ajuste na margem
  });

  // Começa a observar cada elemento encontrado
  elementosRevelar.forEach(el => observadorRevelar.observe(el));


  // 2. BARRAS DE HABILIDADE (SKILL BARS) QUE PREENCHEM QUANDO APARECEM
  // -----------------------------------------------------------------
  // Observador específico para as barras de habilidade
  const observadorSkill = new IntersectionObserver((entradas, observador) => {
    entradas.forEach(entrada => {
      // Se a barra ficar visível
      if (entrada.isIntersecting) {
        const barra = entrada.target;
        // Força a largura que já estava definida no CSS (ex: style="width: 80%")
        barra.style.width = barra.style.width;
        // Para de observar esta barra (só precisa animar uma vez)
        observador.unobserve(barra);
      }
    });
  }, { threshold: 0.5 }); // 50% da barra visível

  // Seleciona todas as barras (div dentro de .skill-bar) e começa a observar
  document.querySelectorAll('.skill-bar div').forEach(barra => observadorSkill.observe(barra));


  // 3. LIGHTBOX (AMPLIAR IMAGENS DOS PROJETOS)
  // -----------------------------------------------------------------
  const lightbox = document.getElementById("lightbox");
  const imagemLightbox = document.getElementById("lightbox-img");
  const botaoFechar = document.querySelector(".lightbox .close");

  // Só executa se os elementos do lightbox existirem na página
  if (lightbox && imagemLightbox && botaoFechar) {
    // Para cada imagem dentro de .project-images
    document.querySelectorAll(".project-images img").forEach(img => {
      img.addEventListener("click", () => {
        // Mostra o lightbox e coloca a imagem clicada dentro dele
        lightbox.classList.add("active");
        imagemLightbox.src = img.src;
      });
    });

    // Fechar ao clicar no X
    botaoFechar.addEventListener("click", () => {
      lightbox.classList.remove("active");
    });

    // Fechar ao clicar fora da imagem (no fundo escuro)
    lightbox.addEventListener("click", (e) => {
      if (e.target !== imagemLightbox) {
        lightbox.classList.remove("active");
      }
    });
  }


  // 4. ENVIO DO FORMULÁRIO DE CONTATO (SEM RECARREGAR A PÁGINA)
  // -----------------------------------------------------------------
  const formularioContato = document.querySelector('.contact form');
  if (formularioContato) {
    formularioContato.addEventListener('submit', async (e) => {
      e.preventDefault(); // Impede o recarregamento da página

      // Pega todos os dados do formulário (nome, email, mensagem...)
      const dadosForm = new FormData(formularioContato);

      try {
        // Envia os dados para o endereço definido no action do formulário
        const resposta = await fetch(formularioContato.action, {
          method: 'POST',
          body: dadosForm,
          headers: { 'Accept': 'application/json' }
        });

        // Substitui o conteúdo do formulário pela mensagem de sucesso ou erro
        if (resposta.ok) {
          formularioContato.innerHTML = '<p style="background:#2c6e2c;padding:1rem;border-radius:8px;">✅ Mensagem enviada!</p>';
        } else {
          formularioContato.innerHTML = '<p style="background:#a12;padding:1rem;border-radius:8px;">❌ Erro ao enviar.</p>';
        }
      } catch {
        // Se houve algum problema de rede ou servidor
        formularioContato.innerHTML = '<p style="background:#a12;padding:1rem;border-radius:8px;">❌ Erro ao enviar.</p>';
      }
    });
  }


  // 5. BOTÃO "VOLTAR AO TOPO" E BARRA DE PROGRESSO DE ROLAGEM
  // -----------------------------------------------------------------
  const botaoVoltar = document.getElementById('back-to-top');
  const barraProgresso = document.querySelector('.progress-bar');

  // Função que atualiza a barra de progresso e mostra/esconde o botão
  function atualizarVoltarTopoEProgresso() {
    const scrollY = window.scrollY;                 // Quantos pixels já rolou do topo
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight; // Total possível de rolar
    const percentual = alturaTotal > 0 ? (scrollY / alturaTotal) * 100 : 0;

    if (barraProgresso) barraProgresso.style.width = percentual + '%';

    if (botaoVoltar) {
      if (scrollY > 300) {
        botaoVoltar.classList.add('visible');   // Mostra o botão
      } else {
        botaoVoltar.classList.remove('visible'); // Esconde o botão
      }
    }
  }

  // Atualiza sempre que o usuário rolar a página
  window.addEventListener('scroll', atualizarVoltarTopoEProgresso);
  // E também chama uma vez para definir o estado inicial
  atualizarVoltarTopoEProgresso();

  // Quando clicar no botão, rola suavemente para o topo
  if (botaoVoltar) {
    botaoVoltar.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // 6. NAVEGAÇÃO SUAVE (CLICAR NO MENU E ROLAR ATÉ A SEÇÃO)
  // -----------------------------------------------------------------
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Evita o comportamento padrão do link (#)

      // Pega o id da seção (ex: "#sobre" vira "sobre")
      const idAlvo = this.getAttribute('href').substring(1);
      const elementoAlvo = document.getElementById(idAlvo);

      if (elementoAlvo) {
        // Rola suavemente até a seção
        elementoAlvo.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // 7. DESTACAR O LINK DO MENU CORRESPONDENTE À SEÇÃO VISÍVEL
  // -----------------------------------------------------------------
  const secoes = document.querySelectorAll('.section');
  const linksMenu = document.querySelectorAll('nav a');

  function definirLinkAtivo() {
    let secaoAtual = '';
    const posicaoScroll = window.scrollY + 150; // margem para detectar a seção

    secoes.forEach(section => {
      const topo = section.offsetTop;
      const base = topo + section.offsetHeight;
      if (posicaoScroll >= topo && posicaoScroll < base) {
        secaoAtual = section.getAttribute('id');
      }
    });

    linksMenu.forEach(link => {
      link.classList.remove('active-link');
      if (link.getAttribute('href') === `#${secaoAtual}`) {
        link.classList.add('active-link');
      }
    });
  }

  window.addEventListener('scroll', definirLinkAtivo);
  definirLinkAtivo(); // Executa uma vez ao carregar


  // 8. GARANTIR QUE O MODEL-VIEWER TENHA CONTROLE DE CÂMERA
  // -----------------------------------------------------------------
  document.querySelectorAll('model-viewer').forEach(model => {
    if (!model.hasAttribute('camera-controls')) {
      model.setAttribute('camera-controls', '');
    }
  });


  // 9. PEQUENO ATRASO PARA GARANTIR QUE ELEMENTOS OCULTOS APAREÇAM
  // -----------------------------------------------------------------
  setTimeout(() => {
    elementosRevelar.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Se o elemento já estiver visível no carregamento, revela imediatamente
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('revealed');
      }
    });
  }, 200);


  // 10. EFEITO DE DIGITAÇÃO (TYPING) NO TÍTULO PRINCIPAL
  // -----------------------------------------------------------------
  // Classe que controla o efeito de escrever e apagar palavras
  class EfeitoDigitacao {
    constructor(elemento, palavras, opcoes = {}) {
      this.elemento = elemento;      // Onde o texto vai aparecer (ex: <h1>)
      this.palavras = palavras;      // Array de palavras/frases para digitar
      this.indicePalavra = 0;        // Qual palavra está sendo usada
      this.indiceChar = 0;           // Qual letra dentro da palavra
      this.apagando = false;         // Estado: true = apagando, false = digitando
      this.aguardando = false;       // Estado: esperando antes de apagar

      // Configurações (com valores padrão)
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

    // Função auxiliar para esperar (pausa)
    async esperar(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Função principal que controla a digitação
    async digitar() {
      if (!this.elemento) return;

      const palavraAtual = this.palavras[this.indicePalavra];

      // ESTADO: DIGITANDO (escrevendo letra por letra)
      if (!this.apagando && !this.aguardando) {
        if (this.indiceChar <= palavraAtual.length) {
          this.elemento.textContent = palavraAtual.substring(0, this.indiceChar);
          this.indiceChar++;

          let velocidade = this.opcoes.velocidadeDigitacao;
          if (this.opcoes.atrasoAleatorio) {
            velocidade += Math.random() * 50;  // pequena variação aleatória
          }

          setTimeout(() => this.digitar(), velocidade);
        } 
        // Palavra completa: aguarda antes de começar a apagar
        else {
          this.aguardando = true;
          let tempoEspera = this.opcoes.atrasoEntrePalavras;

          if (this.opcoes.atrasoAleatorio) {
            tempoEspera = this.opcoes.minAtrasoAleatorio + 
                          Math.random() * (this.opcoes.maxAtrasoAleatorio - this.opcoes.minAtrasoAleatorio);
          }

          setTimeout(() => {
            this.aguardando = false;
            this.apagando = true;
            this.digitar();
          }, tempoEspera);
        }
      } 
      // ESTADO: APAGANDO (removendo letra por letra)
      else if (this.apagando && !this.aguardando) {
        if (this.indiceChar > 0) {
          this.elemento.textContent = palavraAtual.substring(0, this.indiceChar - 1);
          this.indiceChar--;

          let velocidade = this.opcoes.velocidadeApagar;
          if (this.opcoes.atrasoAleatorio) {
            velocidade += Math.random() * 30;
          }

          setTimeout(() => this.digitar(), velocidade);
        } 
        // Palavra completamente apagada: passa para a próxima
        else {
          this.apagando = false;
          this.indicePalavra = (this.indicePalavra + 1) % this.palavras.length;
          setTimeout(() => this.digitar(), 300);
        }
      }
    }

    // Método para iniciar o efeito
    iniciar() {
      this.digitar();
    }
  }

  // Inicia o efeito de digitação após um pequeno atraso (para garantir que o elemento existe)
  setTimeout(() => {
    const titulo = document.getElementById('typing-title');
    if (titulo) {
      const palavras = [
        'Régis Farias',
        'Engenheiro Civil',
        'Projetos e Consultoria',
        'Engenharia com excelência e inovação',
        '"Projetos seguros, econômicos e totalmente executáveis, sempre focados na melhor solução para o cliente"',
        'Projeto que una segurança, economia e desempenho estrutural',
        'Acompanhamento de Obra',
        'Laudo Técnico'
      ];

      const efeito = new EfeitoDigitacao(titulo, palavras, {
        velocidadeDigitacao: 15,
        velocidadeApagar: 25,
        atrasoEntrePalavras: 10000,
        atrasoAleatorio: true,
        minAtrasoAleatorio: 4000,
        maxAtrasoAleatorio: 15000
      });

      efeito.iniciar();
    }
  }, 100);


  // 11. CONTADOR ANIMADO PARA AS ESTATÍSTICAS (anos, projetos, etc.)
  // -----------------------------------------------------------------
  function animarNumeros() {
    const numerosEstatisticas = document.querySelectorAll('.stat-number');

    numerosEstatisticas.forEach(stat => {
      const textoOriginal = stat.innerText;
      const ehAno = textoOriginal.includes('anos');
      const ehProjetos = textoOriginal.includes('Projetos');
      let valorFinal = 0;

      // Define qual número deve chegar conforme o texto
      if (ehAno) valorFinal = 5;
      else if (ehProjetos) valorFinal = 50;
      else valorFinal = 100;   // para percentuais

      let valorAtual = 0;
      const duracao = 2000;            // 2 segundos de animação
      const incremento = valorFinal / (duracao / 16); // atualiza a cada 16ms (~60fps)

      const contador = setInterval(() => {
        valorAtual += incremento;
        if (valorAtual >= valorFinal) {
          clearInterval(contador);
          valorAtual = valorFinal;
        }

        // Atualiza o texto com o número arredondado e a unidade
        if (ehAno) stat.innerText = Math.floor(valorAtual) + '+ anos';
        else if (ehProjetos) stat.innerText = Math.floor(valorAtual) + '+ projetos';
        else stat.innerText = Math.floor(valorAtual) + '%';
      }, 16);
    });
  }

  // Dispara a animação somente quando a seção de estatísticas aparecer na tela
  const secaoStats = document.querySelector('.stats');
  if (secaoStats) {
    const observadorStats = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          animarNumeros();               // começa a contar
          observadorStats.unobserve(entrada.target); // só precisa executar uma vez
        }
      });
    }, { threshold: 0.5 }); // 50% da seção visível

    observadorStats.observe(secaoStats);
  }

});
