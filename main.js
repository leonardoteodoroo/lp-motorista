import gsap from 'https://esm.sh/gsap@3.12.5';
import { ScrollTrigger } from 'https://esm.sh/gsap@3.12.5/ScrollTrigger';
import Lenis from 'https://esm.sh/lenis@1.1.2';

// Registrar o plugin ScrollTrigger no GSAP
gsap.registerPlugin(ScrollTrigger);

// Elementos da página e variáveis de controle
let nav, canvas, context, lenis, heroOverlay;
let step1, step2, step3, step4, clientLogosContainer;
let kw1, kw2, kw3, kw4;

const totalFrames = 173;
const images = [];
let imagesLoadedCount = 0;
const currentFrameObj = { frame: 1 };

// Otimização Mobile: Se o dispositivo for celular (<768px), pula metade dos frames para economizar internet/memória
const isMobile = window.innerWidth < 768;
const frameStep = isMobile ? 2 : 1;

/**
 * Retorna o caminho de um frame com base no índice (ex: 0001.jpg a 0173.jpg)
 */
function getFramePath(index) {
    return `frames/${String(index).padStart(4, '0')}.jpg`;
}

/**
 * Redimensiona o canvas ajustando para a densidade de pixels do dispositivo (Retina)
 */
function resizeCanvas() {
    if (!canvas || !context) return;
    
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    
    // Escala o contexto para compensar a alta resolução do canvas
    context.scale(pixelRatio, pixelRatio);
    
    // Rerenderiza o frame atual para manter a proporção correta
    renderFrame(currentFrameObj.frame);
}

/**
 * Pré-carrega todos os frames da sequência de imagem na memória do navegador
 */
function preloadImages() {
    return new Promise((resolve) => {
        const framesToLoad = [];
        for (let i = 1; i <= totalFrames; i += frameStep) {
            framesToLoad.push(i);
        }
        
        const totalToLoad = framesToLoad.length;
        
        framesToLoad.forEach((i) => {
            const img = new Image();
            img.onload = img.onerror = () => {
                imagesLoadedCount++;
                if (imagesLoadedCount === totalToLoad) {
                    resolve();
                }
            };
            img.src = getFramePath(i);
            images[i] = img;
        });
    });
}

/**
 * Desenha um frame no canvas simulando a propriedade CSS "object-fit: cover"
 */
function renderFrame(index) {
    // No mobile, se o frame solicitado for par (não carregado), ajustamos para o frame ímpar anterior
    if (isMobile && !images[index]) {
        index = index - (index % 2 === 0 ? 1 : 0);
        index = Math.max(1, Math.min(totalFrames, index));
    }
    const img = images[index];
    if (!img || !img.complete || !context) return;

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    // Limpa o canvas antes de desenhar o novo frame
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calcula dimensões para manter a proporção (efeito cover)
    const imgWidth = img.width;
    const imgHeight = img.height;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        // Imagem é mais larga que a tela, escala pela altura
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
    } else {
        // Imagem é mais alta que a tela, escala pela largura
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
    }

    // Desenha a imagem no contexto escalado
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

/**
 * Auxiliar para animar uma palavra-chave individual na Fase 3
 */
function animateSingleKeyword(kwElement, start, end, progress) {
    if (progress >= start && progress <= end) {
        const range = end - start;
        const localProgress = (progress - start) / range; // 0 a 1
        
        // Efeito idêntico ao Título 1: zoom-out 3D (voa em direção à tela e cresce de 1.0 a 2.5)
        const opacity = 1 - localProgress;
        const scale = 1.0 + localProgress * 1.5; // de 1.0 a 2.5
        const zTranslate = localProgress * 800;  // de 0px a 800px
        
        kwElement.style.opacity = opacity;
        kwElement.style.transform = `translate3d(0, 0, ${zTranslate}px) scale(${scale})`;
        kwElement.style.visibility = 'visible';
    } else {
        kwElement.style.opacity = 0;
        kwElement.style.transform = `translate3d(0, 0, 0px) scale(1.0)`;
        kwElement.style.visibility = 'hidden';
    }
}

/**
 * Inicializa a animação de scroll controlada pelo ScrollTrigger
 */
