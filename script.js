const sunPath = '<circle cx="12" cy="12" r="6"></circle>';
const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

/**
 * GESTION DU THÈME
 */
function updateIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                   (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.getElementById('theme-icon').innerHTML = isDark ? moonPath : sunPath;
}

function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    if (!current) { current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    updateIcon();
}

/**
 * VCard avec Photo et Horaires exacts
 */
async function downloadVCard() {
    const imageUrl = "logo.png"; // Chemin vers ton logo
    let base64Photo = "";

    try {
        // On récupère l'image et on la convertit en Base64
        const response = await fetch(imageUrl);
        const blobImg = await response.blob();
        base64Photo = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blobImg);
        });
    } catch (e) {
        console.error("L'image n'a pas pu être chargée pour la VCard", e);
    }

    // Préparation des horaires
    const horaires = "HORAIRES :\n" +
                     "Lun : Fermé / 14h00-19h00\n" +
                     "Mar-Ven : 09h00-12h00 / 14h00-19h00\n" +
                     "Sam : 09h00-12h00 / 14h00-18h00\n" +
                     "Dim : Fermé";

    // Construction de la VCard
    let vcard = "BEGIN:VCARD\n" +
                "VERSION:3.0\n" +
                "FN:SO'BÔHÈME\n" +
                "ORG:SO'BÔHÈME;\n" +
                "TEL;TYPE=WORK,VOICE:+33956918541\n" + // Format international corrigé
                "EMAIL:boutique.soboheme@gmail.com\n" +
                "ADR;TYPE=WORK:;;56 RUE DE LA REPUBLIQUE;Guebwiller;68500;France\n" +
                "URL:https://soboheme.github.io/Web/\n" +
                "NOTE:" + horaires.replace(/\r?\n/g, "\\n") + "\n";

    // Ajout de la photo
    if (base64Photo) {
        vcard += "PHOTO;ENCODING=b;TYPE=PNG:" + base64Photo + "\n";
    }

    vcard += "END:VCARD";

    // Téléchargement du fichier
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); 
    a.href = url; 
    a.download = "So_Boheme.vcf"; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Initialisation Theme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateIcon);
updateIcon();

/**
 * Horaires : Jour actuel
 */
function markCurrentDay() {
    const today = new Date().getDay(); 
    const activeRow = document.getElementById(`day-${today}`);
    if (activeRow) {
        activeRow.classList.add('is-today');
    }
}
window.addEventListener('DOMContentLoaded', markCurrentDay);

/**
 * Navigation Intelligente
 */
let lastScrollY = window.scrollY;

function handleSmartNav() {
    const nav = document.querySelector('.nav-container');
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 50) {
        nav.classList.remove('hidden');
        nav.classList.add('visible');
    } 
    else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        nav.classList.remove('visible');
        nav.classList.add('hidden');
    } 
    else if (currentScrollY < lastScrollY) {
        nav.classList.remove('hidden');
        nav.classList.add('visible');
    }
    lastScrollY = currentScrollY;
}

window.addEventListener('scroll', () => {
    window.requestAnimationFrame(handleSmartNav);
});
window.addEventListener('DOMContentLoaded', handleSmartNav);


