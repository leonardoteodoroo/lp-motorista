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
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.onload = img.onerror = () => {
                imagesLoadedCount++;
                if (imagesLoadedCount === totalFrames) {
                    resolve();
                }
            };
            img.src = getFramePath(i);
            images[i] = img;
        }
    });
}

/**
 * Desenha um frame no canvas simulando a propriedade CSS "object-fit: cover"
 */
function renderFrame(index) {
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
        
        let opacity, scale, yTranslate;
        
        if (localProgress <= 0.5) {
            // Entrada (primeira metade)
            const enterProgress = localProgress / 0.5; // 0 a 1
            opacity = enterProgress;
            scale = 0.85 + enterProgress * 0.15; // 0.85 a 1.0
            yTranslate = (1 - enterProgress) * 30; // 30px a 0px
        } else {
            // Saída (segunda metade)
            const exitProgress = (localProgress - 0.5) / 0.5; // 0 a 1
            opacity = 1 - exitProgress;
            scale = 1.0 + exitProgress * 0.15; // 1.0 a 1.15
            yTranslate = exitProgress * -30; // 0px a -30px
        }
        
        kwElement.style.opacity = opacity;
        kwElement.style.transform = `translate3d(0, ${yTranslate}px, 0) scale(${scale})`;
    } else {
        kwElement.style.opacity = 0;
        kwElement.style.transform = `translate3d(0, 30px, 0) scale(0.9)`;
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
            // 0. Animação da barra de navegação (Invisível no início, surge após a primeira dobra sumir)
            // ==========================================================================
            if (progress <= 0.12) {
                nav.style.opacity = 0;
                nav.style.pointerEvents = 'none';
            } else if (progress > 0.12 && progress <= 0.22) {
                // Fade-in gradual após o primeiro bloco sumir
                const navOpacity = (progress - 0.12) / 0.10;
                nav.style.opacity = navOpacity;
                nav.style.pointerEvents = navOpacity >= 0.5 ? 'auto' : 'none';
            } else {
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

// Inicialização após o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Buscar elementos dramáticos
    nav = document.getElementById('main-nav');
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

    // Configurar scroll suave ao clicar em links âncora internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
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