function initScrollAnimations() {
    // Configura o ScrollTrigger principal que fixa a seção hero
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: '+=1500%', // Duração estendida para 15 viewports para desacelerar a sensibilidade da rolagem
        pin: true,
        scrub: true,
        pinSpacing: true,
        onUpdate: (self) => {
            const progress = self.progress; // Progresso do scroll: 0 a 1

            // ==========================================================================
            // 0. Animação da barra de navegação (Invisível no início e durante o vídeo, surge após o término)
            // ==========================================================================
            if (progress <= 0.90) {
                // Oculto durante todo o drama e a maior parte da reprodução do vídeo
                nav.style.opacity = 0;
                nav.style.pointerEvents = 'none';
            } else if (progress > 0.90 && progress <= 0.98) {
                // Surge por fade-in gradual no finalzinho da estrada
                const navOpacity = (progress - 0.90) / 0.08;
                nav.style.opacity = navOpacity;
                nav.style.pointerEvents = navOpacity >= 0.5 ? 'auto' : 'none';
            } else {
                // Fica 100% ativo após a conclusão do vídeo
                nav.style.opacity = 1;
                nav.style.pointerEvents = 'auto';
            }

            // ==========================================================================
            // 1. TÍTULO 1 (0.00 a 0.12) - "Transporte não é só chegar ao destino."
            // ==========================================================================
            if (progress <= 0.12) {
                const step1Progress = progress / 0.12; // 0 a 1
                const opacity = 1 - step1Progress;
                const scale = 1.0 + step1Progress * 1.5; // Zoom out (cresce na tela)
                const zTranslate = step1Progress * 800;  // Voa em direção à tela
                
                step1.style.opacity = opacity;
                step1.style.transform = `translate3d(0, 0, ${zTranslate}px) scale(${scale})`;
                step1.style.visibility = 'visible';
            } else {
                step1.style.opacity = 0;
                step1.style.visibility = 'hidden';
            }

            // ==========================================================================
            // 2. TÍTULO 2 (0.14 a 0.28) - "É como você se sente durante o caminho."
            // ==========================================================================
            if (progress >= 0.14 && progress <= 0.28) {
                step2.style.visibility = 'visible';
                
                if (progress >= 0.14 && progress <= 0.20) {
                    // Entrada: Surge de baixo para cima com fade
                    const enterProgress = (progress - 0.14) / 0.06;
                    const opacity = enterProgress;
                    const yTranslate = (1 - enterProgress) * 80;
                    
                    step2.style.opacity = opacity;
                    step2.style.transform = `translate3d(0, ${yTranslate}px, 0)`;
                    step2.style.filter = 'blur(0px)';
                } else if (progress > 0.20 && progress <= 0.22) {
                    // Destaque parado no centro
                    step2.style.opacity = 1;
                    step2.style.transform = 'translate3d(0, 0, 0)';
                    step2.style.filter = 'blur(0px)';
                } else if (progress > 0.22 && progress <= 0.28) {
                    // Efeito WOW de Saída: Dissolução 3D, blur progressivo e recuo para o fundo
                    const exitProgress = (progress - 0.22) / 0.06;
                    const opacity = 1 - exitProgress;
                    const zTranslate = exitProgress * -1000;
                    const blur = exitProgress * 25;
                    
                    step2.style.opacity = opacity;
                    step2.style.transform = `translate3d(0, 0, ${zTranslate}px)`;
                    step2.style.filter = `blur(${blur}px)`;
                }
            } else {
                step2.style.opacity = 0;
                step2.style.visibility = 'hidden';
            }

            // ==========================================================================
            // 3. PALAVRAS-CHAVE (0.31 a 0.46) - "Experiência. Conforto. Exclusividade. Pontualidade."
            // ==========================================================================
            if (progress >= 0.31 && progress <= 0.46) {
                step3.style.visibility = 'visible';
                step3.style.opacity = 1;

                // Anima cada palavra em sua respectiva mini-faixa de scroll
                animateSingleKeyword(kw1, 0.310, 0.345, progress);
                animateSingleKeyword(kw2, 0.345, 0.380, progress);
                animateSingleKeyword(kw3, 0.380, 0.415, progress);
                animateSingleKeyword(kw4, 0.415, 0.450, progress);
            } else {
                step3.style.opacity = 0;
                step3.style.visibility = 'hidden';
            }

            // ==========================================================================
            // 4. TÍTULO FORTE (0.48 a 0.60) - "Você merece mais do que uma corrida."
            // ==========================================================================
            if (progress >= 0.48 && progress <= 0.60) {
                step4.style.visibility = 'visible';
                
                if (progress >= 0.48 && progress <= 0.53) {
                    // Entrada: Efeito de impacto (escala encolhe até 1.0)
                    const enterProgress = (progress - 0.48) / 0.05;
                    const opacity = enterProgress;
                    const scale = 1.4 - enterProgress * 0.4; // 1.4 a 1.0
                    
                    step4.style.opacity = opacity;
                    step4.style.transform = `scale(${scale})`;
                } else if (progress > 0.53 && progress <= 0.56) {
                    // Destaque estático com leve pulso e brilho
                    step4.style.opacity = 1;
                    step4.style.transform = 'scale(1)';
                } else if (progress > 0.56 && progress <= 0.60) {
                    // Saída: Desaparece suavemente recuando
                    const exitProgress = (progress - 0.56) / 0.04;
                    const opacity = 1 - exitProgress;
                    const zTranslate = exitProgress * 400;
                    
                    step4.style.opacity = opacity;
                    step4.style.transform = `translate3d(0, 0, ${zTranslate}px)`;
                }
            } else {
                step4.style.opacity = 0;
                step4.style.visibility = 'hidden';
            }

            // ==========================================================================
            // 5. REPRODUÇÃO DO VÍDEO & OPACIDADE DO OVERLAY (0.60 a 0.98)
            // ==========================================================================
            let overlayOpacity = 1.0;

            if (progress <= 0.60) {
                // Durante toda a Fase de Drama, o vídeo fica travado no primeiro frame e o overlay escuro fica opaco (100%)
                currentFrameObj.frame = 1;
                renderFrame(1);
                overlayOpacity = 1.0;
            } else {
                // A partir daqui, a estrada avança conforme o scroll por todo o restante do hero
                const canvasProgress = Math.min((progress - 0.60) / 0.38, 1); // 0 a 1 em 38% de scroll (termina em ~0.98)
                const frameIndex = Math.max(1, Math.min(totalFrames, Math.round(canvasProgress * (totalFrames - 1) + 1)));
                currentFrameObj.frame = frameIndex;
                renderFrame(frameIndex);

                // Mapeamento de opacidade para o overlay:
                // Quando o vídeo começa a tocar (progress > 0.60), tiramos a opacidade RAPIDAMENTE até 0.1 (estrada nítida)
                // De 0.60 a 0.68 (8% do scroll total), a opacidade vai de 1.0 para 0.1.
                // De 0.68 a 0.90 (durante a estrada rodando), a opacidade fica em 0.1 (quase transparente).
                // De 0.90 a 0.98 (no finalzinho), a opacidade volta gradualmente para 1.0 para fazer o fade.
                if (progress > 0.60 && progress <= 0.68) {
                    const localProgress = (progress - 0.60) / 0.08;
                    overlayOpacity = 1.0 - (localProgress * 0.9); // 1.0 a 0.1
                } else if (progress > 0.68 && progress <= 0.90) {
                    overlayOpacity = 0.1;
                } else if (progress > 0.90 && progress <= 0.98) {
                    const localProgress = (progress - 0.90) / 0.08;
                    overlayOpacity = 0.1 + (localProgress * 0.9); // 0.1 a 1.0
                } else {
                    overlayOpacity = 1.0;
                }
            }

            // Aplica a opacidade calculada ao overlay do canvas
            if (heroOverlay) {
                heroOverlay.style.opacity = overlayOpacity;
            }

            // ==========================================================================
            // 6. LOGOS DE CLIENTES NO FINAL (0.80 a 0.98)
            // ==========================================================================
            if (progress >= 0.80) {
                const logosProgress = Math.min((progress - 0.80) / 0.18, 1); // 0 a 1 em 18% de scroll
                const opacity = logosProgress * 0.95;
                const yLogos = (1 - logosProgress) * 30; // Logos sobem 30px até a posição
                
                clientLogosContainer.style.opacity = opacity;
                clientLogosContainer.style.transform = `translate3d(-50%, ${yLogos}px, 0)`;
                clientLogosContainer.style.visibility = 'visible';
            } else {
                clientLogosContainer.style.opacity = 0;
                clientLogosContainer.style.transform = `translate3d(-50%, 30px, 0)`;
                clientLogosContainer.style.visibility = 'hidden';
            }
        }
    });
}

