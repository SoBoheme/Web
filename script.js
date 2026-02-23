/* ==========================================================
   1. CONSTANTES & CONFIGURATION GLOBALE
   ========================================================== */
const sunPath = '<circle cx="12" cy="12" r="6"></circle>';
const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

let currentSlideIndex = 0;
let slideInterval;
let allSlides;
let sliderDots;
let lastScrollY = window.scrollY;

/* ==========================================================
   2. GESTION DU THÈME (CLAIR / SOMBRE)
   ========================================================== */

function updateIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                   (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.innerHTML = isDark ? moonPath : sunPath;
}

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
   3. NAVIGATION (CACHE AU SCROLL)
   ========================================================== */

function handleSmartNav() {
    // On cible le bon conteneur : .nav-container
    const nav = document.querySelector('.nav-container'); 
    if (!nav) return;
    
    const currentScrollY = window.scrollY;

    // Si on descend de plus de 100px : on cache la pillule
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        nav.classList.add('nav-hidden');
    } 
    // Si on remonte : on la réaffiche
    else if (currentScrollY < lastScrollY) {
        nav.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
}

function markCurrentDay() {
    const today = new Date().getDay(); 
    const activeRow = document.getElementById(`day-${today}`);
    if (activeRow) activeRow.classList.add('is-today');
}

/* ==========================================================
   4. GESTION MÉDIA (VIDÉO & MODALE)
   ========================================================== */

function toggleVideoControl() {
    const video = document.getElementById('hero-video');
    if (!video) return;
    video.paused ? video.play() : video.pause();
}

window.closeModal = function() {
    const modal = document.getElementById('imagePreview');
    if (modal) modal.style.display = 'none';
};

/* ==========================================================
   5. LOGIQUE DU SLIDER (MODE FADE)
   ========================================================== */

function initSlider() {
    allSlides = document.querySelectorAll('.fade-slide');
    const nav = document.getElementById('sliderNav');
    if (!allSlides || !allSlides.length) return;

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

function updateSliderFade() {
    if (!allSlides) return;
    allSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentSlideIndex);
    });
    if (sliderDots) {
        sliderDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlideIndex);
        });
    }
}

window.moveSlide = function(direction) {
    clearInterval(slideInterval);
    currentSlideIndex = (currentSlideIndex + direction + allSlides.length) % allSlides.length;
    updateSliderFade();
    startAutoPlay();
};

function manualSlide(index) {
    clearInterval(slideInterval);
    currentSlideIndex = index;
    updateSliderFade();
    startAutoPlay();
}

function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        if (allSlides && allSlides.length) {
            currentSlideIndex = (currentSlideIndex + 1) % allSlides.length;
            updateSliderFade();
        }
    }, 4000);
}

/* ==========================================================
   6. EFFETS VISUELS (3D, REVEAL, CURSEUR)
   ========================================================== */

function initVisualEffects() {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    document.querySelectorAll('.link-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xRotation = -((y / rect.height) - 0.5) * 15;
            const yRotation = ((x / rect.width) - 0.5) * 15;
            card.style.transition = "transform 0.1s ease-out";
            card.style.transform = `perspective(1000px) scale(1.05) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
            card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
        });
    });

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

async function downloadVCard() {
    const imageUrl = "images/logo.png";
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
    "ORG:SO'BÔHÈME;Boutique de mode & accessoires",
    "TITLE:Boutique de mode féminine",
    "TEL;TYPE=CELL,VOICE:+33622411978",
    "TEL;TYPE=WORK,VOICE:+33956918541",
    "EMAIL:boutique.soboheme@gmail.com",
    "ADR;TYPE=WORK:;;56 RUE DE LA REPUBLIQUE;Guebwiller;68500;France",
    
    // Liens Web
    "URL:https://soboheme.github.io/Web/",
    "URL:https://linktr.ee/SoBoheme",
    
    // Notes avec Horaires
    "NOTE:Boutique de mode féminine & accessoires uniques à Guebwiller. ✨\\n\\n" +
    "HORAIRES D'OUVERTURE :\\n" +
    "Lundi : Fermé / 14h00 - 19h00\\n" +
    "Mardi : 09h00 - 12h00 / 14h00 - 19h00\\n" +
    "Mercredi : 09h00 - 12h00 / 14h00 - 19h00\\n" +
    "Jeudi : 09h00 - 12h00 / 14h00 - 19h00\\n" +
    "Vendredi : 09h00 - 12h00 / 14h00 - 19h00\\n" +
    "Samedi : 09h00 - 12h00 / 14h00 - 18h00\\n" +
    "Dimanche : Fermé",
    
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
   8. INITIALISATION GÉNÉRALE (DOM CONTENT LOADED)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    updateIcon();
    markCurrentDay();
    initSlider();
    initVisualEffects();
    
    // --- GESTION VIDÉO ---
    const video = document.getElementById('hero-video');
    const progressBar = document.getElementById('video-progress');
    const videoContainer = document.querySelector('.video-container');

    if (video) {
        const removeSkeleton = () => {
            if (videoContainer) videoContainer.classList.remove('skeleton');
        };

        video.addEventListener('loadeddata', removeSkeleton);
        video.addEventListener('playing', removeSkeleton);
        video.addEventListener('canplay', removeSkeleton);
        setTimeout(removeSkeleton, 2000);

        video.addEventListener('timeupdate', () => {
            if (progressBar && video.duration) {
                const percentage = (video.currentTime / video.duration) * 100;
                if (video.currentTime < 0.2) { 
                    progressBar.style.transition = "width 0.5s ease-in-out";
                    progressBar.style.width = '0%';
                } else {
                    progressBar.style.transition = "none";
                    progressBar.style.width = percentage + '%';
                }
            }
        });

        video.addEventListener('ended', () => {
            video.currentTime = 0;
            video.play();
        });

        video.play().catch(() => {});
    }

    // --- ÉVÉNEMENTS GLOBAUX ---
    window.addEventListener('scroll', () => window.requestAnimationFrame(handleSmartNav));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateIcon);
});