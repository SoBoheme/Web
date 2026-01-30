/* ==========================================================
   1. CONSTANTES & CONFIGURATION GLOBALE
   ========================================================== */
const sunPath = '<circle cx="12" cy="12" r="6"></circle>';
const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
const targetDate = new Date("2026-02-07T09:09:00").getTime();

let currentSlideIndex = 0;
let slideInterval;
let allSlides;
let sliderDots;
let lastScrollY = window.scrollY;

/* ==========================================================
   2. GESTION DU THÈME (CLAIR / SOMBRE)
   ========================================================== */

/**
 * Met à jour l'icône du bouton thème et surveille les préférences système
 */
function updateIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                   (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.innerHTML = isDark ? moonPath : sunPath;
}

/**
 * Alterne manuellement entre le mode clair et sombre
 */
function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    if (!current) {
        current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    updateIcon();
}

/* ==========================================================
   3. NAVIGATION & INTERFACE UTILISATEUR
   ========================================================== */

/**
 * Gère l'affichage dynamique de la barre de navigation au scroll
 */
function handleSmartNav() {
    const nav = document.querySelector('.nav-container');
    if (!nav) return;
    
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 50) {
        nav.classList.remove('hidden');
        nav.classList.add('visible');
    } else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        nav.classList.remove('visible');
        nav.classList.add('hidden');
    } else if (currentScrollY < lastScrollY) {
        nav.classList.remove('hidden');
        nav.classList.add('visible');
    }
    lastScrollY = currentScrollY;
}

/**
 * Marque le jour actuel dans le tableau des horaires
 */
function markCurrentDay() {
    const today = new Date().getDay(); 
    const activeRow = document.getElementById(`day-${today}`);
    if (activeRow) activeRow.classList.add('is-today');
}

/* ==========================================================
   4. GESTION MÉDIA (VIDÉO & MODALE)
   ========================================================== */

/**
 * Contrôle la lecture/pause de la vidéo principale
 */
function toggleVideoControl() {
    const video = document.getElementById('hero-video');
    if (!video) return;
    video.paused ? video.play() : video.pause();
}

/**
 * Ferme la modale de prévisualisation d'image
 */
window.closeModal = function() {
    const modal = document.getElementById('imagePreview');
    if (modal) modal.style.display = 'none';
};

/* ==========================================================
   5. LOGIQUE DU SLIDER (MODE FADE)
   ========================================================== */

/**
 * Initialise le slider, les points de navigation et les événements de clic
 */
function initSlider() {
    allSlides = document.querySelectorAll('.fade-slide');
    const nav = document.getElementById('sliderNav');
    if (!allSlides.length) return;

    if (nav) {
        nav.innerHTML = ''; 
        allSlides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('nav-dot');
            if (i === 0) dot.classList.add('active');
            dot.onclick = () => manualSlide(i);
            nav.appendChild(dot);
        });
        sliderDots = document.querySelectorAll('.nav-dot');
    }

    allSlides.forEach(img => {
        img.onclick = () => {
            const modal = document.getElementById('imagePreview');
            const fullImg = document.getElementById('fullImg');
            if (modal && fullImg) {
                modal.style.display = 'flex';
                fullImg.src = img.src;
            }
        };
    });
    startAutoPlay();
}

/**
 * Met à jour l'affichage des slides et des points de navigation
 */
function updateSliderFade() {
    allSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentSlideIndex);
    });
    if (sliderDots) {
        sliderDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlideIndex);
        });
    }
}

/**
 * Change de slide manuellement (Flèches)
 */
window.moveSlide = function(direction) {
    clearInterval(slideInterval);
    currentSlideIndex = (currentSlideIndex + direction + allSlides.length) % allSlides.length;
    updateSliderFade();
    startAutoPlay();
};

/**
 * Accède à une slide spécifique via les points
 */
function manualSlide(index) {
    clearInterval(slideInterval);
    currentSlideIndex = index;
    updateSliderFade();
    startAutoPlay();
}

/**
 * Lance le cycle automatique du slider
 */
function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % allSlides.length;
        updateSliderFade();
    }, 4000);
}

/* ==========================================================
   6. EFFETS VISUELS (3D, REVEAL, CURSEUR)
   ========================================================== */

/**
 * Initialise les observateurs de scroll et les effets de mouvement
 */