/**
 * Inicializa a seção de depoimentos interativos com efeito de máquina de escrever (typewriter) e áudio
 */
function initInteractiveTestimonials() {
    const testimonialsData = [
        {
            name: "Roberto S.",
            jobtitle: "Diretor Financeiro (CFO)",
            text: "O serviço da LuxeDrive redefiniu meu conceito de transporte corporativo. A pontualidade e a extrema discrição do motorista são indispensáveis para o meu dia a dia.",
            audio: "audio_1.mp3"
        },
        {
            name: "Carla M.",
            jobtitle: "CEO de Tech Venture",
            text: "Utilizamos o serviço para recepcionar investidores estrangeiros no aeroporto. A cortesia, os carros de luxo e a atenção aos detalhes geram a melhor primeira impressão possível.",
            audio: "audio_2.mp3"
        },
        {
            name: "Felipe D.",
            jobtitle: "Sócio em Advocacia Executiva",
            text: "Privacidade total. Posso fazer reuniões e ligações confidenciais no banco de trás sabendo que o profissional à frente segue rígidos padrões éticos. Vale cada centavo.",
            audio: "audio_3.mp3"
        }
    ];

    const bubble = document.getElementById('testimonial-bubble');
    const textWrapper = document.getElementById('typewriter-text');
    const authorName = document.getElementById('bubble-author-name');
    const authorTitle = document.getElementById('bubble-author-title');
    const avatarCards = document.querySelectorAll('.avatar-card');

    let activeAudio = null;
    let typewriterTimeout = null;

    function stopAudio() {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
            activeAudio = null;
        }
    }

    function stopTypewriter() {
        if (typewriterTimeout) {
            clearTimeout(typewriterTimeout);
            typewriterTimeout = null;
        }
    }

    function startTypewriter(text) {
        stopTypewriter();
        textWrapper.textContent = '';
        
        let i = 0;
        function type() {
            if (i <= text.length) {
                textWrapper.textContent = text.slice(0, i);
                i++;
                typewriterTimeout = setTimeout(type, 35); // Velocidade de digitação elegante
            }
        }
        type();
    }

    function activateTestimonial(index) {
        // Limpar estados anteriores
        stopAudio();
        stopTypewriter();

        // Remover classe ativa de todos
        avatarCards.forEach(c => c.classList.remove('active'));

        // Ativar o avatar selecionado
        avatarCards[index].classList.add('active');
        bubble.classList.add('active');

        // Configurar e tocar o novo áudio
        const audioFile = testimonialsData[index].audio;
        // Tenta tocar o áudio. Como pode não haver arquivos físicos, capturamos o erro graciosamente
        activeAudio = new Audio(`audio/${audioFile}`);
        activeAudio.play().catch(err => {
            console.warn("Áudio suspenso ou indisponível:", err);
        });

        // Atualizar informações do autor
        authorName.textContent = testimonialsData[index].name;
        authorTitle.textContent = testimonialsData[index].jobtitle;

        // Iniciar máquina de escrever
        startTypewriter(testimonialsData[index].text);
    }

    function deactivateTestimonial() {
        stopAudio();
        stopTypewriter();

        avatarCards.forEach(c => c.classList.remove('active'));
        bubble.classList.remove('active');

        // Restaurar estado neutro inicial
        textWrapper.textContent = "Selecione um de nossos clientes abaixo para ler e ouvir o depoimento...";
        authorName.textContent = "";
        authorTitle.textContent = "";
    }

    // Adicionar eventos aos avatares (Hover no desktop, Toque/Clique em tudo)
    avatarCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 1024) {
                activateTestimonial(index);
            }
        });

        card.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 1024) {
                deactivateTestimonial();
            }
        });

        card.addEventListener('click', (e) => {
            e.stopPropagation();
            activateTestimonial(index);
        });
    });

    // Permitir fechar o depoimento ao clicar fora no mobile
    document.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
            deactivateTestimonial();
        }
    });

    // Evitar propagação de clique de dentro do balão para não fechar no mobile
    bubble.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