/* ==========================================================
   GESTION VIDÉO (PROGRESSION UNIQUEMENT)
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('hero-video');
    const progressBar = document.getElementById('video-progress');
    const videoContainer = document.querySelector('.video-container');

    if(video && progressBar) {
        // Mise à jour de la barre de progression
        video.addEventListener('timeupdate', () => {
            const pct = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${pct}%`;
        });

        // Quand la vidéo boucle
        video.addEventListener('ended', () => {
            progressBar.style.width = '0%';
        });
        
        // Retirer le squelette de chargement quand prêt
        if (video.readyState >= 3) {
            if(videoContainer) videoContainer.classList.remove('skeleton');
        } else {
            video.addEventListener('canplay', () => {
                if(videoContainer) videoContainer.classList.remove('skeleton');
            });
        }
    }
});


/* ==========================================================
   GESTION CURSEUR, REVEAL, CARTES 3D
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Curseur
    const cursor = document.querySelector('.custom-cursor');
    if (cursor && window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        const linkElements = document.querySelectorAll('a, button, .fade-slide, .link-card, .video-container');
        linkElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
        document.addEventListener('mouseleave', () => cursor.style.display = 'none');
        document.addEventListener('mouseenter', () => cursor.style.display = 'block');
    }

    // 2. Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.05 });
    revealElements.forEach(el => revealObserver.observe(el));
});

// 3. Effet 3D Cartes
const cards = document.querySelectorAll('.link-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xRotation = ((y / rect.height) - 0.5) * -10;
        const yRotation = ((x / rect.width) - 0.5) * 10;
        
        card.style.transition = "none"; 
        card.style.transform = `perspective(1000px) scale(1.02) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transition = "transform 0.5s ease-out";
        card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
    });
});


/* ==========================================================
   LOGIQUE SLIDER (MODE FONDU / FADE)
   ========================================================== */
let sliderDots, sliderTotal;
let currentSlideIndex = 0;
let slideInterval;
let allSlides;

function initSlider() {
    allSlides = document.querySelectorAll('.fade-slide');
    sliderTotal = allSlides.length;
    const nav = document.getElementById('sliderNav');
    
    if (sliderTotal === 0) return;

    // Création des points de navigation
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
}

window.moveSlide = function(direction) {
    clearInterval(slideInterval);
    currentSlideIndex += direction;
    if (currentSlideIndex < 0) currentSlideIndex = sliderTotal - 1;
    if (currentSlideIndex >= sliderTotal) currentSlideIndex = 0;
    updateSliderFade();
    startAutoPlay();
};

function manualSlide(index) {
    clearInterval(slideInterval);
    currentSlideIndex = index;
    updateSliderFade();
    startAutoPlay();
}

function updateSliderFade() {
    if (!allSlides) return;
    
    // On ajoute/enlève la classe active pour le fondu
    allSlides.forEach((slide, index) => {
        if (index === currentSlideIndex) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // Mise à jour des points
    if(sliderDots) {
        sliderDots.forEach(d => d.classList.remove('active'));
        if(sliderDots[currentSlideIndex]) sliderDots[currentSlideIndex].classList.add('active');
    }
}

function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        currentSlideIndex++;
        if (currentSlideIndex >= sliderTotal) currentSlideIndex = 0;
        updateSliderFade();
    }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    startAutoPlay();

    // Gestion du clic pour voir l'image en grand
    if (allSlides) {
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
    }
});


/* ==========================================================
   COMPTE À REBOURS
   ========================================================== */
const targetDate = new Date("2026-02-07T09:09:00").getTime(); 

function lancerFete() {
    if (typeof confetti === "function") {
        const colors = ['#cab8a6', '#4a3f35', '#ffffff']; 
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: colors });
        setTimeout(() => {
            confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
            confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
        }, 300);
    }
}

function updateCountdown() {
    const box = document.getElementById('promo-countdown');
    const overlay = document.getElementById('final-countdown-overlay');
    const finalNumber = document.getElementById('final-number');
    
    if (!box) return;

    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
        if (overlay) overlay.style.display = 'none';
        if (!box.classList.contains('timer-finish')) {
            box.classList.add('timer-finish');
            lancerFete(); 
            setTimeout(() => {
                box.style.transition = "opacity 1s, transform 1s";
                box.style.opacity = "0";
                box.style.transform = "translateY(-20px)";
                setTimeout(() => box.style.display = "none", 1000);
            }, 5000);
        }
        return;
    }

    box.style.display = 'block';
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
    } else {
        if (overlay) overlay.style.display = 'none';
    }

    const vals = {
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
    };

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

document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    setInterval(updateCountdown, 1000);
});