function initVisualEffects() {
    // Scroll Reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Cartes 3D - Correction fluidité entrée/mouvement/sortie
    document.querySelectorAll('.link-card').forEach(card => {
        // Au moment où la souris entre, on force une transition fluide
        card.addEventListener('mouseenter', () => {
            card.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xRotation = -((y / rect.height) - 0.5) * 15;
            const yRotation = ((x / rect.width) - 0.5) * 15;
            
            // On remplace "none" par 0.1s pour lisser le mouvement sans latence
            card.style.transition = "transform 0.1s ease-out";
            card.style.transform = `perspective(1000px) scale(1.05) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            // Retour élastique fluide à la position initiale
            card.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
            card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
        });
    });

    // Curseur personnalisé
    const cursor = document.querySelector('.custom-cursor');
    if (cursor && window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.querySelectorAll('a, button, .fade-slide, .link-card, .video-container').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    }
}

/* ==========================================================
   7. GÉNÉRATION DE LA VCARD
   ========================================================== */

/**
 * Crée et télécharge le fichier contact .vcf avec logo intégré
 */
async function downloadVCard() {
    const imageUrl = "logo.png";
    let base64Photo = "";
    try {
        const response = await fetch(imageUrl);
        const blobImg = await response.blob();
        base64Photo = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blobImg);
        });
    } catch (e) { console.error("Erreur chargement logo VCard", e); }

    const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "FN:SO'BÔHÈME",
        "TEL;TYPE=WORK,VOICE:+33956918541",
        "EMAIL:boutique.soboheme@gmail.com",
        "ADR;TYPE=WORK:;;56 RUE DE LA REPUBLIQUE;Guebwiller;68500;France",
        "URL:https://soboheme.github.io/Web/",
        base64Photo ? `PHOTO;ENCODING=b;TYPE=PNG:${base64Photo}` : "",
        "END:VCARD"
    ].filter(Boolean).join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "So_Boheme.vcf";
    a.click();
    window.URL.revokeObjectURL(url);
}

/* ==========================================================
   8. INITIALISATION GÉNÉRALE
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    updateIcon();
    markCurrentDay();
    initSlider();
    initVisualEffects();
    
    // Gestion Vidéo
    const video = document.getElementById('hero-video');
    const progressBar = document.getElementById('video-progress');
    const videoContainer = document.querySelector('.video-container');

    if (video) {
        video.addEventListener('timeupdate', () => {
            if (progressBar) progressBar.style.width = (video.currentTime / video.duration) * 100 + '%';
        });
        
        if (video.readyState >= 3) {
            videoContainer?.classList.remove('skeleton');
        } else {
            video.addEventListener('canplay', () => videoContainer?.classList.remove('skeleton'));
        }
        video.play().catch(() => console.log("Lancement automatique bloqué"));
    }

    // Evenements globaux
    window.addEventListener('scroll', () => window.requestAnimationFrame(handleSmartNav));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateIcon);
    
    // Initialisation Countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);
});

/* ==========================================================
   9. BLOC COMPTE À REBOURS (SÉPARÉ)
   ========================================================== */

/**
 * Déclenche l'effet de confettis lors de la fin du compte à rebours
 */
function lancerFete() {
    if (typeof confetti === "function") {
        const colors = ['#cab8a6', '#4a3f35', '#ffffff']; 
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: colors });
    }
}

/**
 * Calcule et affiche le temps restant jusqu'à l'événement cible
 */
function updateCountdown() {
    const box = document.getElementById('promo-countdown');
    const overlay = document.getElementById('final-countdown-overlay');
    const finalNumber = document.getElementById('final-number');
    if (!box) return;

    const now = new Date().getTime();
    const distance = targetDate - now;

    // Si le temps est écoulé
    if (distance <= 0) {
        if (overlay) overlay.style.display = 'none';
        if (!box.classList.contains('timer-finish')) {
            box.classList.add('timer-finish');
            lancerFete(); 
            setTimeout(() => {
                box.style.opacity = "0";
                setTimeout(() => box.style.display = "none", 1000);
            }, 5000);
        }
        return;
    }

    // Gestion de l'overlay des 10 dernières secondes
    const secondsTotal = Math.floor(distance / 1000);
    if (secondsTotal <= 10 && secondsTotal > 0) {
        if (overlay) {
            overlay.style.display = 'flex';
            if (finalNumber && finalNumber.innerText !== secondsTotal.toString()) {
                finalNumber.innerText = secondsTotal;
                finalNumber.classList.remove('digit-pop');
                void finalNumber.offsetWidth; 
                finalNumber.classList.add('digit-pop');
            }
        }
    } else if (overlay) {
        overlay.style.display = 'none';
    }

    // Calcul des unités
    const vals = {
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
    };

    // Mise à jour des chiffres avec animation
    for (const [unit, value] of Object.entries(vals)) {
        const strValue = value.toString().padStart(2, '0');
        for (let i = 0; i < 2; i++) {
            const element = document.getElementById(unit + (i + 1));
            if (element && element.innerText !== strValue[i]) {
                element.innerText = strValue[i];
                element.classList.remove('slide-digit');
                void element.offsetWidth; 
                element.classList.add('slide-digit');
            }
        }
    }
}