/**
 * Inicializa o ciclo de texto animado (Animated Text Cycle) com efeito de mola e fade 3D
 */
function initTextCycle() {
    const words = [
        "Conforto",
        "Pontualidade",
        "Privacidade",
        "Exclusividade",
        "Segurança",
        "Tranquilidade"
    ];
    
    const wrapper = document.querySelector('.text-cycle-wrapper');
    const wordEl = document.getElementById('animated-text-cycle');
    
    if (!wrapper || !wordEl) return;
    
    // Criamos uma div invisível de medição para calcular a largura exata de cada palavra no mesmo estilo do título
    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'absolute';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.height = '0';
    measureDiv.style.overflow = 'hidden';
    measureDiv.style.whiteSpace = 'nowrap';
    measureDiv.className = 'section-title text-cycle-title'; // Herda a estilização de fonte do título
    measureDiv.style.fontFamily = getComputedStyle(wordEl).fontFamily;
    measureDiv.style.fontSize = getComputedStyle(wordEl).fontSize;
    measureDiv.style.fontWeight = getComputedStyle(wordEl).fontWeight;
    measureDiv.style.fontStyle = getComputedStyle(wordEl).fontStyle;
    measureDiv.style.letterSpacing = getComputedStyle(wordEl).letterSpacing;
    document.body.appendChild(measureDiv);
    
    let currentIndex = 0;
    
    // Define a largura inicial baseada na primeira palavra
    measureDiv.textContent = words[0];
    const initialWidth = measureDiv.getBoundingClientRect().width;
    wrapper.style.width = `${initialWidth}px`;
    wordEl.textContent = words[0];
    
    setInterval(() => {
        const nextIndex = (currentIndex + 1) % words.length;
        const nextWord = words[nextIndex];
        
        // 1. Calcular a largura da próxima palavra
        measureDiv.textContent = nextWord;
        const nextWidth = measureDiv.getBoundingClientRect().width;
        
        // 2. Aplicar a animação de saída à palavra atual
        wordEl.classList.add('exit');
        
        // 3. Após a palavra antiga sumir (250ms), trocamos o texto e iniciamos a entrada
        setTimeout(() => {
            // Atualiza o texto
            wordEl.textContent = nextWord;
            
            // Remove a classe de saída e adiciona a classe de entrada (posicionada acima)
            wordEl.classList.remove('exit');
            wordEl.classList.add('enter');
            
            // Ajusta a largura do contêiner com transição
            wrapper.style.width = `${nextWidth}px`;
            
            // Força um reflow para o navegador aplicar a classe 'enter' antes de animar
            wordEl.offsetHeight;
            
            // Remove a classe 'enter' para animar para a posição central de repouso
            wordEl.classList.remove('enter');
            
            currentIndex = nextIndex;
        }, 250);
        
}

/**
 * Inicializa os controles e interações do Header (scroll, menu hambúrguer mobile)
 */
function initHeader() {
    const header = document.getElementById('main-header');
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-item');

    if (!header || !toggleBtn || !mobileOverlay) return;

    // 1. Controle de Scroll (efeito encolher e blur)
    const handleScroll = () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Executar no load inicial

    // 2. Toggle do Menu Mobile
    const toggleMenu = (forceClose = false) => {
        const isOpen = forceClose ? false : !toggleBtn.classList.contains('open');
        
        if (isOpen) {
            toggleBtn.classList.add('open');
            mobileOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            if (lenis) lenis.stop();
        } else {
            toggleBtn.classList.remove('open');
            mobileOverlay.classList.remove('open');
            document.body.style.overflow = '';
            if (lenis) lenis.start();
        }
    };

    toggleBtn.addEventListener('click', () => toggleMenu());

    // Fechar menu mobile ao clicar em um link âncora
    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && href !== 'javascript:void(0)') {
                toggleMenu(true);
            }
        });
    });
}

