import gsap from 'https://esm.sh/gsap@3.12.5';
import { ScrollTrigger } from 'https://esm.sh/gsap@3.12.5/ScrollTrigger';
import Lenis from 'https://esm.sh/lenis@1.1.2';

// Registrar o plugin ScrollTrigger no GSAP
gsap.registerPlugin(ScrollTrigger);

// Elementos da página e variáveis de controle
let nav, header, canvas, context, heroImage, lenis;
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
 * Inicializa a animação de scroll controlada pelo ScrollTrigger
 */
function initScrollAnimations() {
    // Configura o ScrollTrigger principal que fixa a seção hero
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: '+=700%', // Duração de 7 viewports de scroll para animação fluida
        pin: true,
        scrub: true,
        pinSpacing: true,
        onUpdate: (self) => {
            const progress = self.progress; // Progresso do scroll: 0 a 1

            // 1. Atualiza a sequência de frames do Canvas (Completa em 90% do scroll)
            const canvasProgress = Math.min(progress / 0.9, 1);
            const frameIndex = Math.max(1, Math.min(totalFrames, Math.round(canvasProgress * (totalFrames - 1) + 1)));
            currentFrameObj.frame = frameIndex;
            renderFrame(frameIndex);

            // 2. Animação da barra de navegação (Fade out nos primeiros 10% de scroll)
            if (progress <= 0.1) {
                const navOpacity = 1 - (progress / 0.1);
                nav.style.opacity = navOpacity;
                nav.style.pointerEvents = 'auto';
            } else {
                nav.style.opacity = 0;
                nav.style.pointerEvents = 'none';
            }

            // 3. Animação do Header 3D (Recua e esmaece até os 25% de scroll)
            if (progress <= 0.25) {
                const headerProgress = progress / 0.25; // 0 a 1
                const zTranslate = headerProgress * -1000; // Puxa de 0 a -1000px
                
                let opacity = 1;
                if (progress >= 0.20) {
                    // Efeito suave de fade out no final da sua transição 3D (entre 20% e 25%)
                    opacity = 1 - ((progress - 0.20) / 0.05);
                }
                
                header.style.transform = `translate3d(0, 0, ${zTranslate}px)`;
                header.style.opacity = opacity;
                header.style.visibility = 'visible';
            } else {
                header.style.opacity = 0;
                header.style.visibility = 'hidden';
            }

            // 4. Animação da Imagem do Dashboard (Surge entre 60% e 90% de scroll)
            if (progress >= 0.60 && progress <= 0.90) {
                const dashProgress = (progress - 0.60) / 0.30; // 0 a 1
                const zTranslate = (1 - dashProgress) * 800; // Move de 800px para 0px (plano normal)
                
                let opacity = 0;
                if (progress >= 0.60 && progress <= 0.80) {
                    // Fade in gradual nos primeiros 2/3 da transição (entre 60% e 80%)
                    opacity = (progress - 0.60) / 0.20;
                } else if (progress > 0.80) {
                    opacity = 1;
                }
                
                heroImage.style.transform = `translate3d(0, 0, ${zTranslate}px)`;
                heroImage.style.opacity = opacity;
                heroImage.style.pointerEvents = 'auto';
            } else if (progress < 0.60) {
                heroImage.style.opacity = 0;
                heroImage.style.transform = `translate3d(0, 0, 800px)`;
                heroImage.style.pointerEvents = 'none';
            } else if (progress > 0.90) {
                heroImage.style.opacity = 1;
                heroImage.style.transform = `translate3d(0, 0, 0px)`;
                heroImage.style.pointerEvents = 'auto';
            }
        }
    });
}

// Inicialização após o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Buscar elementos
    nav = document.getElementById('main-nav');
    header = document.querySelector('.header');
    canvas = document.getElementById('hero-canvas');
    context = canvas.getContext('2d');
    heroImage = document.querySelector('.hero-image');

    // Inicializar o canvas e mostrar indicador de carregamento
    resizeCanvas();
    
    context.fillStyle = '#c5a880';
    context.font = '300 20px Outfit, sans-serif';
    context.textAlign = 'center';
    context.fillText('Carregando Experiência LuxeDrive...', window.innerWidth / 2, window.innerHeight / 2);

    // Inicializar o Lenis (Smooth Scroll)
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing suave clássico
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
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
                    duration: 1.5,
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