/**
 * Inicializa a injeção sob demanda (lazy-load) e abertura do modal "Sobre Nós" & "Trabalhe Conosco"
 */
function initSobreNos() {
    const btnDesktop = document.getElementById('nav-link-sobre-nos');
    const btnMobile = document.getElementById('mobile-link-sobre-nos');
    const container = document.getElementById('sobre-nos-modal-container');
    let injected = false;

    if (!btnDesktop || !btnMobile || !container) return;

    const modalHtml = `
<div class="sobre-modal-overlay" id="sobre-modal">
    <div class="sobre-modal-content">
        <button class="sobre-modal-close" id="sobre-modal-close" aria-label="Fechar Modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <div class="sobre-header">
            <p class="modal-tagline">Nossa História</p>
            <h2 class="modal-title">Sobre Nós</h2>
        </div>

        <div class="sobre-grid">
            <!-- Bloco 1: O CEO -->
            <div class="sobre-row">
                <div class="sobre-img-container">
                    <img src="assets/ceo.png" alt="CEO LuxeDrive" loading="lazy">
                </div>
                <div class="sobre-text-block">
                    <h3>A Visão do Fundador</h3>
                    <p>Fundada por Leonardo Laureano, a LuxeDrive nasceu de uma inquietação: a mobilidade executiva precisava ir além de apenas transportar pessoas do ponto A ao ponto B com eficiência. Era preciso resgatar a arte do serviço de alfaiataria em transporte.</p>
                    <p>Com anos de experiência no mercado de alto padrão, Leonardo estruturou a empresa sob os pilares da discrição absoluta, pontualidade militar e atenção obsessiva aos detalhes. Cada viagem é pensada como um santuário de privacidade e conforto para os nossos clientes.</p>
                </div>
            </div>

            <div class="modal-divider"></div>

            <!-- Bloco 2: O Legado Familiar -->
            <div class="sobre-row reverse">
                <div class="sobre-text-block">
                    <h3>O Legado Familiar</h3>
                    <p>Para nós, segurança e cuidado não são termos corporativos: são valores de família. O zelo que dedicamos a cada passageiro é o mesmo que oferecemos aos nossos entes queridos em nosso próprio lar.</p>
                    <p>Nossa herança de confiança reside em entender que a vida de quem está em nosso banco de trás é o maior bem de alguém. Por isso, operamos com a máxima responsabilidade, garantindo que você chegue ao seu destino e retorne para sua família em total segurança e serenidade.</p>
                </div>
                <div class="sobre-img-container">
                    <img src="assets/ceo_familia.png" alt="Família do CEO" loading="lazy">
                </div>
            </div>

            <div class="modal-divider"></div>

            <!-- Bloco 3: Os Chauffeurs -->
            <div class="sobre-row">
                <div class="sobre-img-container">
                    <img src="assets/equipe.png" alt="Equipe LuxeDrive" loading="lazy">
                </div>
                <div class="sobre-text-block">
                    <h3>Nossos Chauffeurs Executivos</h3>
                    <p>Nossos motoristas não são apenas condutores: são verdadeiros concierges da estrada. Passando por um dos processos seletivos mais exigentes do país, cada profissional é treinado em direção defensiva de evasão, etiqueta corporativa e protocolo diplomático.</p>
                    <p>Todos os nossos motoristas são bilíngues, discretos e prontos para se adaptar à sua agenda dinâmica. A confidencialidade é protegida sob rígidos acordos de sigilo mútuo.</p>
                </div>
            </div>

            <div class="modal-divider"></div>

            <!-- Bloco 4: A Celebração do Sucesso -->
            <div class="sobre-row reverse">
                <div class="sobre-text-block">
                    <h3>Cultura de Excelência</h3>
                    <p>O sucesso de uma marca premium se constrói na união e no bem-estar de sua equipe. Na LuxeDrive, valorizamos e celebramos cada um de nossos colaboradores, promovendo uma cultura corporativa focada na dignidade profissional e no espírito de elite.</p>
                    <p>Celebramos nossos marcos juntos, vestindo nossa melhor versão e reafirmando o compromisso de sermos o melhor serviço de mobilidade executiva do Brasil. Essa dedicação reflete diretamente na sofisticação com que conduzimos você diariamente.</p>
                </div>
                <div class="sobre-img-container">
                    <img src="assets/equipe_gala.png" alt="Equipe LuxeDrive em Gala" loading="lazy">
                </div>
            </div>
        </div>

        <div class="modal-divider"></div>

        <!-- Seção Trabalhe Conosco -->
        <div class="trabalhe-secao">
            <h3>Trabalhe Conosco</h3>
            <p class="trabalhe-desc">Se você busca a excelência profissional e possui o perfil exigido para prestar serviços no mercado de altíssimo luxo, envie sua candidatura para nossa equipe operacional.</p>
            
            <div class="trabalhe-grid">
                <div class="requisitos-card">
                    <h4>Requisitos de Admissão</h4>
                    <ul class="requisitos-list">
                        <li>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            CNH Categoria B ou superior, com observação EAR (Exerce Atividade Remunerada) obrigatória.
                        </li>
                        <li>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Curso de transporte coletivo ou de passageiros atualizado e homologado.
                        </li>
                        <li>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Experiência comprovada mínima de 3 anos em transporte executivo, diplomático ou corporativo premium.
                        </li>
                        <li>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Nível de inglês básico a intermediário para recepção de estrangeiros (diferencial relevante).
                        </li>
                        <li>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Postura refinada, ética profissional impecável e vestimenta social completa (terno escuro e gravata).
                        </li>
                    </ul>
                </div>

                <div class="trabalhe-form">
                    <form id="trabalhe-conosco-form" class="contato-form">
                        <div class="form-group">
                            <label for="tc-name">Nome Completo</label>
                            <input type="text" id="tc-name" required placeholder="Seu nome completo">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="tc-email">E-mail</label>
                                <input type="email" id="tc-email" required placeholder="seuemail@provedor.com">
                            </div>
                            <div class="form-group">
                                <label for="tc-phone">WhatsApp / Telefone</label>
                                <input type="tel" id="tc-phone" required placeholder="(11) 99999-9999">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="tc-role">Cargo Pretendido</label>
                                <select id="tc-role">
                                    <option value="motorista">Chauffeur Executivo (Motorista)</option>
                                    <option value="concierge">Concierge / Recepção</option>
                                    <option value="suporte">Suporte Operacional</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="tc-file">Anexar Currículo (PDF/Word)</label>
                                <div class="file-upload-wrapper">
                                    <div class="file-upload-btn" id="file-upload-label">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        Selecionar Arquivo...
                                    </div>
                                    <input type="file" id="tc-file" required accept=".pdf,.doc,.docx">
                                </div>
                                <span class="file-name-display" id="file-name-display">Nenhum arquivo selecionado</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="tc-message">Resumo de Experiência & Apresentação</label>
                            <textarea id="tc-message" rows="3" required placeholder="Fale brevemente sobre sua experiência com carros de luxo e atendimento executivo..."></textarea>
                        </div>
                        <button type="submit" class="btn-submit" id="btn-submit-tc">Enviar Candidatura</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
    `;

    const openModal = () => {
        if (!injected) {
            container.innerHTML = modalHtml;
            injected = true;
            setupModalEvents();
        }

        const toggleBtn = document.getElementById('menu-toggle-btn');
        const mobileOverlay = document.getElementById('mobile-menu-overlay');
        if (toggleBtn && toggleBtn.classList.contains('open')) {
            toggleBtn.classList.remove('open');
            mobileOverlay.classList.remove('open');
        }

        const modal = document.getElementById('sobre-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (lenis) lenis.stop();
        }
    };

    const closeModal = () => {
        const modal = document.getElementById('sobre-modal');
        if (modal) {
            modal.classList.remove('active');
            const toggleBtn = document.getElementById('menu-toggle-btn');
            if (toggleBtn && !toggleBtn.classList.contains('open')) {
                document.body.style.overflow = '';
                if (lenis) lenis.start();
            }
        }
    };

    const setupModalEvents = () => {
        const modal = document.getElementById('sobre-modal');
        const closeBtn = document.getElementById('sobre-modal-close');
        const fileInput = document.getElementById('tc-file');
        const fileLabel = document.getElementById('file-upload-label');
        const fileNameDisplay = document.getElementById('file-name-display');
        const form = document.getElementById('trabalhe-conosco-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        if (fileInput && fileLabel && fileNameDisplay) {
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    const name = fileInput.files[0].name;
                    fileNameDisplay.textContent = name;
                    fileNameDisplay.style.display = 'block';
                    fileLabel.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Arquivo Selecionado
                    `;
                    fileLabel.style.borderColor = 'var(--accent-gold)';
                    fileLabel.style.color = 'var(--text-primary)';
                } else {
                    fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
                    fileNameDisplay.style.display = 'none';
                    fileLabel.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Selecionar Arquivo...
                    `;
                    fileLabel.style.borderColor = '';
                    fileLabel.style.color = '';
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('btn-submit-tc');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando Candidatura...';
                    submitBtn.style.opacity = '0.7';

                    setTimeout(() => {
                        alert('Candidatura enviada com sucesso! O departamento de Recursos Humanos da LuxeDrive entrará em contato após a triagem curricular.');
                        form.reset();
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Enviar Candidatura';
                        submitBtn.style.opacity = '';
                        if (fileLabel && fileNameDisplay) {
                            fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
                            fileNameDisplay.style.display = 'none';
                            fileLabel.innerHTML = `
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                Selecionar Arquivo...
                            `;
                            fileLabel.style.borderColor = '';
                            fileLabel.style.color = '';
                        }
                        closeModal();
                    }, 1500);
                }
            });
        }
    };

    btnDesktop.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    btnMobile.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
}

// Inicialização após o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Buscar elementos dramáticos
    nav = document.getElementById('main-header');
    canvas = document.getElementById('hero-canvas');
    context = canvas.getContext('2d');
    heroOverlay = document.getElementById('hero-overlay');
    
    step1 = document.querySelector('.step-1');
    step2 = document.querySelector('.step-2');
    step3 = document.querySelector('.step-3');
    step4 = document.querySelector('.step-4');
    clientLogosContainer = document.querySelector('.client-logos-container');
    
    kw1 = document.getElementById('kw-1');
    kw2 = document.getElementById('kw-2');
    kw3 = document.getElementById('kw-3');
    kw4 = document.getElementById('kw-4');

    // Inicializar o canvas e mostrar indicador de carregamento
    resizeCanvas();
    
    // Ocultar a navegação na primeira dobra inicialmente
    nav.style.opacity = 0;
    nav.style.pointerEvents = 'none';
    
    context.fillStyle = '#c5a880';
    context.font = '300 20px Outfit, sans-serif';
    context.textAlign = 'center';
    context.fillText('Carregando Experiência LuxeDrive...', window.innerWidth / 2, window.innerHeight / 2);

    // Inicializar o Lenis (Smooth Scroll - Calibrado para ser majestoso e menos sensível)
    lenis = new Lenis({
        duration: 2.2, // Aumentado para 2.2s para desaceleração muito mais suave e pesada (luxuosa)
        easing: (t) => 1 - Math.pow(1 - t, 5), // Quint-out para desaceleração suave e progressiva
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        wheelMultiplier: 0.65, // Reduzido de 1.0 para 0.65 para diminuir a sensibilidade da roda do mouse
        touchMultiplier: 1.5,
        infinite: false,
    });

    // Sincronizar o Lenis com a atualização do ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Conectar o Lenis com o ticker do GSAP para sincronia de frame perfeita
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // Desabilitar lagSmoothing para evitar "jumps" na animação do scroll
    gsap.ticker.lagSmoothing(0);

    // Pré-carregar todas as imagens
    await preloadImages();

    // Renderizar o primeiro frame
    renderFrame(1);

    // Inicializar o ScrollTrigger
    initScrollAnimations();

    // Inicializar os depoimentos interativos
    initInteractiveTestimonials();

    // Inicializar o ciclo de texto animado
    initTextCycle();

    // Inicializar controles de navegação (Header e Sobre Nós)
    initHeader();
    initSobreNos();

    // Configurar scroll suave ao clicar em links âncora internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === 'javascript:void(0)') return; // Ignora links vazios ou sem alvo
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                lenis.scrollTo(target, {
                    offset: 0,
                    duration: 1.8,
                    immediate: false
                });
            }
        });
    });

    // Resize Handler
    window.addEventListener('resize', () => {
        resizeCanvas();
        ScrollTrigger.refresh();
    });
});
